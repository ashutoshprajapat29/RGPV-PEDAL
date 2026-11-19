"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Bike,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  ArrowLeft,
  Printer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from "lucide-react";

export default function BookingPassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [booking, setBooking] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [ownerWhatsApp, setOwnerWhatsApp] = useState(
    (process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "919876543210").replace(/\D/g, "")
  );

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.whatsappPhone) {
          setOwnerWhatsApp(data.whatsappPhone.replace(/\D/g, ""));
        }
      })
      .catch(() => {});
  }, []);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking not found");
      setBooking(data.booking);
    } catch (err: any) {
      setError(err.message || "Failed to load booking.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  useEffect(() => {
    if (!booking) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(booking.endTime).getTime();
      const start = new Date(booking.startTime).getTime();

      if (booking.status === "COMPLETED") {
        setTimeLeftStr("Cycle Returned & Completed ✓");
        return;
      }

      if (booking.status === "CANCELLED") {
        setTimeLeftStr("Booking Cancelled");
        return;
      }

      if (now < start) {
        const diffMs = start - now;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeftStr(`Pickup starts in ${hours}h ${mins}m`);
      } else if (now >= start && now <= end) {
        const diffMs = end - now;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeLeftStr(`${hours}h ${mins}m ${secs}s left`);
      } else {
        const overdueMs = now - end;
        const mins = Math.floor(overdueMs / (1000 * 60));
        setTimeLeftStr(`Overdue by ${mins}m - Return to Cycle Stand`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking]);

  const handleStudentCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking request? The slot will be freed immediately.")) {
      return;
    }
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
          returnNotes: "Cancelled by student from voucher pass",
        }),
      });
      if (res.ok) {
        await fetchBooking();
      } else {
        alert("Failed to cancel booking. Please try contacting the stand manager.");
      }
    } catch {
      alert("Error cancelling booking.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-xs font-semibold text-neutral-500">Loading booking slip...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center space-y-3">
        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900">Booking Not Found</h2>
        <p className="text-xs text-neutral-500">{error || "Could not find this reservation."}</p>
        <Link
          href="/"
          className="inline-block px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Fleet
        </Link>
      </div>
    );
  }

  const primaryImage =
    booking.bike?.images?.find((img: any) => img.isPrimary) || booking.bike?.images?.[0];

  const waHelpUrl = `https://wa.me/${ownerWhatsApp}?text=${encodeURIComponent(`Hello! Regarding my RGPV cycle booking (${booking.bookingNumber}) for ${booking.bike?.name}.`)}`;

  return (
    <div className="min-h-screen bg-neutral-50/70 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between text-xs">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Cycles</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Slip</span>
          </button>
        </div>

        {/* Clean Ticket Card */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-800 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200 block">
                RGPV Campus Cycle Rental Slip
              </span>
              <h1 className="text-xl font-black">
                {booking.bike?.name}
              </h1>
              <p className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Pickup: {booking.bike?.location}</span>
              </p>
            </div>

            <div className="text-left sm:text-right bg-black/20 px-3.5 py-2 rounded-2xl">
              <span className="text-[9px] uppercase font-bold text-neutral-300 block">
                Booking Code
              </span>
              <span className="text-base font-mono font-black text-amber-300">
                {booking.bookingNumber}
              </span>
            </div>
          </div>

          {/* Status strip */}
          <div className="bg-emerald-50 px-5 sm:px-6 py-2.5 border-b border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  booking.status === "PENDING"
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : booking.status === "CONFIRMED"
                    ? "bg-emerald-700 text-white"
                    : booking.status === "ACTIVE"
                    ? "bg-blue-600 text-white"
                    : booking.status === "CANCELLED"
                    ? "bg-red-600 text-white"
                    : "bg-neutral-600 text-white"
                }`}
              >
                {booking.status === "PENDING"
                  ? "Pending Stand Confirmation"
                  : booking.status === "CONFIRMED"
                  ? "Booking Confirmed"
                  : booking.status === "ACTIVE"
                  ? "Active Ride (On Road)"
                  : booking.status === "COMPLETED"
                  ? "Returned & Completed"
                  : "Cancelled"}
              </span>

              <span className="text-emerald-900 font-semibold text-[11px]">
                {booking.paymentStatus === "PAID" ? "Paid ✓" : "Pay at Cycle Stand (UPI/Cash)"}
              </span>
            </div>

            <div className="flex items-center gap-1 text-emerald-800 font-bold text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeftStr}</span>
            </div>
          </div>

          {/* Status Explanation Banner */}
          {booking.status === "PENDING" && (
            <div className="bg-amber-50 border-b border-amber-200 px-5 sm:px-6 py-3 flex items-start gap-2.5 text-xs text-amber-900">
              <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Awaiting Stand Manager Confirmation:</strong>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Your booking request has been submitted to the stand manager via WhatsApp. Please ensure you sent the WhatsApp message or show this voucher code at the cycle stand to confirm availability and pick up your cycle.
                </p>
              </div>
            </div>
          )}

          {booking.status === "CONFIRMED" && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-5 sm:px-6 py-3 flex items-start gap-2.5 text-xs text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Bicycle Reserved:</strong>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                  Your booking is confirmed! Head to <strong>{booking.bike?.location}</strong> at your booked time. Show this voucher code to collect the cycle and pay via UPI or cash.
                </p>
              </div>
            </div>
          )}

          {booking.status === "ACTIVE" && (
            <div className="bg-blue-50 border-b border-blue-200 px-5 sm:px-6 py-3 flex items-start gap-2.5 text-xs text-blue-900">
              <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Ride In Progress:</strong>
                <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                  Have a safe ride around the RGPV campus! Please return the bicycle to the stand before your booked time expires.
                </p>
              </div>
            </div>
          )}

          {booking.status === "CANCELLED" && (
            <div className="bg-red-50 border-b border-red-200 px-5 sm:px-6 py-3 flex items-start gap-2.5 text-xs text-red-900">
              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Booking Request Cancelled:</strong>
                <p className="text-[11px] text-red-800 mt-0.5 leading-relaxed">
                  This reservation has been cancelled and the cycle slot has been released for other students.
                </p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 sm:col-span-1">
                {primaryImage ? (
                  <img src={primaryImage.url} alt={booking.bike?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <Bike className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="sm:col-span-2 space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Renter</span>
                    <span className="font-bold text-neutral-900">{booking.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Mobile</span>
                    <span className="font-bold text-neutral-900">{booking.customerPhone}</span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Pickup Time</span>
                    <span className="font-bold text-neutral-900">
                      {new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-[10px] text-neutral-400 block">
                      {new Date(booking.startTime).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Scheduled Return</span>
                    <span className="font-bold text-neutral-900">
                      {new Date(booking.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-[10px] text-neutral-400 block">
                      {booking.totalHours} hr{booking.totalHours > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {booking.pickupNotes && (
                  <p className="text-[11px] text-neutral-500">
                    <strong>Note:</strong> {booking.pickupNotes}
                  </p>
                )}
              </div>
            </div>

            {/* Financials in ₹ */}
            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 flex items-center justify-between text-xs">
              <div className="space-y-0.5 text-neutral-600">
                <p>Rent: <strong>₹{booking.hourlyRateApplied}/hr</strong> × {booking.totalHours} hrs</p>
                <p>Refundable Deposit: <strong>₹{booking.securityDeposit}</strong></p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Due at Cycle Stand</span>
                <span className="text-xl font-black text-emerald-700">₹{booking.totalAmount.toFixed(0)}</span>
              </div>
            </div>

            {/* Actions: WhatsApp Manager, Cancel Request & QR */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <a
                  href={waHelpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message Stand on WhatsApp</span>
                </a>

                {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                  <button
                    onClick={handleStudentCancel}
                    disabled={isCancelling}
                    className="px-3 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition-colors"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Reservation"}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <QrCode className="w-10 h-10 text-neutral-900" />
                <span className="text-[10px] font-mono font-bold text-neutral-700">
                  Show at cycle stand for pickup
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
