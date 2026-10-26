"use client";

import { useState } from "react";
import Image from "next/image";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyGallery({
  images,
  title,
}: PropertyGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const displayImages = images.length > 0 ? images : ["/placeholder.jpg"];

  return (
    <div className="space-y-3">
      {/* Primary Main Image */}
      <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-slate-100 border border-[#E6E0D5]">
        <Image
          src={displayImages[activeIdx]}
          alt={`${title} - View ${activeIdx + 1}`}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 800px"
          className="object-cover transition-opacity duration-300"
        />
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded backdrop-blur-sm">
          {activeIdx + 1} / {displayImages.length} Photos
        </div>
      </div>

      {/* Thumbnail Bar */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {displayImages.map((img, idx) => {
            const isActive = activeIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIdx(idx)}
                aria-label={`View photo ${idx + 1}`}
                className={`relative aspect-[16/10] rounded overflow-hidden border-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-[#C5A880] ring-2 ring-[#C5A880]/30"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="200px"
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
