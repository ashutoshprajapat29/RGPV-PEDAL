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
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id }, { bookingNumber: id }],
      },
      include: {
        bike: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking voucher not found" }, { status: 404 });
    }

    return NextResponse.json(
      { booking },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Fetch booking error:", error);
    return NextResponse.json({ error: "Failed to fetch booking details" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, paymentStatus, returnNotes, pickupNotes } = body;

    // Find the existing booking first
    const existing = await prisma.booking.findFirst({
      where: {
        OR: [{ id }, { bookingNumber: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (status) {
      dataToUpdate.status = status;
      if (status === "COMPLETED") {
        dataToUpdate.actualReturnTime = new Date();
      }
    }
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;
    if (returnNotes !== undefined) dataToUpdate.returnNotes = returnNotes;
    if (pickupNotes !== undefined) dataToUpdate.pickupNotes = pickupNotes;

    const updatedBooking = await prisma.booking.update({
      where: { id: existing.id },
      data: dataToUpdate,
      include: {
        bike: {
          include: {
            images: true,
          },
        },
      },
    });

    // Synchronize Bike status with booking state changes
    if (status === "ACTIVE") {
      // Cycle is handed over to student -> Mark bike as RENTED
      await prisma.bike.update({
        where: { id: existing.bikeId },
        data: { status: "RENTED" },
      });
    } else if (status === "COMPLETED" || status === "CANCELLED") {
      // Check if there are other active rentals for this bike right now
      const otherActive = await prisma.booking.findFirst({
        where: {
          bikeId: existing.bikeId,
          id: { not: existing.id },
          status: "ACTIVE",
        },
      });

      if (!otherActive) {
        // Revert bike status to AVAILABLE if not in maintenance
        const currentBike = await prisma.bike.findUnique({ where: { id: existing.bikeId } });
        if (currentBike && currentBike.status !== "MAINTENANCE") {
          await prisma.bike.update({
            where: { id: existing.bikeId },
            data: { status: "AVAILABLE" },
          });
        }
      }
    }

    return NextResponse.json(
      { success: true, booking: updatedBooking },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
