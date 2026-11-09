"use client";

import { useEffect } from "react";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import type { PropertyFiltersState } from "@/types/property";
import { normalizePriceInput } from "@/lib/utils";

interface PropertyFiltersProps {
  filters: PropertyFiltersState;
  onChange: (updates: Partial<PropertyFiltersState>) => void;
  onReset: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  availablePropertyTypes?: string[];
  availableNeighborhoods?: string[];
  priceError?: string;
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
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4+" },
];

const bathroomOptions = [
  { value: "any", label: "Any" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3+" },
];

function ChoiceGroup({
  label,
  name,
  value,
  options,
  onSelect,
}: {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
        {label}
      </legend>
      <div className="grid grid-cols-5 gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            name={name}
            aria-pressed={value === option.value}
            onClick={() => onSelect(option.value)}
            className={`min-h-9 rounded-lg border px-1 text-xs font-medium transition-colors ${
              value === option.value
                ? "border-button-primary bg-button-primary text-button-primary-text"
                : "border-border bg-background text-secondary hover:border-accent hover:text-primary"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function PropertyFilters({
  filters,
  onChange,
  onReset,
  isOpenMobile,
  onCloseMobile,
  availablePropertyTypes,
  availableNeighborhoods,
  priceError,
}: PropertyFiltersProps) {
  useEffect(() => {
    if (!isOpenMobile) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseMobile();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpenMobile, onCloseMobile]);

  const propertyTypes = [
    "All types",
    ...Array.from(
      new Set([...(availablePropertyTypes || []), ...DEFAULT_TYPES])
    ),
  ];
  const neighborhoods = [
    "All locations",
    ...Array.from(
      new Set([...(availableNeighborhoods || []), ...DEFAULT_DISTRICTS])
    ),
  ];

  const content = (idSuffix: string) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-accent-text" aria-hidden="true" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Refine search
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary transition-colors hover:text-accent-text"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`filter-property-type-${idSuffix}`}
          className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary"
        >
          Property type
        </label>
        <select
          id={`filter-property-type-${idSuffix}`}
          value={filters.propertyType}
          onChange={(e) => onChange({ propertyType: e.target.value })}
          className="min-h-11 w-full rounded-xl border border-input-border bg-input px-3.5 text-sm text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25"
        >
          {propertyTypes.map((type) => (
            <option key={type} value={type === "All types" ? "" : type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`filter-neighborhood-${idSuffix}`}
          className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary"
        >
          Location
        </label>
        <select
          id={`filter-neighborhood-${idSuffix}`}
          value={filters.neighborhood}
          onChange={(e) => onChange({ neighborhood: e.target.value })}
          className="min-h-11 w-full rounded-xl border border-input-border bg-input px-3.5 text-sm text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25"
        >
          {neighborhoods.map((district) => (
            <option
              key={district}
              value={district === "All locations" ? "" : district}
            >
              {district}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`filter-availability-${idSuffix}`}
          className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary"
        >
          Availability
        </label>
        <select
          id={`filter-availability-${idSuffix}`}
          value={filters.availability}
          onChange={(e) =>
            onChange({
              availability: e.target.value as PropertyFiltersState["availability"],
            })
          }
          className="min-h-11 w-full rounded-xl border border-input-border bg-input px-3.5 text-sm capitalize text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25"
        >
          <option value="all">Any availability</option>
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="rented">Rented</option>
        </select>
      </div>

      <ChoiceGroup
        label="Bedrooms"
        name="bedrooms"
        value={filters.bedrooms}
        options={bedroomOptions}
        onSelect={(bedrooms) => onChange({ bedrooms })}
      />
      <ChoiceGroup
        label="Bathrooms"
        name="bathrooms"
        value={filters.bathrooms}
        options={bathroomOptions}
        onSelect={(bathrooms) => onChange({ bathrooms })}
      />

      <div className="space-y-3 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
            Price range · ETB
          </span>
        </div>
        <div
          className={`grid gap-3 ${
            idSuffix === "desktop" ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          <div className="space-y-1">
            <label htmlFor={`min-price-input-${idSuffix}`} className="text-[10px] font-medium text-secondary">
              Minimum price (ETB)
            </label>
            <input
              id={`min-price-input-${idSuffix}`}
              type="text"
              inputMode="decimal"
              value={filters.minPrice}
              onFocus={(e) => e.currentTarget.select()}
              onClick={(e) => e.currentTarget.select()}
              onChange={(e) => onChange({ minPrice: e.target.value })}
              onBlur={(e) =>
                onChange({ minPrice: normalizePriceInput(e.target.value) })
              }
              placeholder="Enter minimum price"
              aria-invalid={Boolean(priceError)}
              aria-describedby={priceError ? "price-range-error" : undefined}
              className="min-h-11 w-full rounded-lg border border-input-border bg-input px-2.5 text-sm text-primary placeholder:text-secondary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor={`max-price-input-${idSuffix}`} className="text-[10px] font-medium text-secondary">
              Maximum price (ETB)
            </label>
            <input
              id={`max-price-input-${idSuffix}`}
              type="text"
              inputMode="decimal"
              value={filters.maxPrice}
              onFocus={(e) => e.currentTarget.select()}
              onClick={(e) => e.currentTarget.select()}
              onChange={(e) => onChange({ maxPrice: e.target.value })}
              onBlur={(e) =>
                onChange({ maxPrice: normalizePriceInput(e.target.value) })
              }
              placeholder="Enter maximum price"
              aria-invalid={Boolean(priceError)}
              aria-describedby={priceError ? "price-range-error" : undefined}
              className="min-h-11 w-full rounded-lg border border-input-border bg-input px-2.5 text-sm text-primary placeholder:text-secondary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        aria-label="Property filters"
        className="sticky top-24 hidden w-72 shrink-0 self-start rounded-2xl border border-card-border bg-card p-5 shadow-card lg:block"
      >
        {content("desktop")}
      </aside>

      {isOpenMobile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter residences"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4 lg:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseMobile();
          }}
        >
          <div className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl border border-border bg-surface p-5 shadow-popover sm:max-w-md sm:rounded-3xl sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-text">
                  Tailor your search
                </p>
                <h2 className="mt-1 font-serif text-xl text-primary">Filters</h2>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-secondary transition-colors hover:border-accent hover:text-primary"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {content("mobile")}

            <div className="sticky bottom-0 mt-6 flex gap-3 border-t border-border bg-surface pt-4">
              <button
                type="button"
                onClick={onReset}
                className="min-h-11 flex-1 rounded-full border border-border text-sm font-medium text-primary transition-colors hover:border-accent"
              >
                Clear filters
              </button>
              <button
                type="button"
                onClick={onCloseMobile}
                className="min-h-11 flex-1 rounded-full bg-button-primary text-sm font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover"
              >
                Show residences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
