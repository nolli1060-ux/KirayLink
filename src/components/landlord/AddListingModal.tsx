"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle, CheckCircle2, Loader2, Building2 } from "lucide-react";
import Input from "@/components/ui/Input";
import ImageUpload from "@/components/properties/ImageUpload";
import { createPropertyAction } from "@/lib/dashboard-actions";
import type { PropertyType } from "@/types/property";

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PROPERTY_TYPES: PropertyType[] = [
  "Apartment",
  "Condominium",
  "Studio Apartment",
  "Single Room",
  "Townhouse",
  "Villa",
  "Penthouse",
];

const DISTRICTS = [
  "Bole",
  "Bole Atlas",
  "Bole Medhanialem",
  "Bole Rwanda",
  "Kazanchis",
  "Old Airport",
  "Sarbet",
  "CMC",
  "Ayat",
  "Summit",
  "Piassa",
  "Megenagna",
  "6 Killo",
  "Mekanisa",
  "Gotera",
  "Lebu",
];

const DEFAULT_AMENITIES = [
  "24/7 Security",
  "Backup Power Generator",
  "Dedicated Water Reservoir",
  "Underground / Secure Parking",
  "High-Speed Fiber Internet",
  "Private Balcony / Terrace",
  "Fitted Modern Kitchen",
  "Water Heater / Geyser",
  "Elevator Access",
];

