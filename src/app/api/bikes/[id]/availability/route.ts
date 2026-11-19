import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD

    // Default to today's date in IST if not provided
    const targetDateStr =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

    // Deterministic IST day boundary (00:00:00 to 23:59:59.999 IST)
    const dayStart = new Date(`${targetDateStr}T00:00:00+05:30`);
    const dayEnd = new Date(`${targetDateStr}T23:59:59.999+05:30`);

    // Only consider PENDING bookings created within the last 30 minutes as holding a slot
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Find all active, confirmed, or fresh pending bookings for this bike overlapping this IST day
    const existingBookings = await prisma.booking.findMany({
      where: {
        bikeId: id,
        startTime: { lte: dayEnd },
        endTime: { gte: dayStart },
        OR: [
          { status: { in: ["CONFIRMED", "ACTIVE"] } },
          {
            status: "PENDING",
            createdAt: { gte: thirtyMinutesAgo },
          },
        ],
      },
      select: {
        id: true,
        bookingNumber: true,
        startTime: true,
        endTime: true,
        status: true,
        createdAt: true,
      },
    });

    // Compute booked hours (7 to 21) based on IST slots
    const bookedHourSlots: number[] = [];
    for (const b of existingBookings) {
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();

      for (let h = 0; h < 24; h++) {
        const slotStartStr = `${targetDateStr}T${String(h).padStart(2, "0")}:00:00+05:30`;
        const slotStart = new Date(slotStartStr).getTime();

        let slotEnd: number;
        if (h === 23) {
          // Next day 00:00 IST
          const nextDay = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
          const nextDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(nextDay);
          slotEnd = new Date(`${nextDateStr}T00:00:00+05:30`).getTime();
        } else {
          slotEnd = new Date(`${targetDateStr}T${String(h + 1).padStart(2, "0")}:00:00+05:30`).getTime();
        }

        // Overlap condition
        if (bStart < slotEnd && bEnd > slotStart) {
          if (!bookedHourSlots.includes(h)) {
            bookedHourSlots.push(h);
          }
        }
      }
    }

    return NextResponse.json(
      {
        date: targetDateStr,
        bookings: existingBookings,
        bookedHours: bookedHourSlots.sort((a, b) => a - b),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}
