import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BikeCard from "@/components/BikeCard";
import {
  Bike,
  Clock,
  ShieldCheck,
  MapPin,
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

  const bikes = await prisma.bike.findMany({
    where,
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = [
    { label: "All Cycles", value: "ALL" },
    { label: "⚡ Electric (e-Bikes)", value: "Electric" },
    { label: "🚵 Geared Mountain", value: "Mountain" },
    { label: "🚲 Campus Roadsters", value: "City" },
    { label: "🌱 Hybrid", value: "Hybrid" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/60 pb-16">
      {/* Clean Hero for RGPV Bhopal */}
      <section className="bg-white border-b border-neutral-200/80 pt-10 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>RGPV Bhopal Campus Cycling</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            Hourly Bicycle Rentals at <br />
            <span className="text-emerald-600">RGPV Bhopal Campus</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Quick, affordable, and green commute between Main Gate, UIT Academic Blocks, Library, and Hostels. Book instantly on WhatsApp.
          </p>

          {/* Quick Info Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-neutral-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Starting from ₹8 / hour</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>UPI / Cash at Stand</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Cycle Stands at Main Gate & Hostels</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Cycle Catalog */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        {/* Category Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/80 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900">
              Available Bicycles ({bikes.length})
            </h2>
            <p className="text-xs text-neutral-500">
              Select any cycle to view photos and reserve your hourly slot.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedType === cat.value;
              return (
                <Link
                  key={cat.value}
                  href={cat.value === "ALL" ? "/" : `/?type=${cat.value}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Cycle Grid */}
        {bikes.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center space-y-2 text-xs text-neutral-500">
            <p className="font-bold text-neutral-800 text-sm">No bicycles found in this category</p>
            <Link href="/" className="inline-block mt-2 px-3.5 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold">
              View All Cycles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bikes.map((bike) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </div>
        )}
      </section>

      {/* Clean 3-Step Guide */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 mt-16">
        <div className="text-center space-y-1 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
            Simple & Fast
          </span>
          <h2 className="text-2xl font-black text-neutral-900">
            How Campus Rental Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-sm">
              1
            </div>
            <h3 className="font-bold text-neutral-900 text-sm">Choose Cycle & Hours</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Pick the cycle that suits you (Single Speed, Geared MTB, or Electric) and choose your rental timing.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="font-bold text-neutral-900 text-sm">Send WhatsApp Request</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Click &apos;Book on WhatsApp&apos; to send your prefilled booking slip directly to the stand manager.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="font-bold text-neutral-900 text-sm">Collect at Cycle Stand & Pay</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Collect cycle from the campus cycle stand and pay via UPI (GPay/PhonePe) or Cash. Return when done!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
