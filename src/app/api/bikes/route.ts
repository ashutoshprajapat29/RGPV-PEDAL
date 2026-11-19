import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const isElectricParam = searchParams.get("isElectric");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (isElectricParam !== null && isElectricParam !== undefined && isElectricParam !== "") {
      where.isElectric = isElectricParam === "true";
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const bikes = await prisma.bike.findMany({
      where,
      include: {
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bikes });
  } catch (error) {
    console.error("Failed to fetch bikes:", error);
    return NextResponse.json({ error: "Failed to fetch bicycles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    // Validation
    const trimmedName = String(name || "").trim();
    if (trimmedName.length < 3) {
      return NextResponse.json(
        { error: "Cycle name must be at least 3 characters long." },
        { status: 400 }
      );
    }

    const parsedRate = parseFloat(hourlyRate);
    if (isNaN(parsedRate) || parsedRate <= 0) {
      return NextResponse.json(
        { error: "Hourly rental rate must be a valid positive number greater than 0." },
        { status: 400 }
      );
    }

    const parsedDeposit = securityDeposit !== undefined ? parseFloat(securityDeposit) : 0;
    if (isNaN(parsedDeposit) || parsedDeposit < 0) {
      return NextResponse.json(
        { error: "Security deposit cannot be negative." },
        { status: 400 }
      );
    }

    const parsedGears = Number(gearCount) || 1;
    if (parsedGears < 1 || parsedGears > 30) {
      return NextResponse.json(
        { error: "Gear count must be between 1 and 30." },
        { status: 400 }
      );
    }

    const createdBike = await prisma.bike.create({
      data: {
        name: trimmedName,
        brand: brand ? String(brand).trim() : "Hero",
        model: model ? String(model).trim() : "Standard",
        type: type || "Mountain",
        frameSize: frameSize || "M",
        gearCount: parsedGears,
        isElectric: Boolean(isElectric),
        batteryRangeKm: isElectric && batteryRangeKm ? Math.max(1, Number(batteryRangeKm)) : null,
        hourlyRate: parsedRate,
        securityDeposit: parsedDeposit,
        status: status || "AVAILABLE",
        description: description ? String(description).trim() : "",
        location: location || "RGPV Main Gate Cycle Stand",
        images: {
          create: (images || []).map((img: any, idx: number) => ({
            url: img.url,
            isPrimary: Boolean(img.isPrimary ?? (idx === 0)),
            caption: img.caption || null,
            sortOrder: img.sortOrder ?? idx,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({ success: true, bike: createdBike }, { status: 201 });
  } catch (error) {
    console.error("Failed to create bike:", error);
    return NextResponse.json({ error: "Failed to create bicycle" }, { status: 500 });
  }
}
