"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Calendar, Clock, ArrowRight } from "lucide-react";

export default function BookingsLookupPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    const trimmed = query.trim();
    if (!trimmed) {
      setSearchError("Please enter your 10-digit mobile number or booking code.");
      return;
    }

    if (trimmed.length < 4) {
      setSearchError("Search query must be at least 4 characters long.");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const isBookingNum = query.trim().toUpperCase().startsWith("BK-");
      const url = isBookingNum
        ? `/api/bookings/${query.trim().toUpperCase()}`
        : `/api/bookings?email=${encodeURIComponent(query.trim())}`;

      const res = await fetch(url);
      const data = await res.json();

      if (isBookingNum) {
        setResults(data.booking ? [data.booking] : []);
      } else {
        setResults(data.bookings || []);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200/60">
            Student Self-Service Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1C30] tracking-tight">
            Find Your CampusRide Slip
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Enter your 10-digit mobile number or Booking Code (e.g. <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-orange-600">BK-818250</code>) to open your digital pickup voucher.
          </p>
        </div>

        {/* Search Bar */}
        <div className="space-y-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Enter 10-digit mobile number or voucher code (BK-...)"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (searchError) setSearchError(null);
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none bg-white transition-colors ${
                  searchError
                    ? "border-red-400 focus:ring-2 focus:ring-red-400"
                    : "border-slate-300 focus:ring-2 focus:ring-orange-500"
                }`}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm shadow-orange-600/30 transition-all flex items-center gap-1.5"
            >
              <span>{isLoading ? "Searching..." : "Lookup"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {searchError && (
            <p className="text-xs text-red-600 font-medium pl-1">{searchError}</p>
          )}
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Found {results.length} Booking{results.length === 1 ? "" : "s"}
            </h3>

            {results.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-1">
                <p className="font-bold text-[#0B1C30]">No booking slip found.</p>
                <p>Check the phone number or booking code you entered.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {results.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-orange-600 text-xs">
                          {b.bookingNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {b.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#0B1C30] text-sm mt-0.5">
                        {b.bike?.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {new Date(b.startTime).toLocaleDateString([], { month: "short", day: "numeric" })} ·{" "}
                          {new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({b.totalHours} hrs)
                        </span>
                      </p>
                    </div>

                    <Link
                      href={`/bookings/${b.id}`}
                      className="px-3.5 py-2 rounded-xl bg-[#0B1C30] hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <span>Open Slip</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