export default function AddListingModal({
  isOpen,
  onClose,
  onSuccess,
}: AddListingModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [images, setImages] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string>("");

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "24/7 Security",
    "Dedicated Water Reservoir",
  ]);

  if (!isOpen) return null;

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    if (images.length === 0) {
      setError("Please upload at least one photograph of the property.");
      setIsSubmitting(false);
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("images", JSON.stringify(images));
    formData.set("primaryImage", primaryImage || images[0] || "");
    formData.set("amenities", selectedAmenities.join(","));

    try {
      const res = await createPropertyAction(null, formData);
      if (!res.success) {
        setError(res.error || "Failed to create property listing.");
        setIsSubmitting(false);
        return;
      }

      setSuccess("Residence listing successfully published!");
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred while publishing.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#EDE8DE] overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE8DE] bg-[#F8F6F0]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123B32] text-[#C6A56B]">
              <Building2 className="w-5 h-5 text-[#C6A56B]" aria-hidden="true" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-serif font-bold text-[#242622]">
                Add New Residence
              </h2>
              <p className="text-xs text-[#77766F]">
                Publish a rental property listing for prospective tenants.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#77766F] hover:text-[#242622] hover:bg-[#EDE8DE] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 p-4 bg-[#FBEAE9] border border-[#A63228]/30 rounded-xl text-xs text-[#A63228]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="flex items-center gap-3 p-4 bg-[#EAF3F0] border border-[#174A3D]/30 rounded-xl text-xs text-[#174A3D]"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{success}</span>
            </div>
          )}

          {/* Section 1: Property Overview */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C6A56B]">
              1. Residence Overview
            </h3>

            <Input
              label="Property Title *"
              name="title"
              required
              placeholder="e.g. Modern Two-Bedroom Apartment in Bole Atlas"
              helperText="Enter a descriptive title for this residence."
            />

            <Input
              label="Tagline *"
              name="tagline"
              placeholder="e.g. Sunny and spacious apartment with balcony and backup generator"
              helperText="A brief one-sentence summary shown on listing cards."
            />

            <div className="space-y-1.5">
              <label
                htmlFor="description"
                className="block text-xs font-semibold uppercase tracking-wider text-[#242622]"
              >
                Detailed Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Describe interior finishes, water/power supply, neighborhood proximity, security, lease terms, and move-in requirements..."
                className="w-full text-xs text-[#242622] bg-[#F8F6F0] border border-[#EDE8DE] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#C6A56B] transition-colors resize-y placeholder:text-[#77766F]/60"
              />
            </div>
          </div>

          {/* Section 2: Pricing & Specifications */}
          <div className="space-y-4 pt-4 border-t border-[#EDE8DE]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C6A56B]">
              2. Financials & Space Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Monthly Rent (ETB) *"
                name="price"
                type="number"
                required
                min={100}
                placeholder="25000"
                helperText="Monthly rental rate in Ethiopian Birr."
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="propertyType"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#242622]"
                >
                  Property Type *
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  className="w-full h-10 text-xs text-[#242622] bg-[#F8F6F0] border border-[#EDE8DE] rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-[#C6A56B] transition-colors cursor-pointer"
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
                defaultValue={1}
              />
              <Input
                label="Bathrooms *"
                name="bathrooms"
                type="number"
                required
                min={1}
                defaultValue={1}
              />
              <Input
                label="Area (m²) *"
                name="areaSqM"
                type="number"
                required
                min={1}
                defaultValue={60}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="furnished"
                  name="furnished"
                  value="true"
                  className="h-4 w-4 rounded border-[#EDE8DE] text-[#123B32] focus:ring-[#C6A56B]"
                />
                <label
                  htmlFor="furnished"
                  className="text-xs font-semibold text-[#242622] cursor-pointer"
                >
                  Fully Furnished Residence
                </label>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="status"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#242622]"
                >
                  Initial Availability *
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue="available"
                  className="w-full h-10 text-xs text-[#242622] bg-[#F8F6F0] border border-[#EDE8DE] rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-[#C6A56B] transition-colors cursor-pointer"
                >
                  <option value="available">Available for Rent</option>
                  <option value="pending">Pending Application</option>
                  <option value="rented">Currently Rented</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Location */}
          <div className="space-y-4 pt-4 border-t border-[#EDE8DE]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C6A56B]">
              3. Location & Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Region / State *"
                name="region"
                defaultValue="Addis Ababa"
                required
              />

              <Input
                label="City *"
                name="city"
                defaultValue="Addis Ababa"
                required
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="neighborhood"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#242622]"
                >
                  District / Sub-city *
                </label>
                <select
                  id="neighborhood"
                  name="neighborhood"
                  className="w-full h-10 text-xs text-[#242622] bg-[#F8F6F0] border border-[#EDE8DE] rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-[#C6A56B] transition-colors cursor-pointer"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Street Address / Specific Landmark *"
              name="location"
              required
              placeholder="e.g. Near Edna Mall, Namibia St, Bole"
              helperText="Helps tenants understand the exact vicinity."
            />
          </div>

          {/* Section 4: Property Photographs */}
          <div className="space-y-4 pt-4 border-t border-[#EDE8DE]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C6A56B]">
              4. Property Photographs
            </h3>

            <ImageUpload
              images={images}
              primaryImage={primaryImage}
              onUploadingChange={setIsUploadingPhotos}
              onChange={(newImgs, newPrimary) => {
                setImages(newImgs);
                setPrimaryImage(newPrimary);
              }}
            />
          </div>

          {/* Section 5: Facilities & Amenities */}
          <div className="space-y-3 pt-4 border-t border-[#EDE8DE]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C6A56B]">
              5. Facilities & Amenities
            </h3>
            <p className="text-xs text-[#77766F]">
              Check all verified amenities available with this residence:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {DEFAULT_AMENITIES.map((amenity) => {
                const checked = selectedAmenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      checked
                        ? "bg-[#F5EFE4] border-[#C6A56B] text-[#123B32] font-semibold"
                        : "bg-white border-[#EDE8DE] text-[#77766F] hover:bg-[#F8F6F0]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(amenity)}
                      className="h-3.5 w-3.5 rounded border-[#EDE8DE] text-[#123B32] focus:ring-[#C6A56B]"
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-6 border-t border-[#EDE8DE] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full border border-[#EDE8DE] bg-[#F8F6F0] px-5 py-2.5 text-xs font-semibold text-[#242622] hover:bg-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingPhotos || images.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-[#C6A56B] px-7 py-2.5 text-xs font-semibold text-[#123B32] hover:bg-[#d4b57e] transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Publishing Residence...</span>
                </>
              ) : isUploadingPhotos ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Uploading Photographs...</span>
                </>
              ) : (
                <span>Publish Residence</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
