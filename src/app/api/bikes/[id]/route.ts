import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bike = await prisma.bike.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        },
        bookings: {
          where: {
            status: { in: ["CONFIRMED", "ACTIVE"] },
            endTime: { gte: new Date() },
          },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
    });

    if (!bike) {
      return NextResponse.json({ error: "Bicycle not found" }, { status: 404 });
    }

    return NextResponse.json(
      { bike },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch bike details:", error);
    return NextResponse.json({ error: "Failed to fetch bicycle details" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      brand,
      model,
      type,
      frameSize,
      gearCount,
      isElectric,
      batteryRangeKm,
      hourlyRate,
      securityDeposit,
      status,
      description,
      location,
      images,
    } = body;

    const dataToUpdate: any = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (trimmedName.length < 3) {
        return NextResponse.json({ error: "Cycle name must be at least 3 characters long." }, { status: 400 });
      }
      dataToUpdate.name = trimmedName;
    }

    if (hourlyRate !== undefined) {
      const parsedRate = parseFloat(hourlyRate);
      if (isNaN(parsedRate) || parsedRate <= 0) {
        return NextResponse.json({ error: "Hourly rate must be a positive number." }, { status: 400 });
      }
      dataToUpdate.hourlyRate = parsedRate;
    }

    if (securityDeposit !== undefined) {
      const parsedDeposit = parseFloat(securityDeposit);
      if (isNaN(parsedDeposit) || parsedDeposit < 0) {
        return NextResponse.json({ error: "Security deposit cannot be negative." }, { status: 400 });
      }
      dataToUpdate.securityDeposit = parsedDeposit;
    }

    if (gearCount !== undefined) {
      const parsedGears = Number(gearCount);
      if (parsedGears < 1 || parsedGears > 30) {
        return NextResponse.json({ error: "Gears must be between 1 and 30." }, { status: 400 });
      }
      dataToUpdate.gearCount = parsedGears;
    }

    if (brand !== undefined) dataToUpdate.brand = String(brand).trim();
    if (model !== undefined) dataToUpdate.model = String(model).trim();
    if (type !== undefined) dataToUpdate.type = type;
    if (frameSize !== undefined) dataToUpdate.frameSize = frameSize;
    if (isElectric !== undefined) dataToUpdate.isElectric = Boolean(isElectric);
    if (batteryRangeKm !== undefined) {
      dataToUpdate.batteryRangeKm = batteryRangeKm ? Math.max(1, Number(batteryRangeKm)) : null;
    }
    if (status !== undefined) dataToUpdate.status = status;
    if (description !== undefined) dataToUpdate.description = String(description).trim();
    if (location !== undefined) dataToUpdate.location = String(location).trim();

    await prisma.bike.update({
      where: { id },
      data: dataToUpdate,
    });

    if (images && Array.isArray(images)) {
      await prisma.bikeImage.deleteMany({ where: { bikeId: id } });
      if (images.length > 0) {
        await prisma.bikeImage.createMany({
          data: images.map((img: any, idx: number) => ({
            bikeId: id,
            url: img.url,
            isPrimary: Boolean(img.isPrimary ?? (idx === 0)),
            caption: img.caption || null,
            sortOrder: img.sortOrder ?? idx,
          })),
        });
      }
    }

    const fullBike = await prisma.bike.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        },
      },
    });

    return NextResponse.json({ success: true, bike: fullBike });
  } catch (error) {
    console.error("Failed to update bike:", error);
    return NextResponse.json({ error: "Failed to update bicycle" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.bikeImage.deleteMany({ where: { bikeId: id } });
    await prisma.booking.deleteMany({ where: { bikeId: id } });
    await prisma.bike.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Bicycle deleted successfully" });
  } catch (error) {
    console.error("Failed to delete bike:", error);
    return NextResponse.json({ error: "Failed to delete bicycle" }, { status: 500 });
  }
}
