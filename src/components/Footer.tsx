"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bike, MapPin, MessageSquare, Clock, ShieldCheck, IndianRupee } from "lucide-react";

export default function Footer({ initialPhone }: { initialPhone?: string }) {
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
    <footer className="w-full bg-[#0B1C30] text-slate-300 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-600/30">
                <Bike className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-base tracking-tight">
                Campus<span className="text-orange-500">Ride</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Affordable, eco-friendly hourly bicycle rentals for students and staff at Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV), Bhopal.
            </p>
            <div className="text-[11px] text-slate-500">
              Clean Campus · Green Mobility
            </div>
          </div>

          {/* Stand Location & Hours */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Cycle Stand Details
            </h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Chandrashekhar Boys Hostel Stand</strong><br />
                  Hostel Portico, UIT RGPV Campus,<br />
                  Airport Road, Gandhi Nagar, Bhopal - 462033
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                <span><strong>Timings:</strong> 6:00 AM – 10:30 PM (All Days)</span>
              </div>
            </div>
          </div>

          {/* Payment & Contact */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Payment & Support
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Pay at the hostel stand using <strong>UPI (GPay / PhonePe / Paytm)</strong> or <strong>Cash</strong>. Book online and confirm instantly on WhatsApp.
            </p>
            <div className="pt-1">
              <a
                href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent("Hi! I need assistance with a cycle rental at Chandrashekhar Boys Hostel.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                <span>WhatsApp Stand Help</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© 2026 CampusRide · RGPV Bhopal. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link href="/bookings" className="hover:text-white transition-colors">My Booking Slip</Link>
            <Link href="/#stand-location" className="hover:text-white transition-colors">Stand Info</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}