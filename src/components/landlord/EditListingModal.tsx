"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle, CheckCircle2, Loader2, Edit3 } from "lucide-react";
import Input from "@/components/ui/Input";
import ImageUpload from "@/components/properties/ImageUpload";
import { updatePropertyAction } from "@/lib/dashboard-actions";
import type { Property, PropertyType } from "@/types/property";

interface EditListingModalProps {
  property: Property;
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

export default function EditListingModal({
  property,
  isOpen,
  onClose,
  onSuccess,
}: EditListingModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize images from property
  const initialImages: string[] =
    property.images && property.images.length > 0
      ? property.images
      : property.imageUrl
      ? [property.imageUrl]
      : [];

  const [images, setImages] = useState<string[]>(initialImages);
  const [primaryImage, setPrimaryImage] = useState<string>(
    property.imageUrl || initialImages[0] || ""
  );

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    property.amenities && property.amenities.length > 0
      ? property.amenities
      : ["24/7 Security", "Dedicated Water Reservoir"]
  );

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
      setError("Please ensure at least one photograph of the residence remains uploaded.");
      setIsSubmitting(false);
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("propertyId", property.id);
    formData.set("images", JSON.stringify(images));
    formData.set("primaryImage", primaryImage || images[0] || "");
    formData.set("amenities", selectedAmenities.join(","));

    try {
      const res = await updatePropertyAction(null, formData);
      if (!res.success) {
        setError(res.error || "Failed to update property listing.");
        setIsSubmitting(false);
        return;
      }

      setSuccess("Residence changes saved successfully!");
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
      setError("An unexpected network error occurred while saving.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#EDE8DE] overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE8DE] bg-[#F8F6F0]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123B32] text-[#C6A56B]">
              <Edit3 className="w-5 h-5 text-[#C6A56B]" aria-hidden="true" />
            </div>
            <div>
              <h2 id="edit-modal-title" className="text-lg font-serif font-bold text-[#242622]">
                Edit Residence Details
              </h2>
              <p className="text-xs text-[#77766F]">
                Update rental terms, living specifications, or photographs.
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

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C6A56B]">
              1. Residence Overview
            </h3>

            <Input
              label="Property Title *"
              name="title"
              defaultValue={property.title}
              required
              placeholder="e.g. Modern Two-Bedroom Apartment in Bole Atlas"
            />

            <Input
              label="Tagline"
              name="tagline"
              defaultValue={property.tagline}
              placeholder="e.g. Spacious modern condo near transit and dining"
            />

            <div className="space-y-1.5">
              <label
                htmlFor="edit-description"
                className="block text-xs font-semibold uppercase tracking-wider text-[#242622]"
              >
                Detailed Description *
              </label>
              <textarea
                id="edit-description"
                name="description"
                defaultValue={property.description}
                required
                rows={4}
                className="w-full text-xs text-[#242622] bg-[#F8F6F0] border border-[#EDE8DE] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#C6A56B] transition-colors resize-y"
              />
            </div>
          </div>

          {/* Section 2: Pricing & Specs */}
          <div className="space-y-4 pt-4 border-t border-[#EDE8DE]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C6A56B]">
              2. Financials & Space Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Monthly Rent (ETB) *"
                name="price"
                type="number"
                defaultValue={property.price}
                required
                min={100}
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-propertyType"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#242622]"
                >
                  Property Type *
                </label>
                <select
                  id="edit-propertyType"
                  name="propertyType"
                  defaultValue={property.propertyType}
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
                defaultValue={property.bedrooms}
                required
                min={0}
              />
              <Input
                label="Bathrooms *"
                name="bathrooms"
                type="number"
                defaultValue={property.bathrooms}
                required
                min={1}
              />
              <Input
                label="Area (m²) *"
                name="areaSqM"
                type="number"
                defaultValue={property.care}
                required
                min={1}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-furnished"
                  name="furnished"
                  value="true"
                  defaultChecked={property.furnished}
                  className="h-4 w-4 rounded border-[#EDE8DE] text-[#123B32] focus:ring-[#C6A56B]"
                />
                <label
                  htmlFor="edit-furnished"
                  className="text-xs font-semibold text-[#242622] cursor-pointer"
                >
                  Fully Furnished Residence
                </label>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-status"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#242622]"
                >
                  Availability Status *
                </label>
                <select
                  id="edit-status"
                  name="status"
                  defaultValue={property.status}
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
                defaultValue={property.region || "Addis Ababa"}
                required
              />

              <Input
                label="City *"
                name="city"
                defaultValue={property.city || "Addis Ababa"}
                required
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-neighborhood"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#242622]"
                >
                  District / Sub-city *
                </label>
                <select
                  id="edit-neighborhood"
                  name="neighborhood"
                  defaultValue={property.neighborhood}
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
              defaultValue={property.location}
              required
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
                  <span>Saving Changes...</span>
                </>
              ) : isUploadingPhotos ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Uploading Photographs...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
