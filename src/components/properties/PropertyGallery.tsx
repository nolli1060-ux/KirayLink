"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { getSafeImageUrl } from "@/lib/utils";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyGallery({
  images,
  title,
}: PropertyGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const displayImages = (images || []).map(getSafeImageUrl).filter(Boolean);

  const handlePrev = useCallback(() => {
    setActiveIdx((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
  }, [displayImages.length]);

  const handleNext = useCallback(() => {
    setActiveIdx((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
  }, [displayImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (displayImages.length <= 1) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [displayImages.length, handlePrev, handleNext]);

  if (displayImages.length === 0) {
    return (
      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-white border border-dashed border-[#EDE8DE] flex flex-col items-center justify-center p-8 text-center text-[#77766F] shadow-xs">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F6F0] text-[#123B32] border border-[#C6A56B]/30 shadow-xs mb-3">
          <Camera className="w-6 h-6 text-[#C6A56B]" aria-hidden="true" />
        </div>
        <p className="text-base font-bold text-[#123B32] font-serif">No Photographs Uploaded</p>
        <p className="text-xs text-[#77766F] mt-1 max-w-sm">The landlord has not attached photography to this listing record yet.</p>
      </div>
    );
  }

  const currentImage = displayImages[activeIdx] || displayImages[0];

  return (
    <div className="space-y-4" role="region" aria-label="Property Photograph Gallery">
      {/* Primary Display View */}
      <div className="group relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100 border border-[#EDE8DE] shadow-xs">
        <Image
          src={currentImage}
          alt={`${title} - Photograph ${activeIdx + 1} of ${displayImages.length}`}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 800px"
          className="object-cover transition-opacity duration-300"
        />

        {/* Counter Badge */}
        <div className="absolute bottom-4 right-4 z-10 bg-[#123B32]/90 text-white border border-[#C6A56B]/30 text-xs px-3.5 py-1 rounded-full backdrop-blur-md font-semibold">
          {activeIdx + 1} / {displayImages.length} Photographs
        </div>

        {/* Previous / Next Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photograph"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[#123B32]/80 text-[#F8F6F0] border border-[#C6A56B]/30 backdrop-blur-md transition-all hover:bg-[#123B32] hover:text-[#C6A56B] active:scale-95 focus-visible:outline-2 focus-visible:outline-white cursor-pointer sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photograph"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[#123B32]/80 text-[#F8F6F0] border border-[#C6A56B]/30 backdrop-blur-md transition-all hover:bg-[#123B32] hover:text-[#C6A56B] active:scale-95 focus-visible:outline-2 focus-visible:outline-white cursor-pointer sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {displayImages.length > 1 && (
        <div
          className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 sm:gap-3"
          role="tablist"
          aria-label="Gallery thumbnails"
        >
          {displayImages.map((img, idx) => {
            const isActive = activeIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveIdx(idx)}
                aria-label={`View photograph ${idx + 1}`}
                className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-[#C6A56B] ring-2 ring-[#C6A56B]/30 opacity-100 scale-102"
                    : "border-transparent opacity-65 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="140px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
