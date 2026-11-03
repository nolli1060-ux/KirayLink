"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Trash2,
  Star,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Camera,
  FileImage,
  Info,
} from "lucide-react";

interface UploadingItem {
  id: string;
  name: string;
  size: number;
  previewUrl: string;
  error?: string;
}

interface ImageUploadProps {
  images: string[];
  primaryImage: string;
  onChange: (images: string[], primaryImage: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  maxFiles?: number;
}

export default function ImageUpload({
  images,
  primaryImage,
  onChange,
  onUploadingChange,
  maxFiles = 12,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingQueue, setUploadingQueue] = useState<UploadingItem[]>([]);
  const [photoMetadata, setPhotoMetadata] = useState<Record<string, { name: string; size: number }>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes <= 0) return "";
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const cleanFilename = (url: string): string => {
    if (photoMetadata[url]?.name) return photoMetadata[url].name;
    const raw = url.split("/").pop() || "photograph.jpg";
    return raw.replace(/^prop_\d+_[a-f0-9]+/, "photo").replace(/\?.*$/, "");
  };

  const handleFiles = async (selectedFiles: FileList | File[]) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const fileArray = Array.from(selectedFiles);

    if (fileArray.length === 0) return;

    const totalCount = images.length + uploadingQueue.length + fileArray.length;
    if (totalCount > maxFiles) {
      setErrorMessage(`You can select a maximum of ${maxFiles} photographs per property.`);
      return;
    }

