"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Bike, Calendar, Menu, X, MessageSquare, MapPin } from "lucide-react";

export default function Navbar({ initialPhone }: { initialPhone?: string }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState(
    (initialPhone || process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "919876543210").replace(/\D/g, "")
  );

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.whatsappPhone) {
          setWhatsappPhone(data.whatsappPhone.replace(/\D/g, ""));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-[#F8F9FF]/95 backdrop-blur-md shadow-[0_1px_6px_rgba(11,28,48,0.03)] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo - CampusRide */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Bike className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-[#0B1C30] leading-none">
                Campus<span className="text-orange-600">Ride</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                RGPV Bhopal
              </span>
            </div>
          </Link>

          {/* Clean Public Navigation (NO ADMIN MENTIONS) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <Link
              href="/#available-fleet"
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#0B1C30] hover:bg-slate-100 transition-colors"
            >
              Browse Cycles
            </Link>

            <Link
              href="/#stand-location"
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#0B1C30] hover:bg-slate-100 transition-colors"
            >
              Stand Location
            </Link>

            <Link
              href="/#how-it-works"
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#0B1C30] hover:bg-slate-100 transition-colors"
            >
              How It Works
            </Link>

            <Link
              href="/bookings"
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                pathname.startsWith("/bookings")
                  ? "bg-orange-50 text-orange-700 border border-orange-200/80"
                  : "text-slate-700 hover:text-[#0B1C30] hover:bg-slate-100"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-orange-600" />
              <span>My Booking Slip</span>
            </Link>
          </nav>

          {/* Right Action Cluster */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {/* Stand Location Badge */}
            <div className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>Chandrashekhar Hostel</span>
            </div>

            {/* Direct WhatsApp Concierge Button */}
            <a
              href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent("Hi! I want to rent a cycle at Chandrashekhar Boys Hostel, RGPV.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/90 text-[#0B1C30] font-bold text-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
              <span>WhatsApp Help</span>
            </a>
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            <a
              href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent("Hi! I want to rent a cycle at Chandrashekhar Boys Hostel.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-100 text-[#0B1C30] border border-slate-200"
              aria-label="WhatsApp"
            >
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-[#F8F9FF] px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-800 text-xs font-bold mb-2 border border-orange-200/60">
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            <span>Stand: Chandrashekhar Boys Hostel</span>
          </div>

          <Link
            href="/#available-fleet"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            Browse Cycles
          </Link>
          <Link
            href="/#stand-location"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            Stand Location & Timings
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            How It Works
          </Link>
          <Link
            href="/bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            My Booking Slip
          </Link>

          <div className="pt-2 border-t border-slate-200">
            <a
              href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent("Hi! I want to rent a cycle at Chandrashekhar Boys Hostel, RGPV.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-[#0B1C30] hover:bg-slate-800 text-white font-bold text-xs gap-2 shadow-sm transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>Contact Stand on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}