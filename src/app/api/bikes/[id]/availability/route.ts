import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD

    const targetDate = dateParam ? parseISO(dateParam) : new Date();
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // Find all bookings for this bike that overlap with targetDate
    const existingBookings = await prisma.booking.findMany({
      where: {
        bikeId: id,
        status: { in: ["CONFIRMED", "ACTIVE"] },
        startTime: { lte: dayEnd },
        endTime: { gte: dayStart },
      },
      select: {
        id: true,
        bookingNumber: true,
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    // Compute booked hours (0 to 23)
    const bookedHourSlots: number[] = [];
    for (const b of existingBookings) {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);

      // Determine which hours between 0..23 overlap
      for (let h = 0; h < 24; h++) {
        const slotStart = new Date(targetDate);
        slotStart.setHours(h, 0, 0, 0);
        const slotEnd = new Date(targetDate);
        slotEnd.setHours(h + 1, 0, 0, 0);

        if (bStart < slotEnd && bEnd > slotStart) {
          if (!bookedHourSlots.includes(h)) {
            bookedHourSlots.push(h);
          }
        }
      }
    }

    return NextResponse.json({
      date: dateParam || new Date().toISOString().split("T")[0],
      bookings: existingBookings,
      bookedHours: bookedHourSlots.sort((a, b) => a - b),
    });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}
