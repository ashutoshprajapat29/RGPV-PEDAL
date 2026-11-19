"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X, Star, Camera } from "lucide-react";

interface BikeImage {
  id?: string;
  url: string;
  isPrimary?: boolean;
  caption?: string | null;
  sortOrder?: number;
}

interface BikeGalleryProps {
  images: BikeImage[];
  bikeName: string;
}

export default function BikeGallery({ images, bikeName }: BikeGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const fallbackImage =
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80";

  const safeImages = images && images.length > 0 ? images : [{ url: fallbackImage, isPrimary: true }];
  const currentImage = safeImages[activeIndex] || safeImages[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3">
      {/* Main Image Stage */}
      <div className="relative group overflow-hidden rounded-2xl bg-neutral-100 border border-neutral-200 aspect-[16/10] sm:aspect-[16/9]">
        <img
          src={currentImage.url}
          alt={currentImage.caption || `${bikeName} view ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        {/* Primary cover badge */}
        {currentImage.isPrimary && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-900/80 backdrop-blur-md text-amber-400 text-xs font-semibold shadow">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>Primary Cover</span>
          </div>
        )}

        {/* Image index counter badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900/80 backdrop-blur-md text-white text-xs font-medium shadow">
          <Camera className="w-3.5 h-3.5 text-neutral-300" />
          <span>
            {activeIndex + 1} / {safeImages.length}
          </span>
        </div>

        {/* Caption bar */}
        {currentImage.caption && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white text-xs font-medium">
            {currentImage.caption}
          </div>
        )}

        {/* Navigation arrows (if > 1 image) */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-lg transition-all opacity-90 hover:scale-105 active:scale-95"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-lg transition-all opacity-90 hover:scale-105 active:scale-95"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Zoom Lightbox Trigger */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white text-neutral-800 shadow-md transition-all hover:scale-105"
          title="Inspect Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Thumbnail Carousel Strip */}
      {safeImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border-2 transition-all ${
                activeIndex === idx
                  ? "border-emerald-600 ring-2 ring-emerald-500/30 scale-100"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {img.isPrimary && (
                <div className="absolute top-1 left-1 bg-amber-500 rounded-full p-0.5">
                  <Star className="w-2 h-2 text-white fill-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
            <img
              src={currentImage.url}
              alt="Fullscreen view"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
          {safeImages.length > 1 && (
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={handlePrev}
                className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-white text-sm">
                {activeIndex + 1} of {safeImages.length}
              </span>
              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
