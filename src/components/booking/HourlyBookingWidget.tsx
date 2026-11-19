"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Check,
} from "lucide-react";

interface BikeDetails {
  id: string;
  name: string;
  hourlyRate: number;
  securityDeposit: number;
  location: string;
  status: string;
}

export default function HourlyBookingWidget({
  bike,
  whatsappPhone,
}: {
  bike: BikeDetails;
  whatsappPhone?: string;
}) {
  const router = useRouter();

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const currentHour = new Date().getHours();
  const defaultStartHour = Math.min(20, Math.max(8, currentHour + 1));
  const defaultEndHour = Math.min(22, defaultStartHour + 2);

  const [startHour, setStartHour] = useState(defaultStartHour);
  const [endHour, setEndHour] = useState(defaultEndHour);

  // Student details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [studentRollNo, setStudentRollNo] = useState("");
  const [ownerWhatsApp, setOwnerWhatsApp] = useState(
    whatsappPhone ? whatsappPhone.replace(/\D/g, "") : "919876543210"
  );

  // Field-level error messages
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Availability state
  const [bookedHours, setBookedHours] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.whatsappPhone) setOwnerWhatsApp(data.whatsappPhone);
        }
      } catch {}
    }
    loadSettings();
  }, []);

  useEffect(() => {
    async function loadAvailability() {
      try {
        const res = await fetch(`/api/bikes/${bike.id}/availability?date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          setBookedHours(data.bookedHours || []);
        }
      } catch (err) {
        console.error("Failed to load availability", err);
      }
    }
    loadAvailability();
  }, [bike.id, selectedDate]);

  const totalHours = Math.max(1, endHour - startHour);

  // Check conflicts
  const conflictingHours: number[] = [];
  for (let h = startHour; h < endHour; h++) {
    if (bookedHours.includes(h)) {
      conflictingHours.push(h);
    }
  }
  const hasConflict = conflictingHours.length > 0;

  // Calculation in Indian Rupees
  const baseRentalCost = Math.round(bike.hourlyRate * totalHours);
  const securityDeposit = Math.round(bike.securityDeposit || 0);
  const grandTotal = baseRentalCost + securityDeposit;

  // Real-time phone cleaner & validator
  const handlePhoneChange = (val: string) => {
    setCustomerPhone(val);
    const digits = val.replace(/\D/g, "");
    if (digits.length > 0 && digits.length < 10) {
      setPhoneError("Enter a full 10-digit mobile number");
    } else if (digits.length === 10 && !/^[6-9]\d{9}$/.test(digits)) {
      setPhoneError("Must start with 6, 7, 8, or 9 (Indian mobile)");
    } else {
      setPhoneError(null);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setNameError(null);
    setPhoneError(null);
    setTimeError(null);

    let hasValidationError = false;

    // 1. Name validation
    const trimmedName = customerName.trim();
    if (trimmedName.length < 2) {
      setNameError("Please enter your full name (minimum 2 letters).");
      hasValidationError = true;
    } else if (!/^[a-zA-Z\s.]+$/.test(trimmedName)) {
      setNameError("Name should contain letters only.");
      hasValidationError = true;
    }

    // 2. Phone validation
    const digitsOnly = customerPhone.replace(/\D/g, "");
    const cleanPhone = digitsOnly.length === 12 && digitsOnly.startsWith("91") ? digitsOnly.slice(2) : digitsOnly;
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).");
      hasValidationError = true;
    }

    // 3. Timing validation
    if (startHour >= endHour) {
      setTimeError("Return hour must be after pickup hour (minimum 1 hour rental).");
      hasValidationError = true;
    }

    // If today, check if start hour is in the past
    const nowH = new Date().getHours();
    if (selectedDate === todayStr && startHour <= nowH) {
      setTimeError(`Pickup hour (${startHour}:00) has already passed today. Please pick ${nowH + 1}:00 or later.`);
      hasValidationError = true;
    }

    if (hasConflict) {
      setTimeError("One or more hours in this range are already booked by another student.");
      hasValidationError = true;
    }

    if (totalHours > 12) {
      setTimeError("Maximum single booking is 12 hours. For overnight rentals, contact the stand manager.");
      hasValidationError = true;
    }

    if (hasValidationError) return;

    setIsSubmitting(true);

    try {
      const startDateTime = new Date(`${selectedDate}T${String(startHour).padStart(2, "0")}:00:00`);
      const endDateTime = new Date(`${selectedDate}T${String(endHour).padStart(2, "0")}:00:00`);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bikeId: bike.id,
          customerName: trimmedName,
          customerEmail: `${cleanPhone}@rgpv.campus`,
          customerPhone: cleanPhone,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          paymentMethod: "UPI_AT_STAND",
          addonsAmount: 0,
          pickupNotes: studentRollNo.trim() ? `Roll No / College: ${studentRollNo.trim()}` : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit booking.");
      }

      const bookingNumber = data.booking.bookingNumber;
      const targetPhone = ownerWhatsApp.replace(/\D/g, "");

      const formatTime = (h: number) => {
        const p = h >= 12 ? "PM" : "AM";
        const dh = h % 12 === 0 ? 12 : h % 12;
        return `${dh}:00 ${p}`;
      };

      const waMessage = `🚲 *RGPV Campus Bicycle Booking*
---------------------------------------
• *Bicycle:* ${bike.name}
• *Booking Code:* ${bookingNumber}
• *Student Name:* ${trimmedName}
• *WhatsApp Mobile:* ${cleanPhone}${studentRollNo.trim() ? `\n• *Roll No / Dept:* ${studentRollNo.trim()}` : ""}
• *Date:* ${selectedDate}
• *Rental Timing:* ${formatTime(startHour)} - ${formatTime(endHour)} (${totalHours} hrs)
• *Rent Amount:* ₹${baseRentalCost} (₹${bike.hourlyRate}/hr)
• *Security Deposit:* ₹${securityDeposit} (Refundable)
• *Total Due at Stand:* ₹${grandTotal} (UPI / Cash)
• *Pickup Stand:* ${bike.location}

Please confirm cycle availability. Thank you!`;

      const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(waMessage)}`;
      window.open(waUrl, "_blank");

      router.push(`/bookings/${data.booking.id}`);
    } catch (err: any) {
      setGeneralError(err.message || "An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-md p-6 space-y-5">
      <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            Hourly Booking
          </span>
          <h3 className="text-lg font-extrabold text-neutral-900 mt-1">
            Book on WhatsApp
          </h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-neutral-900">
            ₹{bike.hourlyRate.toFixed(0)}
          </span>
          <span className="text-[10px] font-semibold text-neutral-500 block -mt-1">
            per hour
          </span>
        </div>
      </div>

      <form onSubmit={handleBookingSubmit} noValidate className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Rental Date *
          </label>
          <input
            type="date"
            min={todayStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Start and Return Hour */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Pickup Time *
            </label>
            <select
              value={startHour}
              onChange={(e) => {
                const newStart = Number(e.target.value);
                setStartHour(newStart);
                if (endHour <= newStart) setEndHour(newStart + 1);
                setTimeError(null);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Array.from({ length: 15 }, (_, i) => i + 7).map((h) => {
                const isBooked = bookedHours.includes(h);
                const period = h >= 12 ? "PM" : "AM";
                const displayH = h % 12 === 0 ? 12 : h % 12;
                return (
                  <option key={h} value={h} disabled={isBooked}>
                    {displayH}:00 {period} {isBooked ? "(Booked)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Return Time *
            </label>
            <select
              value={endHour}
              onChange={(e) => {
                setEndHour(Number(e.target.value));
                setTimeError(null);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Array.from({ length: 15 }, (_, i) => i + 8).map((h) => {
                const period = h >= 12 ? "PM" : "AM";
                const displayH = h % 12 === 0 ? 12 : h % 12;
                return (
                  <option key={h} value={h} disabled={h <= startHour}>
                    {displayH}:00 {period} ({h - startHour} hr{h - startHour > 1 ? "s" : ""})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {timeError && (
          <p className="text-[11px] text-red-600 font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
            {timeError}
          </p>
        )}

        {hasConflict && !timeError && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Cycle is already reserved during these hours. Please adjust timing.</span>
          </div>
        )}

        {/* Student Details */}
        <div className="space-y-3 pt-2 border-t border-neutral-100">
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-bold text-neutral-700">
                Your Full Name *
              </label>
              {nameError && (
                <span className="text-[10px] text-red-600 font-semibold">{nameError}</span>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (nameError) setNameError(null);
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                nameError
                  ? "border-red-400 bg-red-50/20 focus:ring-2 focus:ring-red-400"
                  : "border-neutral-300 focus:ring-2 focus:ring-emerald-500"
              }`}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-bold text-neutral-700">
                WhatsApp Mobile Number *
              </label>
              {phoneError && (
                <span className="text-[10px] text-red-600 font-semibold">{phoneError}</span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400">+91</span>
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit number (e.g. 9876543210)"
                value={customerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full pl-11 pr-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                  phoneError
                    ? "border-red-400 bg-red-50/20 focus:ring-2 focus:ring-red-400"
                    : "border-neutral-300 focus:ring-2 focus:ring-emerald-500"
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              College Roll No. / Department (Optional)
            </label>
            <input
              type="text"
              maxLength={25}
              placeholder="e.g. 0101CS221045 or UIT RGPV"
              value={studentRollNo}
              onChange={(e) => setStudentRollNo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Cost Summary in ₹ */}
        <div className="bg-neutral-50 rounded-2xl p-3.5 space-y-2 border border-neutral-200/70 text-xs">
          <div className="flex justify-between text-neutral-600">
            <span>Duration ({totalHours} hr{totalHours > 1 ? "s" : ""} × ₹{bike.hourlyRate.toFixed(0)})</span>
            <span className="font-bold text-neutral-900">₹{baseRentalCost}</span>
          </div>

          {securityDeposit > 0 && (
            <div className="flex justify-between text-neutral-600">
              <span>Refundable Deposit (Returned at stand)</span>
              <span className="font-bold text-neutral-900">₹{securityDeposit}</span>
            </div>
          )}

          <div className="border-t border-neutral-200 pt-2 flex justify-between items-baseline">
            <span className="font-bold text-neutral-900">Total at Cycle Stand (UPI / Cash)</span>
            <span className="text-xl font-black text-emerald-700">₹{grandTotal}</span>
          </div>
        </div>

        {generalError && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {generalError}
          </div>
        )}

        {/* WhatsApp Book Button */}
        <button
          type="submit"
          disabled={isSubmitting || hasConflict}
          className={`w-full py-3 px-4 rounded-2xl font-bold text-sm text-white shadow transition-all flex items-center justify-center gap-2 ${
            hasConflict || isSubmitting
              ? "bg-neutral-300 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-emerald-600/20"
          }`}
        >
          <MessageSquare className="w-4 h-4 fill-white" />
          <span>{isSubmitting ? "Checking..." : `Book on WhatsApp (₹${grandTotal})`}</span>
        </button>

        <p className="text-[11px] text-neutral-400 text-center">
          Tap button to send prefilled details to the cycle stand manager on WhatsApp.
        </p>
      </form>
    </div>
  );
}
