import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json({ booking });
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
      where: { id },
      data: dataToUpdate,
      include: {
        bike: {
          include: {
            images: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
