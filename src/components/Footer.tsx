import Link from "next/link";
import { Bike, MapPin, MessageSquare, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 border-t border-neutral-800 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Bike className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base">RGPV Pedal</span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-xs">
              Affordable, eco-friendly hourly bicycle rentals for students, faculty, and visitors at Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV), Airport Road, Bhopal.
            </p>
          </div>

          {/* Campus Pickup Cycle Stands */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Campus Cycle Stands
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>RGPV Main Gate Cycle Stand</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>UIT Academic Block Cycle Stand</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Central Library Cycle Stand</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Hostel Cluster Cycle Stand</span>
              </li>
            </ul>
          </div>

          {/* How to Pay & Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Payment & Support
            </h4>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              Pay easily at the pickup stand using <strong>UPI (PhonePe, Google Pay, Paytm)</strong> or <strong>Cash</strong>. Book directly on WhatsApp for instant confirmation.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "919876543210"}?text=${encodeURIComponent("Hello! I need assistance with a cycle rental at RGPV Bhopal.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact on WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-3">
          <p>© 2026 RGPV Pedal · Bhopal, Madhya Pradesh</p>
          <p>Clean Campus · Green Mobility</p>
        </div>
      </div>
    </footer>
  );
}
