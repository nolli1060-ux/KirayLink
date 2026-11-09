"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Search, SlidersHorizontal } from "lucide-react";
import type { PropertyType } from "@/types/property";
import { normalizePriceInput } from "@/lib/utils";

interface PropertySearchProps {
  initialQuery?: string;
  neighborhoods: string[];
  propertyTypes: PropertyType[];
}

export default function PropertySearch({
  initialQuery = "",
  neighborhoods,
  propertyTypes,
}: PropertySearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [neighborhood, setNeighborhood] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceError, setPriceError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minValue = minPrice === "" ? null : Number(minPrice);
    const maxValue = maxPrice === "" ? null : Number(maxPrice);
    if (
      (minValue !== null && (!Number.isFinite(minValue) || minValue <= 0)) ||
      (maxValue !== null && (!Number.isFinite(maxValue) || maxValue <= 0))
    ) {
      setPriceError("Enter a price greater than zero, or clear the field to remove that limit.");
      return;
    }
    if (minValue !== null && maxValue !== null && minValue > maxValue) {
      setPriceError("Minimum price must be less than or equal to maximum price.");
      return;
    }
    setPriceError("");
    const searchParams = new URLSearchParams();
    if (query.trim()) searchParams.set("search", query.trim());
    if (neighborhood) searchParams.set("neighborhood", neighborhood);
    if (propertyType) searchParams.set("type", propertyType);
    if (minPrice) searchParams.set("minPrice", minPrice);
    if (maxPrice) searchParams.set("maxPrice", maxPrice);
    const queryString = searchParams.toString();
    router.push(queryString ? `/listings?${queryString}` : "/listings");
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(12rem,1.3fr)_minmax(10rem,1fr)_minmax(9rem,0.9fr)_minmax(9rem,0.9fr)_minmax(9rem,0.9fr)_auto] lg:items-end"
    >
      {priceError && (
        <p
          id="property-search-price-error"
          role="alert"
          className="rounded-xl border border-status-danger/30 bg-status-danger-bg px-3 py-2 text-xs text-status-danger sm:col-span-2 lg:col-span-full"
        >
          {priceError}
        </p>
      )}
      <div className="min-w-0">
        <label htmlFor="property-search-input" className="mb-1.5 block px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
          Search
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-text" aria-hidden="true" />
          <input
            id="property-search-input"
            name="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search properties by location or keyword"
            className="min-h-12 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-primary placeholder:text-secondary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25 transition-colors"
          />
        </div>
      </div>
      <div className="min-w-0">
        <label htmlFor="property-search-neighborhood" className="mb-1.5 block px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
          Location
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-text" aria-hidden="true" />
          <select
            id="property-search-neighborhood"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="min-h-12 w-full appearance-none rounded-xl border border-border bg-background pl-10 pr-9 text-sm text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25"
          >
            <option value="">All locations</option>
            {neighborhoods.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" aria-hidden="true" />
        </div>
      </div>
      <div className="min-w-0">
        <label htmlFor="property-search-type" className="mb-1.5 block px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
          Property type
        </label>
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-text" aria-hidden="true" />
          <select
            id="property-search-type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="min-h-12 w-full appearance-none rounded-xl border border-border bg-background pl-10 pr-9 text-sm text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25"
          >
            <option value="">Any property</option>
            {propertyTypes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" aria-hidden="true" />
        </div>
      </div>
      <div className="min-w-0">
        <label htmlFor="property-search-min-price" className="mb-1.5 block px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
          Minimum price (ETB)
        </label>
        <div className="relative">
          <input
            id="property-search-min-price"
            type="text"
            inputMode="decimal"
            value={minPrice}
            onFocus={(e) => e.currentTarget.select()}
            onClick={(e) => e.currentTarget.select()}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPriceError("");
            }}
            onBlur={(e) => setMinPrice(normalizePriceInput(e.target.value))}
            placeholder="Enter minimum price"
            aria-invalid={Boolean(priceError)}
            aria-describedby={priceError ? "property-search-price-error" : undefined}
            className="min-h-12 w-full rounded-xl border border-border bg-background px-3 text-sm text-primary placeholder:text-secondary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25 transition-colors"
          />
        </div>
      </div>
      <div className="min-w-0">
        <label htmlFor="property-search-max-price" className="mb-1.5 block px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
          Maximum price (ETB)
        </label>
        <div className="relative">
          <input
            id="property-search-max-price"
            type="text"
            inputMode="decimal"
            value={maxPrice}
            onFocus={(e) => e.currentTarget.select()}
            onClick={(e) => e.currentTarget.select()}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPriceError("");
            }}
            onBlur={(e) => setMaxPrice(normalizePriceInput(e.target.value))}
            placeholder="Enter maximum price"
            aria-invalid={Boolean(priceError)}
            aria-describedby={priceError ? "property-search-price-error" : undefined}
            className="min-h-12 w-full rounded-xl border border-border bg-background px-3 text-sm text-primary placeholder:text-secondary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25 transition-colors"
          />
        </div>
      </div>
      <button
        type="submit"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-button-primary px-6 text-sm font-semibold text-button-primary-text shadow-sm transition-all hover:bg-button-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus cursor-pointer lg:rounded-full"
      >
        <span>Search</span>
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
