"use client";

import { useState } from "react";
import { X, Plus, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createPropertyAction } from "@/lib/dashboard-actions";
import type { PropertyType } from "@/types/property";

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROPERTY_TYPES: PropertyType[] = [
  "Apartment",
  "Penthouse",
  "Townhouse",
  "Villa",
  "Studio",
];

const DISTRICTS = [
  "Bole",
  "Bole Atlas",
  "Bole Rwanda",
  "Old Airport",
  "Kazanchis",
  "Sarbet",
  "CMC",
  "Ayat",
  "Summit",
  "Signal",
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "24/7 Security",
    "Full Backup Generator",
    "Dedicated Water Reservoir",
    "Secure Underground Parking",
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

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("amenities", selectedAmenities.join(", "));

    try {
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
        // Force refresh to update data
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred while submitting.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#E6E0D5] overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E0D5] bg-[#FDFBF7]">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-[#0F172A]">
              Add New Residence
            </h2>
            <p className="text-xs text-[#5B677A] mt-0.5">
              Add a property listing for people looking to rent.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#5B677A] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
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
              className="flex items-start gap-3 p-4 bg-[#FBEAE9] border border-[#A63228]/30 rounded-lg text-xs text-[#A63228]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="flex items-center gap-3 p-4 bg-[#EDF7F2] border border-[#1B6348]/30 rounded-lg text-xs text-[#1B6348]"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{success}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C6E43]">
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
                className="block text-xs font-semibold text-[#0F172A]"
              >
                Detailed Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Describe architectural highlights, interior finishes, embassy proximity, security features, and terms..."
                className="w-full text-xs text-[#0F172A] bg-white border border-[#CBD5E1] rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] transition-colors resize-y"
              />
            </div>
          </div>

          {/* Section 2: Pricing and Dimensions */}
          <div className="space-y-4 pt-4 border-t border-[#F0ECE3]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C6E43]">
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
                  className="block text-xs font-semibold text-[#0F172A]"
                >
                  Property Type *
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  className="w-full h-10 text-xs text-[#0F172A] bg-white border border-[#CBD5E1] rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] transition-colors"
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
                label="Area (m²) *"
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
                className="h-4 w-4 rounded border-[#CBD5E1] text-[#0F172A] focus:ring-[#C5A880]"
              />
              <label
                htmlFor="furnished"
                className="text-xs font-semibold text-[#0F172A] cursor-pointer"
              >
                Fully Furnished
              </label>
            </div>
          </div>

          {/* Section 3: Location */}
          <div className="space-y-4 pt-4 border-t border-[#F0ECE3]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C6E43]">
              3. Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="neighborhood"
                  className="block text-xs font-semibold text-[#0F172A]"
                >
                  District / Neighborhood *
                </label>
                <select
                  id="neighborhood"
                  name="neighborhood"
                  className="w-full h-10 text-xs text-[#0F172A] bg-white border border-[#CBD5E1] rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] transition-colors"
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

          {/* Section 4: Imagery */}
          <div className="space-y-4 pt-4 border-t border-[#F0ECE3]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C6E43]">
              4. Photography
            </h3>

            <Input
              label="Primary Image URL"
              name="imageUrl"
              type="url"
              placeholder="https://images.unsplash.com/..."
              helperText="Add a direct image link. Leave blank to use the default image."
            />
          </div>

          {/* Section 5: Key Amenities */}
          <div className="space-y-3 pt-4 border-t border-[#F0ECE3]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C6E43]">
              5. Amenities & Utilities
            </h3>
            <p className="text-xs text-[#5B677A]">
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
                        ? "bg-[#FDFBF7] border-[#C5A880] text-[#0F172A] font-medium"
                        : "bg-white border-[#E6E0D5] text-[#5B677A] hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(amenity)}
                      className="h-3.5 w-3.5 rounded border-[#CBD5E1] text-[#0F172A] focus:ring-[#C5A880]"
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-[#E6E0D5] flex items-center justify-end gap-3">
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
                  Publishing Residence...
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
