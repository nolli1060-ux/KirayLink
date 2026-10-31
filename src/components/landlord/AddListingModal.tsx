"use client";

import { useEffect, useRef, useState } from "react";
import { X, Plus, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createPropertyAction } from "@/lib/dashboard-actions";
import {
  MAX_PROPERTY_PHOTOS,
  MAX_PROPERTY_PHOTO_SIZE_BYTES,
  PROPERTY_IMAGE_MIME_TYPES,
} from "@/lib/property-image-constants";
import PropertyImageUploader, {
  type SelectedPropertyPhoto,
} from "@/components/landlord/PropertyImageUploader";
import type { PropertyType } from "@/types/property";

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROPERTY_TYPES: PropertyType[] = [
  "Apartment",
  "Condominium",
  "Single Room",
  "Villa",
  "Studio",
];

const DISTRICTS = [
  "Bole",
  "Koye",
  "Mexico",
  "Jemo",
  "Kazanchis",
  "Sarbet",
  "CMC",
  "Ayat",
  "Summit",
  "Asko",
];

const DEFAULT_AMENITIES = [
  "24/7 Security",
  "Full Backup Generator",
  "Dedicated Water Reservoir",
  "Secure Underground Parking",
  "High-Speed Fiber Internet",
  "Private Balcony / Terrace",
  "Modern Fitted Kitchen",
  "Master En-Suite with Jacuzzi",
];

