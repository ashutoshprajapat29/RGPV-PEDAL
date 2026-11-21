import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import BikeCard from "@/components/BikeCard";
import {
  Bike,
  Clock,
  ShieldCheck,
  MapPin,
  MessageSquare,
  ArrowRight,
  Receipt,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const selectedType = typeof resolvedParams.type === "string" ? resolvedParams.type : "ALL";
  const searchQuery = typeof resolvedParams.search === "string" ? resolvedParams.search : "";

  const where: any = {};
  if (selectedType && selectedType !== "ALL") {
    if (selectedType === "Electric") {
      where.isElectric = true;
    } else {
      where.type = selectedType;
    }
  }

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery } },
      { brand: { contains: searchQuery } },
      { description: { contains: searchQuery } },
    ];
  }

  const [bikes, settings] = await Promise.all([
    prisma.bike.findMany({
      where,
      include: {
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getAppSettings(),
  ]);

  const whatsappPhone = settings?.whatsappPhone || "919876543210";
  const cleanPhone = whatsappPhone.replace(/\D/g, "");

  const categories = [
    { label: "All Cycles", value: "ALL" },
    { label: "⚡ Electric (e-Bikes)", value: "Electric" },
    { label: "🚵 Geared Mountain", value: "Mountain" },
    { label: "🚲 Campus Roadsters", value: "City" },
    { label: "🌱 Hybrid", value: "Hybrid" },
  ];

  return (
    <div className="flex flex-col w-full bg-[#F8F9FF] min-h-screen text-[#0B1C30]">
      {/* 1. CLEAN HERO SECTION */}
      <section className="w-full pt-10 pb-14 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Campus Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-800 text-xs font-bold w-fit shadow-xs">
            <span className="text-sm">🏛️</span>
            <span>UIT RGPV Gandhi Nagar Campus, Bhopal</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0B1C30] tracking-tight leading-[1.12]">
            Hourly Bicycle Rentals at <br />
            <span className="text-orange-600">Chandrashekhar Boys Hostel</span>
          </h1>

          {/* Subtext */}
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Quick, affordable, and eco-friendly commute between hostels, academic blocks, library, and canteen. Book your hourly slot online and pick up your cycle directly at the Chandrashekhar Hostel stand.
          </p>

          {/* Key Feature Chips */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Stand: Chandrashekhar Boys Hostel</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Starting from ₹8 / hour</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>UPI / Cash at Stand</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="#available-fleet"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm shadow-orange-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <Bike className="w-4 h-4" />
              <span>Browse Available Cycles ({bikes.length})</span>
            </Link>

            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent("Hi! I want to check cycle availability at Chandrashekhar Boys Hostel Stand.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Stand Manager</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. CYCLE STAND DETAILS CARD */}
      <section id="stand-location" className="w-full pb-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-600">
                <MapPin className="w-4 h-4" />
                <span>Cycle Pickup & Return Stand</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#0B1C30]">
                Chandrashekhar Azad Boys Hostel (Hostel 1)
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Located right at the main entrance portico of Chandrashekhar Boys Hostel, near the mess area. Cycles are inspected and dispatched directly by the hostel stand manager.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <strong>Timings:</strong> 6:00 AM – 10:30 PM (Daily)
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                  <strong>Verification:</strong> RGPV Student ID / Enrollment No.
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Current Fleet at Stand
              </span>
              <div className="text-3xl font-black text-orange-600">
                {bikes.length} {bikes.length === 1 ? "Cycle" : "Cycles"}
              </div>
              <Link
                href="#available-fleet"
                className="inline-block text-xs font-bold text-orange-700 hover:underline"
              >
                View Available Models ↓
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CYCLE CATALOG */}
      <section id="available-fleet" className="w-full py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-[#0B1C30]">
                  Available Bicycles ({bikes.length})
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Select any cycle to view photos, specs, and reserve your hourly slot.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((c) => {
                const isActive = selectedType === c.value;
                return (
                  <Link
                    key={c.value}
                    href={`/?type=${c.value}#available-fleet`}
                    scroll={false}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-orange-600 text-white shadow-xs shadow-orange-600/30"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {c.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          {bikes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
              <Bike className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-sm">No Cycles in this Category Right Now</h3>
              <p className="text-xs text-slate-500">
                All cycles in this category might be currently rented or in service.
              </p>
              <Link
                href="/#available-fleet"
                className="inline-block px-3.5 py-1.5 rounded-xl bg-orange-600 text-white font-bold text-xs"
              >
                View All Cycles
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bikes.map((bike) => (
                <BikeCard key={bike.id} bike={bike as any} whatsappPhone={whatsappPhone} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. HOW IT WORKS (CLEAN 3 STEPS) */}
      <section id="how-it-works" className="w-full py-12 bg-slate-100/60 border-y border-slate-200/80 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl font-extrabold text-[#0B1C30]">
              How to Rent a Cycle at Chandrashekhar Hostel
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 font-extrabold text-sm flex items-center justify-center border border-orange-200">
                1
              </div>
              <h3 className="font-bold text-sm text-[#0B1C30]">Choose Cycle & Timing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse our fleet above, pick your preferred bicycle, and select your pickup and return hours.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 font-extrabold text-sm flex items-center justify-center border border-orange-200">
                2
              </div>
              <h3 className="font-bold text-sm text-[#0B1C30]">Send WhatsApp Request</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click "Book on WhatsApp" to send your prefilled booking slip directly to the stand manager.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 font-extrabold text-sm flex items-center justify-center border border-orange-200">
                3
              </div>
              <h3 className="font-bold text-sm text-[#0B1C30]">Pick Up & Ride</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Visit Chandrashekhar Hostel stand, show your booking code, pay via UPI or Cash, and collect your cycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BOOKING SLIP LOOKUP WIDGET */}
      <section className="w-full py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-6 space-y-1">
              <div className="flex items-center gap-1.5 text-orange-600 text-[11px] font-bold uppercase tracking-wider">
                <Receipt className="w-4 h-4" />
                <span>Self-Service Portal</span>
              </div>
              <h3 className="text-lg font-extrabold text-[#0B1C30]">
                Already Have a Reservation?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your 10-digit mobile number or booking code to view your voucher or check status.
              </p>
            </div>

            <div className="md:col-span-6">
              <form action="/bookings" method="GET" className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    name="q"
                    type="text"
                    placeholder="Enter Mobile No. or BK-..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 text-xs font-semibold text-[#0B1C30] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors shrink-0 shadow-xs"
                >
                  Lookup Slip
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}