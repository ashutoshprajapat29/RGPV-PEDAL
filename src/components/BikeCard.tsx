"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap, MapPin, ArrowRight, Camera } from "lucide-react";

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

export default function BikeCard({ bike }: { bike: BikeProps }) {
  const [isHovered, setIsHovered] = useState(false);

  const primaryImg = bike.images.find((img) => img.isPrimary) || bike.images[0];
  const secondaryImg = bike.images.length > 1 ? bike.images[1] : primaryImg;

  const currentDisplayImg = isHovered && secondaryImg ? secondaryImg.url : primaryImg?.url;
  const isAvailable = bike.status === "AVAILABLE";

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl border border-neutral-200/90 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-0.5"
    >
      {/* Image Stage */}
      <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden">
        {currentDisplayImg ? (
          <img
            src={currentDisplayImg}
            alt={bike.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
            No Photo Available
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/95 text-neutral-900 shadow-sm">
            {bike.type}
          </span>
          {bike.isElectric && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-neutral-950 flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3 fill-neutral-950" />
              <span>Electric</span>
            </span>
          )}
        </div>

        {/* Total Photos Badge */}
        {bike.images.length > 0 && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-neutral-900/80 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1">
            <Camera className="w-3 h-3 text-neutral-300" />
            <span>{bike.images.length} {bike.images.length === 1 ? "photo" : "photos"}</span>
          </div>
        )}

        {!isAvailable && (
          <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3.5 py-1 rounded-full bg-red-600 text-white font-bold text-xs uppercase tracking-wider">
              {bike.status === "MAINTENANCE" ? "In Maintenance" : "Rented Out"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                {bike.brand}
              </span>
              <h3 className="font-bold text-neutral-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
                {bike.name}
              </h3>
            </div>
            {/* Hourly Rate in ₹ */}
            <div className="text-right flex-shrink-0">
              <span className="text-xl font-extrabold text-neutral-900">
                ₹{bike.hourlyRate.toFixed(0)}
              </span>
              <span className="block text-[10px] font-medium text-neutral-500 -mt-1">
                / hr
              </span>
            </div>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-100 my-2 text-[11px] text-neutral-600">
            <div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 block">Frame</span>
              <span className="font-semibold text-neutral-800">{bike.frameSize} Size</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 block">Gears</span>
              <span className="font-semibold text-neutral-800">{bike.gearCount} Speed</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 block">Deposit</span>
              <span className="font-semibold text-neutral-800">₹{bike.securityDeposit.toFixed(0)}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">{bike.location}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-1 flex items-center gap-2">
          <Link
            href={`/bikes/${bike.id}`}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Book / Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