export default function AddListingModal({ isOpen, onClose }: AddListingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPropertyPhoto[]>([]);
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null);
  const selectedPhotosRef = useRef(selectedPhotos);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "24/7 Security",
    "Full Backup Generator",
    "Dedicated Water Reservoir",
    "Secure Underground Parking",
  ]);

  useEffect(() => {
    selectedPhotosRef.current = selectedPhotos;
  }, [selectedPhotos]);

  useEffect(
    () => () => {
      selectedPhotosRef.current.forEach((photo) =>
        URL.revokeObjectURL(photo.previewUrl)
      );
    },
    []
  );

  if (!isOpen) return null;

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSelectPhotos = (files: FileList | null) => {
    if (!files?.length) return;

    const remainingSlots = MAX_PROPERTY_PHOTOS - selectedPhotos.length;
    const selectedFiles = Array.from(files);
    let selectionError: string | null = null;
    const validFiles = selectedFiles.filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const expectedExtension =
        PROPERTY_IMAGE_MIME_TYPES[
          file.type as keyof typeof PROPERTY_IMAGE_MIME_TYPES
        ];
      const supportedExtension =
        expectedExtension !== undefined &&
        (extension === expectedExtension ||
          (expectedExtension === "jpg" && extension === "jpeg"));

      if (!supportedExtension || file.size === 0) {
        selectionError = `${file.name} is not a supported JPG, PNG, or WEBP photo.`;
        return false;
      }
      if (file.size > MAX_PROPERTY_PHOTO_SIZE_BYTES) {
        selectionError = `${file.name} must be smaller than 10 MB.`;
        return false;
      }
      return true;
    });

    if (selectedFiles.length > remainingSlots) {
      selectionError = `You can upload up to ${MAX_PROPERTY_PHOTOS} photos.`;
    }

    const newPhotos = validFiles.slice(0, remainingSlots).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setSelectedPhotos((photos) => [...photos, ...newPhotos]);
    setCoverPhotoId((currentCover) => currentCover ?? newPhotos[0]?.id ?? null);
    setError(selectionError);
  };

  const handleRemovePhoto = (photoId: string) => {
    const removedPhoto = selectedPhotos.find((photo) => photo.id === photoId);
    if (removedPhoto) URL.revokeObjectURL(removedPhoto.previewUrl);
    const remainingPhotos = selectedPhotos.filter((photo) => photo.id !== photoId);
    setSelectedPhotos(remainingPhotos);
    if (coverPhotoId === photoId) {
      setCoverPhotoId(remainingPhotos[0]?.id ?? null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("amenities", selectedAmenities.join(", "));

    try {
      if (selectedPhotos.length > 0) {
        setIsUploadingPhotos(true);
        const uploadData = new FormData();
        selectedPhotos.forEach(({ file }) => uploadData.append("files", file));

        const uploadResponse = await fetch("/api/uploads/property-images", {
          method: "POST",
          body: uploadData,
        });
        const uploadResult = (await uploadResponse.json()) as {
          keys?: string[];
          error?: string;
        };
        if (
          !uploadResponse.ok ||
          !uploadResult.keys ||
          uploadResult.keys.length !== selectedPhotos.length
        ) {
          throw new Error(uploadResult.error || "The selected photos could not be uploaded.");
        }

        const coverIndex = selectedPhotos.findIndex(
          (photo) => photo.id === coverPhotoId
        );
        const orderedImages = [
          ...uploadResult.keys.slice(Math.max(0, coverIndex)),
          ...uploadResult.keys.slice(0, Math.max(0, coverIndex)),
        ];
        formData.set("images", JSON.stringify(orderedImages));
        setIsUploadingPhotos(false);
      }

      const result = await createPropertyAction(null, formData);
      if (!result.success) {
        setError(result.error || "Failed to publish listing.");
        setIsSubmitting(false);
        return;
      }

      setSuccess("Your property listing has been published.");
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        setSelectedPhotos([]);
        setCoverPhotoId(null);
        // Force refresh to update data
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected network error occurred while submitting."
      );
      setIsSubmitting(false);
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative w-full max-w-2xl bg-surface rounded-xl shadow-2xl border border-border overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-ivory">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-main">
              Add New Residence
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Add a property listing for people looking to rent.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-muted hover:text-main hover:bg-surface-subtle transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 p-4 bg-error-bg border border-[#A63228]/30 rounded-lg text-xs text-error"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="flex items-center gap-3 p-4 bg-success-bg border border-[#1B6348]/30 rounded-lg text-xs text-success"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{success}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-strong">
              1. Residence Overview
            </h3>

            <Input
              label="Property Title *"
              name="title"
              required
              placeholder="e.g. Two-Bedroom Apartment in Bole"
              helperText="Enter a clear name for the property (minimum 5 characters)."
            />

            <Input
              label="Tagline *"
              name="tagline"
              required
              placeholder="e.g. Bright apartment near shops and transit"
              helperText="A short summary shown on listing cards."
            />

            <div className="space-y-1.5">
              <label
                htmlFor="description"
                className="block text-xs font-semibold text-main"
              >
                Detailed Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Describe architectural highlights, interior finishes, embassy proximity, security features, and terms..."
                className="w-full text-xs text-main bg-surface border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] transition-colors resize-y"
              />
            </div>
          </div>

          {/* Section 2: Pricing and Dimensions */}
          <div className="space-y-4 pt-4 border-t border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-strong">
              2. Financials & Space Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Monthly Rent (ETB) *"
                name="price"
                type="number"
                required
                min={1000}
                placeholder="150000"
                helperText="Gross monthly rent in Ethiopian Birr."
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="propertyType"
                  className="block text-xs font-semibold text-main"
                >
                  Property Type *
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  className="w-full h-10 text-xs text-main bg-surface border border-border rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] transition-colors"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Bedrooms *"
                name="bedrooms"
                type="number"
                required
                min={0}
                defaultValue={3}
              />
              <Input
                label="Bathrooms *"
                name="bathrooms"
                type="number"
                required
                min={1}
                defaultValue={2}
              />
              <Input
                label="Area (mÃƒâ€šÃ‚Â²) *"
                name="areaSqM"
                type="number"
                required
                min={1}
                step={0.1}
                defaultValue={204.4}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="furnished"
                name="furnished"
                value="true"
                defaultChecked
                className="h-4 w-4 rounded border-border text-main focus:ring-[#C5A880]"
              />
              <label
                htmlFor="furnished"
                className="text-xs font-semibold text-main cursor-pointer"
              >
                Fully Furnished
              </label>
            </div>
          </div>

          {/* Section 3: Location */}
          <div className="space-y-4 pt-4 border-t border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-strong">
              3. Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="neighborhood"
                  className="block text-xs font-semibold text-main"
                >
                  District / Neighborhood *
                </label>
                <select
                  id="neighborhood"
                  name="neighborhood"
                  className="w-full h-10 text-xs text-main bg-surface border border-border rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] transition-colors"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="City *"
                name="city"
                defaultValue="Addis Ababa"
                required
              />
            </div>

            <Input
              label="Street Address / Area Landmark *"
              name="location"
              required
              placeholder="e.g. Namibia Street, Near European Union Delegation"
            />
          </div>

          {/* Section 4: Photography */}
          <div className="space-y-4 pt-4 border-t border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-strong">
              4. Photography
            </h3>

            <PropertyImageUploader
              photos={selectedPhotos}
              coverPhotoId={coverPhotoId}
              onSelectFiles={handleSelectPhotos}
              onRemove={handleRemovePhoto}
              onSelectCover={setCoverPhotoId}
            />
          </div>

          {/* Section 5: Key Amenities */}
          <div className="space-y-3 pt-4 border-t border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-strong">
              5. Amenities & Utilities
            </h3>
            <p className="text-xs text-muted">
              Select all verified amenities offered at this property:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEFAULT_AMENITIES.map((amenity) => {
                const checked = selectedAmenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className={`flex items-center gap-2 p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                      checked
                        ? "bg-ivory border-[#C5A880] text-main font-medium"
                        : "bg-surface border-border text-muted hover:bg-surface-subtle"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(amenity)}
                      className="h-3.5 w-3.5 rounded border-border text-main focus:ring-[#C5A880]"
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-border flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  {isUploadingPhotos ? "Uploading Photos..." : "Publishing Residence..."}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  Publish Residence
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
