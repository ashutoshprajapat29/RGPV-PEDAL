"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Zap, MapPin, ArrowRight, Camera, MessageSquare, CheckCircle2, ShieldCheck } from "lucide-react";

interface BikeImage {
  id?: string;
  url: string;
  isPrimary?: boolean;
}

interface BikeProps {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: string;
  frameSize: string;
  gearCount: number;
  isElectric: boolean;
  batteryRangeKm?: number | null;
  hourlyRate: number;
  securityDeposit: number;
  status: string;
  location: string;
  images: BikeImage[];
}

export default function BikeCard({
  bike,
  whatsappPhone = "919876543210",
}: {
  bike: BikeProps;
  whatsappPhone?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [ownerPhone, setOwnerPhone] = useState(whatsappPhone.replace(/\D/g, ""));

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.whatsappPhone) {
          setOwnerPhone(data.whatsappPhone.replace(/\D/g, ""));
        }
      })
      .catch(() => {});
  }, []);

  const primaryImg = bike.images.find((img) => img.isPrimary) || bike.images[0];
  const secondaryImg = bike.images.length > 1 ? bike.images[1] : primaryImg;

  const currentDisplayImg = isHovered && secondaryImg ? secondaryImg.url : primaryImg?.url;
  const isAvailable = bike.status === "AVAILABLE";

  const dailyCap = Math.round(bike.hourlyRate * 5);

  const whatsappMessage = encodeURIComponent(
    `Hi CampusRide! I would like to reserve ${bike.name} (${bike.brand} - ₹${bike.hourlyRate}/hr) at stand: ${bike.location}. Please share the current availability.`
  );

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
    >
      {/* Image Stage */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {currentDisplayImg ? (
          <img
            src={currentDisplayImg}
            alt={bike.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1 bg-slate-50">
            <span className="text-xl">🚲</span>
            <span>Campus Fleet Photo</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/95 text-[#0B1C30] shadow-sm border border-slate-100">
            {bike.type}
          </span>
          {bike.isElectric && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3 fill-slate-950" />
              <span>Electric</span>
            </span>
          )}
          {bike.gearCount > 1 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/80 backdrop-blur-md text-white shadow-sm">
              {bike.gearCount}-Speed
            </span>
          )}
        </div>

        {/* Live Status Badge */}
        <div className="absolute top-3 right-3">
          {isAvailable ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Ready</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-white">
              {bike.status === "MAINTENANCE" ? "Service" : "In Use"}
            </span>
          )}
        </div>

        {/* Photos Count */}
        {bike.images.length > 0 && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1">
            <Camera className="w-3 h-3 text-slate-300" />
            <span>{bike.images.length} {bike.images.length === 1 ? "photo" : "photos"}</span>
          </div>
        )}

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
            <span className="px-4 py-1.5 rounded-full bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg">
              {bike.status === "MAINTENANCE" ? "In Maintenance" : "Currently On Trip"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-orange-600 uppercase">
                {bike.brand}
              </span>
              <h3 className="font-bold text-[#0B1C30] text-base leading-snug group-hover:text-orange-600 transition-colors">
                {bike.name}
              </h3>
            </div>

            {/* Rate Display */}
            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-[#0B1C30]">
                ₹{bike.hourlyRate.toFixed(0)}
              </span>
              <span className="block text-[10px] font-medium text-slate-500 -mt-1">
                / hour
              </span>
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 my-3 text-[11px] text-slate-600">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Frame</span>
              <span className="font-semibold text-slate-800">{bike.frameSize} Size</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Drivetrain</span>
              <span className="font-semibold text-slate-800">
                {bike.gearCount > 1 ? `${bike.gearCount} Gears` : "Single-Speed"}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Caution</span>
              <span className="font-semibold text-slate-800">₹{bike.securityDeposit.toFixed(0)}</span>
            </div>
          </div>

          {/* Stand Dock Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span className="truncate font-medium">{bike.location}</span>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Daily Cap: ₹{dailyCap}</span>
            <span className="text-slate-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-orange-600" />
              <span>UPI / Cash at Stand</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
          <Link
            href={`/bikes/${bike.id}`}
            prefetch={true}
            onClick={() => setIsNavigating(true)}
            className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-all shadow-xs shadow-orange-600/20 active:scale-[0.98]"
          >
            {isNavigating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Opening...</span>
              </>
            ) : (
              <>
                <span>Book / Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Link>

          <a
            href={`https://wa.me/${ownerPhone}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
            title="Book instantly on WhatsApp"
          >
            <MessageSquare className="w-4 h-4 text-[#25D366]" />
            <span className="sm:hidden">Book on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}