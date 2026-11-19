"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bike, Calendar, Menu, X, MessageSquare } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo tailored for RGPV Bhopal */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-neutral-900 flex items-center gap-1">
                RGPV<span className="text-emerald-600">Pedal</span>
              </span>
              <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider -mt-1">
                Bhopal Campus Cycle Rental
              </span>
            </div>
          </Link>

          {/* Clean Public Navigation (NO ADMIN MENTIONS) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                pathname === "/"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              Browse Cycles
            </Link>

            <Link
              href="/#how-it-works"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              How It Works
            </Link>

            <Link
              href="/bookings"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname.startsWith("/bookings")
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>My Booking Slip</span>
            </Link>
          </nav>

          {/* Quick WhatsApp Help Pill */}
          <div className="hidden md:flex items-center">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "919876543210"}?text=${encodeURIComponent("Hello! I have a question about renting a bicycle at RGPV Bhopal.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs flex items-center gap-1.5 border border-emerald-200 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus WhatsApp Help</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
          >
            Browse Cycles
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-neutral-100"
          >
            How It Works
          </Link>
          <Link
            href="/bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-neutral-100"
          >
            My Booking Slip
          </Link>
          <div className="pt-2 border-t border-neutral-100">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "919876543210"}?text=${encodeURIComponent("Hello! I want to rent a bicycle at RGPV Bhopal.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full px-3 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Campus WhatsApp Help</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
