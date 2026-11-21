export default function BikeDetailLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] pb-16 animate-pulse">
      {/* Top Breadcrumb Skeleton */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="h-4 w-36 bg-slate-200 rounded-md" />
          <div className="h-4 w-48 bg-slate-200 rounded-md" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Gallery Skeleton */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="aspect-[16/10] bg-slate-200 rounded-2xl w-full" />
              <div className="flex gap-2.5">
                <div className="w-20 h-14 bg-slate-200 rounded-xl" />
                <div className="w-20 h-14 bg-slate-200 rounded-xl" />
              </div>
            </div>

            {/* Specs Skeleton */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="h-4 w-24 bg-slate-200 rounded-full" />
              <div className="h-7 w-48 bg-slate-200 rounded-lg" />
              <div className="h-4 w-64 bg-slate-200 rounded-md" />
              <div className="grid grid-cols-4 gap-2.5 pt-4">
                <div className="h-16 bg-slate-100 rounded-xl" />
                <div className="h-16 bg-slate-100 rounded-xl" />
                <div className="h-16 bg-slate-100 rounded-xl" />
                <div className="h-16 bg-slate-100 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Right Column (5 cols) - Booking Widget Skeleton */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="h-6 w-32 bg-slate-200 rounded-lg" />
                <div className="h-7 w-20 bg-slate-200 rounded-lg" />
              </div>
              <div className="space-y-4">
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="h-10 bg-slate-100 rounded-xl" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-20 bg-slate-100 rounded-2xl" />
                <div className="h-12 bg-orange-200 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}