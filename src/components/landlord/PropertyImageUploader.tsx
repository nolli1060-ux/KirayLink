"use client";

import { useRef } from "react";
import Image from "next/image";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import {
  MAX_PROPERTY_PHOTOS,
  MAX_PROPERTY_PHOTO_SIZE_BYTES,
} from "@/lib/property-image-constants";

export interface SelectedPropertyPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

interface PropertyImageUploaderProps {
  photos: SelectedPropertyPhoto[];
  coverPhotoId: string | null;
  onSelectFiles: (files: FileList | null) => void;
  onRemove: (photoId: string) => void;
  onSelectCover: (photoId: string) => void;
}

export default function PropertyImageUploader({
  photos,
  coverPhotoId,
  onSelectFiles,
  onRemove,
  onSelectCover,
}: PropertyImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-main">Upload Photos</p>
          <p className="mt-1 text-xs text-muted">
            JPG, JPEG, PNG, or WEBP Ãƒâ€šÃ‚Â· up to {MAX_PROPERTY_PHOTOS} photos Ãƒâ€šÃ‚Â· 10 MB each
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(event) => {
            onSelectFiles(event.currentTarget.files);
            event.currentTarget.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={photos.length >= MAX_PROPERTY_PHOTOS}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#C5A880] bg-ivory px-4 py-2 text-sm font-semibold text-main transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          Upload Photos
        </button>
      </div>

      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => {
            const isCover = photo.id === coverPhotoId;
            return (
              <li
                key={photo.id}
                className={`overflow-hidden rounded-lg border bg-surface ${
                  isCover ? "border-[#8C6E43] ring-2 ring-[#C5A880]/30" : "border-border"
                }`}
              >
                <div className="relative aspect-[4/3] bg-surface-subtle">
                  <Image
                    src={photo.previewUrl}
                    alt={`Preview of ${photo.file.name}`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover"
                  />
                  {isCover && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#0F172A]/85 px-2 py-1 text-[10px] font-semibold text-white">
                      <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                      Main cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemove(photo.id)}
                    aria-label={`Remove ${photo.file.name}`}
                    className="absolute right-2 top-2 rounded-full bg-surface/95 p-2 text-muted shadow-sm transition-colors hover:bg-error-bg hover:text-error"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="space-y-2 p-2.5">
                  <p
                    className="truncate text-xs font-medium text-main"
                    title={photo.file.name}
                  >
                    {photo.file.name}
                  </p>
                  {!isCover && (
                    <button
                      type="button"
                      onClick={() => onSelectCover(photo.id)}
                      className="inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold text-gold-strong hover:text-main"
                    >
                      <Star className="h-3.5 w-3.5" aria-hidden="true" />
                      Make main cover
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-32 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-subtle px-4 py-6 text-center transition-colors hover:border-[#C5A880] hover:bg-ivory"
        >
          <ImagePlus className="mb-2 h-6 w-6 text-gold-strong" aria-hidden="true" />
          <span className="text-sm font-semibold text-main">Choose property photos</span>
          <span className="mt-1 text-xs text-muted">
            Your first photo will be the main cover
          </span>
        </button>
      )}
      <p className="text-xs text-muted">
        {photos.length} of {MAX_PROPERTY_PHOTOS} photos selected Ãƒâ€šÃ‚Â· max{" "}
        {Math.round(MAX_PROPERTY_PHOTO_SIZE_BYTES / (1024 * 1024))} MB per photo
      </p>
    </div>
  );
}
