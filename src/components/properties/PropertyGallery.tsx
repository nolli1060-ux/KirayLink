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
      <div className="relative flex aspect-[16/10] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border bg-card p-8 text-center text-secondary shadow-card">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-muted text-accent-text shadow-sm">
          <Camera className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="font-serif text-base font-medium text-primary">No photographs uploaded</p>
        <p className="mt-1 max-w-sm text-xs text-secondary">The landlord has not attached photography to this listing record yet.</p>
      </div>
    );
  }

  const currentImage = displayImages[activeIdx] || displayImages[0];

  return (
    <div className="space-y-4" role="region" aria-label="Property photograph gallery">
      {/* Primary Display View */}
      <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-border bg-surface-muted shadow-card">
        <Image
          src={currentImage}
          alt={`${title} - Photograph ${activeIdx + 1} of ${displayImages.length}`}
          fill
          loading="eager"
          sizes="(max-width: 1200px) 100vw, 800px"
          className="object-cover transition-opacity duration-300"
        />

        {/* Counter Badge */}
        <div className="absolute bottom-4 right-4 z-10 rounded-full border border-white/25 bg-strong-surface/90 px-3.5 py-1.5 text-xs font-medium text-on-strong-surface backdrop-blur-md">
          {activeIdx + 1} / {displayImages.length} Photographs
        </div>

        {/* Previous / Next Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photograph"
              className="absolute left-3.5 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-strong-surface/80 text-on-strong-surface backdrop-blur-md transition-colors hover:bg-strong-surface hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photograph"
              className="absolute right-3.5 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-strong-surface/80 text-on-strong-surface backdrop-blur-md transition-colors hover:bg-strong-surface hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {displayImages.length > 1 && (
        <div
          className="grid grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-3 lg:grid-cols-8"
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
                    ? "border-accent ring-2 ring-focus/30 opacity-100"
                    : "border-border opacity-65 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  loading={idx === 0 ? "eager" : "lazy"}
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
