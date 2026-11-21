import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import BikeGallery from "@/components/gallery/BikeGallery";
import HourlyBookingWidget from "@/components/booking/HourlyBookingWidget";
import {
  ArrowLeft,
  Zap,
  MapPin,
  CheckCircle2,
} from "lucide-react";

async function getInitialBookedHours(bikeId: string, dateStr: string) {
  try {
    const dayStart = new Date(`${dateStr}T00:00:00+05:30`);
    const dayEnd = new Date(`${dateStr}T23:59:59.999+05:30`);
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const bookings = await prisma.booking.findMany({
      where: {
        bikeId,
        startTime: { lte: dayEnd },
        endTime: { gte: dayStart },
        OR: [
          { status: { in: ["CONFIRMED", "ACTIVE"] } },
          { status: "PENDING", createdAt: { gte: thirtyMinutesAgo } },
        ],
      },
      select: { startTime: true, endTime: true },
    });

    const bookedHours: number[] = [];
    for (const b of bookings) {
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();

      for (let h = 0; h < 24; h++) {
        const slotStart = new Date(`${dateStr}T${String(h).padStart(2, "0")}:00:00+05:30`).getTime();
        const slotEnd = new Date(`${dateStr}T${String(h + 1).padStart(2, "0")}:00:00+05:30`).getTime();

        if (bStart < slotEnd && bEnd > slotStart) {
          if (!bookedHours.includes(h)) bookedHours.push(h);
        }
      }
    }
    return bookedHours.sort((a, b) => a - b);
  } catch {
    return [];
  }
}

export default async function BikeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Format today's date in IST
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

  const [bike, settings, initialBookedHours] = await Promise.all([
    prisma.bike.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        },
      },
    }),
    getAppSettings(),
    getInitialBookedHours(id, todayStr),
  ]);

  if (!bike) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] pb-16">
      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between text-xs">
          <Link
            href="/#available-fleet"
            className="flex items-center gap-1.5 text-slate-600 hover:text-orange-600 font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to CampusRide Fleet</span>
          </Link>
          <div className="text-slate-500 font-medium">
            <span>Campus Fleet</span> / <strong className="text-[#0B1C30]">{bike.name}</strong>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Gallery & Specs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Multi-Photo Gallery */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200/90 shadow-sm">
              <BikeGallery images={bike.images} bikeName={bike.name} />
            </div>

            {/* Description & Specs */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/90 shadow-sm space-y-5">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200/60">
                    {bike.type}
                  </span>
                  {bike.isElectric && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-neutral-950 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-neutral-950" />
                      <span>Electric Assist</span>
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    {bike.brand} · {bike.model}
                  </span>
                </div>

                <h1 className="text-2xl font-black text-[#0B1C30]">
                  {bike.name}
                </h1>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                  <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span>Pickup Point: <strong className="text-[#0B1C30]">{bike.location}</strong></span>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-neutral-100 pt-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Cycle Details
                </h3>
                <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                  {bike.description}
                </p>
              </div>

              {/* Key Specs in ₹ */}
              <div className="border-t border-neutral-100 pt-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Hourly Rate</span>
                    <span className="text-orange-600 font-extrabold text-sm">₹{bike.hourlyRate.toFixed(0)}/hr</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Deposit</span>
                    <span className="text-[#0B1C30] font-extrabold text-sm">₹{bike.securityDeposit.toFixed(0)}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Gears</span>
                    <span className="text-[#0B1C30] font-extrabold text-sm">{bike.gearCount} Speed</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Frame</span>
                    <span className="text-[#0B1C30] font-extrabold text-sm">{bike.frameSize} Size</span>
                  </div>
                </div>
              </div>

              {/* Campus Rental Notes */}
              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Free cycle lock provided with every rental</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Payment accepted at cycle stand via UPI (PhonePe/Google Pay/Paytm) or Cash</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Deposit 100% refunded upon cycle return at Chandrashekhar Hostel stand</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: WhatsApp Hourly Booking Widget (5 cols) */}
          <div className="lg:col-span-5 sticky top-20">
            <HourlyBookingWidget
              bike={{
                id: bike.id,
                name: bike.name,
                hourlyRate: bike.hourlyRate,
                securityDeposit: bike.securityDeposit,
                location: bike.location,
                status: bike.status,
              }}
              whatsappPhone={settings.whatsappPhone}
              initialBookedHours={initialBookedHours}
              initialDate={todayStr}
            />
          </div>
        </div>
      </div>
    </div>
  );
}