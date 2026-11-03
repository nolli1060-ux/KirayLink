"use client";

import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import type { PropertyFiltersState } from "@/types/property";
import { formatNumber } from "@/lib/utils";

interface PropertyFiltersProps {
  filters: PropertyFiltersState;
  onChange: (updates: Partial<PropertyFiltersState>) => void;
  onReset: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  availablePropertyTypes?: string[];
  availableNeighborhoods?: string[];
  maxPriceLimit?: number;
}

const DEFAULT_TYPES = [
  "Apartment",
  "Condominium",
  "Studio Apartment",
  "Single Room",
  "Townhouse",
  "Villa",
  "Penthouse",
];

const DEFAULT_DISTRICTS = [
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
  availablePropertyTypes,
  availableNeighborhoods,
  maxPriceLimit = 1000000,
}: PropertyFiltersProps) {
  // Combine defaults with any real types found in database
  const propertyTypes = [
    "All Types",
    ...Array.from(new Set([...(availablePropertyTypes || []), ...DEFAULT_TYPES])),
  ];

  const neighborhoods = [
    "All Districts",
    ...Array.from(new Set([...(availableNeighborhoods || []), ...DEFAULT_DISTRICTS])),
  ];

  const content = (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#EDE8DE]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#123B32]">
            Filter Portfolio
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-[#77766F] hover:text-[#123B32] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 text-[#C6A56B]" aria-hidden="true" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Property Type */}
      <div className="space-y-2">
        <label
          htmlFor="filter-property-type"
          className="text-[11px] font-bold text-[#242622] uppercase tracking-[0.14em] block"
        >
          Residence Type
        </label>
        <select
          id="filter-property-type"
          value={filters.propertyType}
          onChange={(e) => onChange({ propertyType: e.target.value })}
          className="w-full bg-[#F8F6F0] border border-[#EDE8DE] rounded-xl px-3.5 py-2.5 text-xs text-[#242622] focus:outline-none focus:border-[#C6A56B] focus:ring-2 focus:ring-[#C6A56B]/25 transition-all cursor-pointer"
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
          className="text-[11px] font-bold text-[#242622] uppercase tracking-[0.14em] block"
        >
          District / Sub-city
        </label>
        <select
          id="filter-neighborhood"
          value={filters.neighborhood}
          onChange={(e) => onChange({ neighborhood: e.target.value })}
          className="w-full bg-[#F8F6F0] border border-[#EDE8DE] rounded-xl px-3.5 py-2.5 text-xs text-[#242622] focus:outline-none focus:border-[#C6A56B] focus:ring-2 focus:ring-[#C6A56B]/25 transition-all cursor-pointer"
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
      <div className="space-y-2.5">
        <span className="text-[11px] font-bold text-[#242622] uppercase tracking-[0.14em] block">
          Bedrooms
        </span>
        <div className="grid grid-cols-5 gap-1.5">
          {bedroomOptions.map((opt) => {
            const isSelected = filters.bedrooms === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ bedrooms: opt.value })}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                  isSelected
                    ? "bg-[#123B32] text-white border-[#123B32] shadow-xs"
                    : "bg-[#F8F6F0] text-[#77766F] border-[#EDE8DE] hover:border-[#C6A56B] hover:text-[#123B32]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Price Range */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#242622] uppercase tracking-[0.14em]">
            Monthly Rent (ETB)
          </span>
          <span className="text-xs text-[#C6A56B] font-bold font-serif">
            {formatNumber(filters.minPrice)} - {formatNumber(filters.maxPrice)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="min-price-input"
              className="text-[10px] text-[#77766F] uppercase tracking-wider block mb-1 font-semibold"
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
              className="w-full bg-[#F8F6F0] border border-[#EDE8DE] rounded-lg px-2.5 py-2 text-xs text-[#242622] focus:outline-none focus:border-[#C6A56B]"
            />
          </div>

          <div>
            <label
              htmlFor="max-price-input"
              className="text-[10px] text-[#77766F] uppercase tracking-wider block mb-1 font-semibold"
            >
              Max (ETB)
            </label>
            <input
              id="max-price-input"
              type="number"
              min="1000"
              step="5000"
              value={filters.maxPrice}
              onChange={(e) =>
                onChange({ maxPrice: Number(e.target.value) || maxPriceLimit })
              }
              className="w-full bg-[#F8F6F0] border border-[#EDE8DE] rounded-lg px-2.5 py-2 text-xs text-[#242622] focus:outline-none focus:border-[#C6A56B]"
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
        className="hidden lg:block w-72 bg-white border border-[#EDE8DE] rounded-2xl p-6 shrink-0 self-start sticky top-28 shadow-xs"
      >
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter residences"
          className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
        >
          <div className="bg-white w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6 space-y-6 shadow-2xl border border-[#EDE8DE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE8DE]">
              <h2 className="text-base font-bold text-[#123B32] font-serif">
                Filters
              </h2>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-full text-[#77766F] hover:text-[#242622] cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {content}

            <div className="pt-4 border-t border-[#EDE8DE] flex gap-3">
              <button
                type="button"
                onClick={onReset}
                className="flex-1 py-2.5 rounded-full border border-[#EDE8DE] text-xs font-semibold text-[#242622] hover:bg-[#F8F6F0] transition-colors"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={onCloseMobile}
                className="flex-1 py-2.5 rounded-full bg-[#123B32] text-xs font-bold text-white hover:bg-[#174A3D] transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
