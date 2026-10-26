"use client";

import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import type { PropertyFiltersState } from "@/types/property";
import Button from "@/components/ui/Button";
import { formatNumber } from "@/lib/utils";

interface PropertyFiltersProps {
  filters: PropertyFiltersState;
  onChange: (updates: Partial<PropertyFiltersState>) => void;
  onReset: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const propertyTypes = [
  "All Types",
  "Apartment",
  "Penthouse",
  "Villa",
  "Townhouse",
  "Studio",
];

const neighborhoods = [
  "All Districts",
  "Bole Atlas",
  "Old Airport",
  "Kazanchis",
  "Sarbet",
  "CMC",
  "Bole Medhanialem",
];

const bedroomOptions = [
  { value: "any", label: "Any" },
  { value: "1", label: "1 Bed" },
  { value: "2", label: "2 Beds" },
  { value: "3", label: "3 Beds" },
  { value: "4", label: "4+ Beds" },
];

export default function PropertyFilters({
  filters,
  onChange,
  onReset,
  isOpenMobile,
  onCloseMobile,
}: PropertyFiltersProps) {
  const content = (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E6E0D5]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#8C6E43]" aria-hidden="true" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
            Filter Residences
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-[#8C6E43] hover:text-[#0F172A] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" aria-hidden="true" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Property Type */}
      <div className="space-y-2">
        <label
          htmlFor="filter-property-type"
          className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider block"
        >
          Property Type
        </label>
        <select
          id="filter-property-type"
          value={filters.propertyType}
          onChange={(e) => onChange({ propertyType: e.target.value })}
          className="w-full bg-[#FDFBF7] border border-[#E6E0D5] rounded px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
        >
          {propertyTypes.map((type) => (
            <option
              key={type}
              value={type === "All Types" ? "" : type}
            >
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Neighborhood / District */}
      <div className="space-y-2">
        <label
          htmlFor="filter-neighborhood"
          className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider block"
        >
          District
        </label>
        <select
          id="filter-neighborhood"
          value={filters.neighborhood}
          onChange={(e) => onChange({ neighborhood: e.target.value })}
          className="w-full bg-[#FDFBF7] border border-[#E6E0D5] rounded px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
        >
          {neighborhoods.map((district) => (
            <option
              key={district}
              value={district === "All Districts" ? "" : district}
            >
              {district}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Bedrooms */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider block">
          Bedrooms
        </span>
        <div className="grid grid-cols-5 gap-1">
          {bedroomOptions.map((opt) => {
            const isSelected = filters.bedrooms === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ bedrooms: opt.value })}
                className={`py-1.5 text-xs font-medium rounded border transition-colors cursor-pointer text-center ${
                  isSelected
                    ? "bg-[#0F172A] text-white border-[#0F172A]"
                    : "bg-[#FDFBF7] text-[#5B677A] border-[#E6E0D5] hover:border-[#C5A880] hover:text-[#0F172A]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Price Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
            Monthly Rent (ETB)
          </span>
          <span className="text-xs text-[#8C6E43] font-semibold">
            ETB {formatNumber(filters.minPrice)} - ETB {formatNumber(filters.maxPrice)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="min-price-input"
              className="text-[10px] text-[#5B677A] uppercase block mb-1"
            >
              Min (ETB)
            </label>
            <input
              id="min-price-input"
              type="number"
              min="0"
              step="1000"
              value={filters.minPrice}
              onChange={(e) =>
                onChange({ minPrice: Number(e.target.value) || 0 })
              }
              className="w-full bg-[#FDFBF7] border border-[#E6E0D5] rounded px-2.5 py-1.5 text-xs text-[#0F172A]"
            />
          </div>

          <div>
            <label
              htmlFor="max-price-input"
              className="text-[10px] text-[#5B677A] uppercase block mb-1"
            >
              Max (ETB)
            </label>
            <input
              id="max-price-input"
              type="number"
              min="1000"
              step="1000"
              value={filters.maxPrice}
              onChange={(e) =>
                onChange({ maxPrice: Number(e.target.value) || 100000 })
              }
              className="w-full bg-[#FDFBF7] border border-[#E6E0D5] rounded px-2.5 py-1.5 text-xs text-[#0F172A]"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        aria-label="Property filters"
        className="hidden lg:block w-72 bg-white border border-[#E6E0D5] rounded-lg p-5 shrink-0 self-start sticky top-28"
      >
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter residences"
          className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
        >
          <div className="bg-white w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-xl sm:rounded-xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E0D5]">
              <h2 className="text-base font-bold text-[#0F172A]">
                Filters
              </h2>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded text-slate-500 hover:text-black cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {content}

            <div className="pt-4 border-t border-[#E6E0D5] flex gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={onReset}
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={onCloseMobile}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