    // Validate size and format
    const validFiles: File[] = [];
    for (const file of fileArray) {
      const validMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validMimes.includes(file.type.toLowerCase())) {
        setErrorMessage(
          `"${file.name}" has an unsupported format. Supported formats are JPG, JPEG, PNG, and WEBP.`
        );
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(
          `"${file.name}" (${formatFileSize(file.size)}) exceeds the maximum allowed size of 10MB.`
        );
        return;
      }
      validFiles.push(file);
    }

    // 1. Immediately create preview objects so previews and filenames appear immediately
    const newItems: UploadingItem[] = validFiles.map((file) => ({
      id: `up_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
    }));

    setUploadingQueue((prev) => [...prev, ...newItems]);
    onUploadingChange?.(true);

    // 2. Upload files to /api/upload
    let currentImages = [...images];
    let currentPrimary = primaryImage;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const item = newItems[i];

      try {
        const formData = new FormData();
        formData.append("files", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.urls?.[0]) {
          throw new Error(data.error || `Failed to upload "${file.name}".`);
        }

        const uploadedUrl = data.urls[0] as string;

        // Save metadata
        setPhotoMetadata((prev) => ({
          ...prev,
          [uploadedUrl]: { name: file.name, size: file.size },
        }));

        currentImages = [...currentImages, uploadedUrl];
        if (!currentPrimary) {
          currentPrimary = uploadedUrl;
        }

        // Revoke blob URL
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {}

        // Remove from uploading queue
        setUploadingQueue((prev) => prev.filter((p) => p.id !== item.id));

        // Update parent
        onChange(currentImages, currentPrimary);
      } catch (err) {
        console.error("Upload error for file:", file.name, err);
        const errMsg = err instanceof Error ? err.message : "Upload failed.";
        setUploadingQueue((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, error: errMsg } : p))
        );
        setErrorMessage(`Failed to upload "${file.name}". Please try again.`);
      }
    }

    onUploadingChange?.(false);
    setSuccessMessage(
      `Successfully uploaded ${validFiles.length} photograph${validFiles.length > 1 ? "s" : ""}.`
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveReadyImage = async (urlToRemove: string) => {
    const updatedImages = images.filter((u) => u !== urlToRemove);
    let newPrimary = primaryImage;
    if (primaryImage === urlToRemove) {
      newPrimary = updatedImages[0] || "";
    }
    onChange(updatedImages, newPrimary);
    setSuccessMessage("Photograph removed.");

    // Clean up on server asynchronously
    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToRemove }),
      });
    } catch {}
  };

  const handleRemoveUploadingItem = (idToRemove: string) => {
    const item = uploadingQueue.find((i) => i.id === idToRemove);
    if (item) {
      try {
        URL.revokeObjectURL(item.previewUrl);
      } catch {}
    }
    setUploadingQueue((prev) => prev.filter((i) => i.id !== idToRemove));
  };

  const handleSetPrimary = (url: string) => {
    onChange(images, url);
    const name = cleanFilename(url);
    setSuccessMessage(`Set "${name}" as the main cover photograph.`);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const totalPhotosCount = images.length + uploadingQueue.length;

  return (
    <div className="space-y-4">
      {/* Header and Guidelines */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#242622]">
            Property Photographs *
          </label>
          <p className="text-xs text-[#77766F] mt-0.5">
            Select authentic photographs from your computer or phone. Real photographs only — no URL inputs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#123B32] font-semibold bg-[#F5EFE4] border border-[#C6A56B]/40 px-3 py-1 rounded-full">
            {totalPhotosCount} / {maxFiles} Selected
          </span>
        </div>
      </div>

      {/* Recommended Shots Reminder */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8F6F0] border border-[#EDE8DE] text-xs text-[#77766F]">
        <Info className="w-4 h-4 text-[#C6A56B] shrink-0" aria-hidden="true" />
        <span>
          Recommended areas: Living Room, Master Bedroom, Kitchen, Bathrooms, and Balcony / Exterior View.
        </span>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FBEAE9] border border-[#A63228]/30 text-xs text-[#A63228]"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="ml-2 text-[#A63228] hover:opacity-80 font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#EAF3F0] border border-[#174A3D]/30 text-xs text-[#174A3D]"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 flex items-center justify-between">
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="ml-2 text-[#174A3D] hover:opacity-80 font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
        className="hidden"
        disabled={totalPhotosCount >= maxFiles}
      />

      {/* Drag & Drop Upload Zone with Explicit "Upload Photos" button */}
      {totalPhotosCount < maxFiles && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-2xl transition-all ${
            isDragOver
              ? "border-[#C6A56B] bg-[#F5EFE4]"
              : "border-[#EDE8DE] bg-[#F8F6F0] hover:border-[#C6A56B] hover:bg-[#F5EFE4]/30"
          }`}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#C6A56B] shadow-xs">
              <Camera className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-serif font-semibold text-[#242622]">
                Drag and drop photographs here, or choose from device
              </p>
              <p className="text-xs text-[#77766F] mt-1 font-sans">
                Accepted formats: JPG, JPEG, PNG, WEBP (Max 10MB per photograph)
              </p>
            </div>

            {/* Explicit "Upload Photos" button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#123B32] px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#174A3D] active:scale-98 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6A56B] cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />
                <span>Upload Photos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Previews Grid with Filenames and Main Cover Selection */}
      {totalPhotosCount > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <p className="font-medium text-[#77766F]">
              Click <strong>&quot;Set as Main Cover&quot;</strong> on any photo to use it as the listing thumbnail.
            </p>
            {totalPhotosCount < maxFiles && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 font-semibold text-[#C6A56B] hover:text-[#b39257] transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Upload More Photos</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* 1. Uploaded / Ready Images */}
            {images.map((url, idx) => {
              const isCover = primaryImage === url || (!primaryImage && idx === 0);
              const filename = cleanFilename(url);
              const size = photoMetadata[url]?.size || 0;

              return (
                <div
                  key={url}
                  className={`relative flex flex-col rounded-xl overflow-hidden border-2 bg-white shadow-xs transition-all ${
                    isCover
                      ? "border-[#C6A56B] ring-2 ring-[#C6A56B]/30"
                      : "border-[#EDE8DE] hover:border-[#C6A56B]/60"
                  }`}
                >
                  {/* Photo Preview Container */}
                  <div className="relative aspect-[4/3] w-full bg-[#F8F6F0] overflow-hidden">
                    <Image
                      src={url}
                      alt={filename}
                      fill
                      sizes="300px"
                      className="object-cover"
                    />

                    {/* Main Cover Badge */}
                    {isCover && (
                      <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#C6A56B] text-[#123B32] shadow-sm">
                        <Star className="w-3 h-3 fill-current" aria-hidden="true" />
                        Main Cover
                      </span>
                    )}

                    {/* Quick Remove Button on Preview */}
                    <button
                      type="button"
                      onClick={() => handleRemoveReadyImage(url)}
                      title="Remove this photograph"
                      className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-600/90 text-white hover:bg-red-700 shadow-sm cursor-pointer transition-transform active:scale-95"
                      aria-label={`Remove ${filename}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Photo Metadata Footer (Filename & File Size) */}
                  <div className="p-3 bg-white flex flex-col justify-between flex-1 space-y-2 border-t border-[#EDE8DE]">
                    <div className="flex items-start gap-2">
                      <FileImage className="w-4 h-4 text-[#C6A56B] shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs font-semibold text-[#242622] truncate"
                          title={filename}
                        >
                          {filename}
                        </p>
                        {size > 0 && (
                          <p className="text-[10px] text-[#77766F]">
                            {formatFileSize(size)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons bar */}
                    <div className="flex items-center justify-between pt-1">
                      {isCover ? (
                        <span className="text-[11px] font-semibold text-[#123B32] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#174A3D]" aria-hidden="true" />
                          Selected as Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(url)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#242622] hover:text-[#C6A56B] cursor-pointer transition-colors"
                        >
                          <Star className="w-3 h-3 text-[#C6A56B]" aria-hidden="true" />
                          <span>Set as Main Cover</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveReadyImage(url)}
                        className="text-[11px] font-medium text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 2. Currently Uploading Previews (immediate feedback) */}
            {uploadingQueue.map((item) => (
              <div
                key={item.id}
                className="relative flex flex-col rounded-xl overflow-hidden border-2 border-dashed border-[#EDE8DE] bg-[#F8F6F0] shadow-xs"
              >
                <div className="relative aspect-[4/3] w-full bg-[#EDE8DE] overflow-hidden">
                  <Image
                    src={item.previewUrl}
                    alt={item.name}
                    fill
                    sizes="300px"
                    className="object-cover opacity-70"
                  />

                  {item.error ? (
                    <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center text-white p-2 text-center">
                      <AlertCircle className="w-6 h-6 text-white mb-1" aria-hidden="true" />
                      <span className="text-[11px] font-medium">{item.error}</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#C6A56B] mb-1" aria-hidden="true" />
                      <span className="text-[11px] font-medium">Uploading to storage...</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveUploadingItem(item.id)}
                    className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-600/90 text-white hover:bg-red-700 shadow-sm cursor-pointer"
                    aria-label={`Cancel ${item.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                <div className="p-3 bg-white flex flex-col justify-between flex-1 space-y-1 border-t border-[#EDE8DE]">
                  <div className="flex items-start gap-2">
                    <FileImage className="w-4 h-4 text-[#C6A56B] shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#242622] truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-[#77766F]">
                        {formatFileSize(item.size)} · Uploading...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
