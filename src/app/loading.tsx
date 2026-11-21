export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col items-center justify-center p-8">
      <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Loading CampusRide...</span>
    </div>
  );
}