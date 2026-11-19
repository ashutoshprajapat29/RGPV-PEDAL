import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const bikeId = searchParams.get("bikeId");
    const email = searchParams.get("email");

    const where: any = {};
    if (status) where.status = status;
    if (bikeId) where.bikeId = bikeId;
    if (email) {
      const cleanSearch = email.replace(/\D/g, "");
      where.OR = [
        { customerEmail: { contains: email } },
        { customerPhone: { contains: cleanSearch || email } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        bike: {
          include: {
            images: {
              where: { isPrimary: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { bookings },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bikeId,
      customerName,
      customerPhone,
      startTime,
      endTime,
      paymentMethod,
      addonsAmount,
      pickupNotes,
    } = body;

    // 1. Required fields
    if (!bikeId || !customerName || !customerPhone || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Please provide all required fields (Bicycle, Name, WhatsApp Mobile, Timing)." },
        { status: 400 }
      );
    }

    // 2. Name validation
    const trimmedName = String(customerName).trim();
    if (trimmedName.length < 2 || trimmedName.length > 70) {
      return NextResponse.json(
        { error: "Please enter a valid student name (between 2 and 70 characters)." },
        { status: 400 }
      );
    }

    // 3. Mobile phone validation (Indian 10-digit number)
    const digitsOnly = String(customerPhone).replace(/\D/g, "");
    const cleanPhone = digitsOnly.length === 12 && digitsOnly.startsWith("91") ? digitsOnly.slice(2) : digitsOnly;
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    // 4. Time interval validation
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date or time format provided." },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { error: "Return time must be after pickup time (minimum 1 hour rental)." },
        { status: 400 }
      );
    }

    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (diffHours > 24) {
      return NextResponse.json(
        { error: "Maximum single booking is 24 hours. For long-term rentals, please contact the campus cycle stand." },
        { status: 400 }
      );
    }

    const bike = await prisma.bike.findUnique({
      where: { id: bikeId },
    });

    if (!bike) {
      return NextResponse.json({ error: "Bicycle not found." }, { status: 404 });
    }

    if (bike.status === "MAINTENANCE" || bike.status === "RETIRED") {
      return NextResponse.json(
        { error: "This bicycle is currently under maintenance or unavailable for rent." },
        { status: 400 }
      );
    }

    // 5. Strict Overlap Collision Check
    // Checks both confirmed/active bookings AND fresh pending requests (<30 min)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const existingConflict = await prisma.booking.findFirst({
      where: {
        bikeId,
        startTime: { lt: end },
        endTime: { gt: start },
        OR: [
          { status: { in: ["CONFIRMED", "ACTIVE"] } },
          {
            status: "PENDING",
            createdAt: { gte: thirtyMinutesAgo },
          },
        ],
      },
    });

    if (existingConflict) {
      return NextResponse.json(
        {
          error: "Selected cycle is already reserved for this timing. Please choose a different hour or another cycle.",
        },
        { status: 409 }
      );
    }

    const totalHours = Math.max(1, Math.round(diffHours * 10) / 10);
    const hourlyRateApplied = bike.hourlyRate;
    const extraAddons = Number(addonsAmount) || 0;
    const deposit = Number(bike.securityDeposit) || 0;
    const rentalBaseCost = Math.round(totalHours * hourlyRateApplied);
    const totalAmount = rentalBaseCost + extraAddons + deposit;

    const bookingNumber = `BK-${Math.floor(100000 + Math.random() * 900000)}`;

    // Bookings created via WhatsApp are initiated as PENDING until stand manager confirms
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        bikeId,
        customerName: trimmedName,
        customerEmail: `${cleanPhone}@rgpv.campus`,
        customerPhone: cleanPhone,
        startTime: start,
        endTime: end,
        totalHours,
        hourlyRateApplied,
        addonsAmount: extraAddons,
        securityDeposit: deposit,
        totalAmount,
        status: "PENDING", // PENDING -> CONFIRMED -> ACTIVE -> COMPLETED (or CANCELLED)
        paymentMethod: paymentMethod || "UPI_AT_STAND",
        paymentStatus: "PENDING",
        pickupNotes: pickupNotes ? String(pickupNotes).slice(0, 200) : null,
      },
      include: {
        bike: {
          include: {
            images: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, booking },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "Failed to process booking." }, { status: 500 });
  }
}
