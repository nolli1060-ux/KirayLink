"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, X, Building2, PlusCircle, RotateCcw } from "lucide-react";
import type { Property, PropertyFiltersState } from "@/types/property";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyFilters from "@/components/properties/PropertyFilters";

interface ListingsClientProps {
  initialProperties: Property[];
  savedPropertyIds: string[];
}

export default function ListingsClient({
  initialProperties,
  savedPropertyIds,
}: ListingsClientProps) {
  const searchParams = useSearchParams();

  // Initialize filters from URL params if present
  const initialSearch = searchParams.get("search") || "";
  const initialType = searchParams.get("type") || "";
  const initialNeighborhood = searchParams.get("neighborhood") || "";
  const initialBedrooms = searchParams.get("bedrooms") || "any";
  const initialBathrooms = searchParams.get("bathrooms") || "any";
  const requestedMinPrice = searchParams.get("minPrice") || "";
  const requestedMaxPrice = searchParams.get("maxPrice") || "";
  const requestedAvailability = searchParams.get("availability");
  const requestedSort = searchParams.get("sort");

  const initialMinPrice =
    Number.isFinite(Number(requestedMinPrice)) && Number(requestedMinPrice) > 0
      ? requestedMinPrice
      : "";
  const initialMaxPrice =
    Number.isFinite(Number(requestedMaxPrice)) && Number(requestedMaxPrice) > 0
      ? requestedMaxPrice
      : "";

  const availablePropertyTypes = useMemo(() => {
    return Array.from(new Set(initialProperties.map((p) => p.propertyType).filter(Boolean)));
  }, [initialProperties]);

  const availableNeighborhoods = useMemo(() => {
    return Array.from(new Set(initialProperties.map((p) => p.neighborhood).filter(Boolean)));
  }, [initialProperties]);

  const [filters, setFilters] = useState<PropertyFiltersState>({
    searchQuery: initialSearch,
    propertyType: initialType,
    neighborhood: initialNeighborhood,
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
    bedrooms: ["1", "2", "3", "4"].includes(initialBedrooms)
      ? initialBedrooms
      : "any",
    bathrooms: ["1", "2", "3"].includes(initialBathrooms)
      ? initialBathrooms
      : "any",
    availability:
      requestedAvailability === "available" ||
      requestedAvailability === "pending" ||
      requestedAvailability === "rented"
        ? requestedAvailability
        : "all",
    sortBy:
      requestedSort === "price-asc" ||
      requestedSort === "price-desc" ||
      requestedSort === "newest" ||
      requestedSort === "size-desc"
        ? requestedSort
        : "featured",
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const parsedMinPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
  const parsedMaxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);
  const priceRangeError =
    (parsedMinPrice !== null && (!Number.isFinite(parsedMinPrice) || parsedMinPrice <= 0)) ||
    (parsedMaxPrice !== null && (!Number.isFinite(parsedMaxPrice) || parsedMaxPrice <= 0))
      ? "Enter a price greater than zero, or clear the field to remove that limit."
      : parsedMinPrice !== null && parsedMaxPrice !== null && parsedMinPrice > parsedMaxPrice
        ? "Minimum price must be less than or equal to maximum price."
        : "";

  // Update specific filter values
  const handleFilterChange = (updates: Partial<PropertyFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      propertyType: "",
      neighborhood: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "any",
      bathrooms: "any",
      availability: "all",
      sortBy: "featured",
    });
  };

  // Filter & sort logic
  const filteredProperties = useMemo(() => {
    if (priceRangeError) return [];
    return initialProperties
      .filter((prop) => {
        // Keyword search matching title, location, neighborhood, or description
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchTitle = prop.title.toLowerCase().includes(q);
          const matchLoc = prop.location.toLowerCase().includes(q);
          const matchNeighborhood = prop.neighborhood.toLowerCase().includes(q);
          const matchDesc = prop.description.toLowerCase().includes(q);
          if (!matchTitle && !matchLoc && !matchNeighborhood && !matchDesc) {
            return false;
          }
        }

        // Property type filter
        if (filters.propertyType && prop.propertyType !== filters.propertyType) {
          return false;
        }

        // Neighborhood filter
        if (
          filters.neighborhood &&
          prop.neighborhood.toLowerCase() !== filters.neighborhood.toLowerCase()
        ) {
          return false;
        }

        // Price range filter
        if (
          (parsedMinPrice !== null && prop.price < parsedMinPrice) ||
          (parsedMaxPrice !== null && prop.price > parsedMaxPrice)
        ) {
          return false;
        }

        if (
          filters.availability !== "all" &&
          prop.status !== filters.availability
        ) {
          return false;
        }

        // Bedrooms filter
        if (filters.bedrooms !== "any") {
          const requiredBeds = Number(filters.bedrooms);
          if (requiredBeds === 4) {
            if (prop.bedrooms < 4) return false;
          } else if (prop.bedrooms !== requiredBeds) {
            return false;
          }
        }

        if (filters.bathrooms !== "any") {
          const requiredBathrooms = Number(filters.bathrooms);
          if (requiredBathrooms === 3) {
            if (prop.bathrooms < 3) return false;
          } else if (prop.bathrooms !== requiredBathrooms) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "price-asc") {
          return a.price - b.price;
        }
        if (filters.sortBy === "price-desc") {
          return b.price - a.price;
        }
        if (filters.sortBy === "size-desc") {
          return (b.care ?? 0) - (a.care ?? 0);
        }
        if (filters.sortBy === "newest") {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        // Default: featured first, then newest
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.price - b.price;
      });
  }, [initialProperties, filters, parsedMinPrice, parsedMaxPrice, priceRangeError]);

  // Active filter count (excluding defaults)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.propertyType) count++;
    if (filters.neighborhood) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.bedrooms !== "any") count++;
    if (filters.bathrooms !== "any") count++;
    if (filters.availability !== "all") count++;
    return count;
  }, [filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {/* Page Header */}
      <div className="mb-9 flex flex-col gap-5 sm:mb-11 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
          The KirayLink collection · Addis Ababa
        </p>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-primary sm:text-5xl">
          Find your next home.
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-secondary sm:text-base">
          Explore available residences, compare the details, and connect directly with landlords.
        </p>
        </div>
        <Link
          href="/sign-up?role=landlord"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent-text"
        >
          List a property
        </Link>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="mb-7 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-card-border bg-card p-3 shadow-card sm:flex-row sm:items-center sm:p-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-text pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Search listings"
            placeholder="Search properties by location or keyword"
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
            className="min-h-11 w-full rounded-full border border-input-border bg-input py-2.5 pl-10 pr-9 text-sm text-primary placeholder:text-secondary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25 transition-colors"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => handleFilterChange({ searchQuery: "" })}
              aria-label="Clear search text"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary transition-colors hover:text-primary cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Controls: Sort Dropdown & Mobile Filter Button */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface-muted px-4 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:border-accent cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-accent-text" aria-hidden="true" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-button-primary text-[10px] font-semibold text-button-primary-text">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="sort-select"
              className="hidden text-xs font-medium text-secondary sm:inline-block"
            >
              Sort:
            </label>
            <select
              id="sort-select"
              value={filters.sortBy}
              onChange={(e) =>
                handleFilterChange({
                  sortBy: e.target.value as PropertyFiltersState["sortBy"],
                })
              }
              className="min-h-11 rounded-full border border-input-border bg-input px-4 text-xs font-semibold text-primary focus:outline-none focus:border-focus cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="size-desc">Largest Living Area</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Pills (if any are active) */}
      {activeFiltersCount > 0 && (
        <div className="mb-7 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-secondary">
            Active Filters:
          </span>

          {filters.propertyType && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent-soft px-3 py-1 text-xs font-medium text-primary">
              <span>Type: {filters.propertyType}</span>
              <button
                type="button"
                onClick={() => handleFilterChange({ propertyType: "" })}
                className="text-secondary hover:text-primary cursor-pointer"
                aria-label="Remove property type filter"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          )}

          {filters.neighborhood && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent-soft px-3 py-1 text-xs font-medium text-primary">
              <span>District: {filters.neighborhood}</span>
              <button
                type="button"
                onClick={() => handleFilterChange({ neighborhood: "" })}
                className="text-secondary hover:text-primary cursor-pointer"
                aria-label="Remove neighborhood filter"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          )}

          {filters.bedrooms !== "any" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent-soft px-3 py-1 text-xs font-medium text-primary">
              <span>Bedrooms: {filters.bedrooms}+</span>
              <button
                type="button"
                onClick={() => handleFilterChange({ bedrooms: "any" })}
                className="text-secondary hover:text-primary cursor-pointer"
                aria-label="Remove bedroom filter"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          )}

          {filters.bathrooms !== "any" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent-soft px-3 py-1 text-xs font-medium text-primary">
              <span>Bathrooms: {filters.bathrooms === "3" ? "3+" : filters.bathrooms}</span>
              <button
                type="button"
                onClick={() => handleFilterChange({ bathrooms: "any" })}
                className="text-secondary hover:text-primary cursor-pointer"
                aria-label="Remove bathroom filter"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          )}

          {filters.availability !== "all" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent-soft px-3 py-1 text-xs font-medium capitalize text-primary">
              <span>{filters.availability}</span>
              <button
                type="button"
                onClick={() => handleFilterChange({ availability: "all" })}
                className="text-secondary hover:text-primary cursor-pointer"
                aria-label="Remove availability filter"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          )}

          {(filters.minPrice || filters.maxPrice) && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent-soft px-3 py-1 text-xs font-medium text-primary">
              <span>
                ETB {filters.minPrice ? Number(filters.minPrice).toLocaleString() : "Any"} –{" "}
                {filters.maxPrice ? Number(filters.maxPrice).toLocaleString() : "Any"}
              </span>
              <button
                type="button"
                onClick={() => handleFilterChange({ minPrice: "", maxPrice: "" })}
                className="text-secondary hover:text-primary cursor-pointer"
                aria-label="Remove price filter"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="ml-2 text-xs font-semibold text-accent-text underline hover:text-primary cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Main Layout: Filters Sidebar + Properties Grid */}
      {priceRangeError && (
        <p
          id="price-range-error"
          role="alert"
          className="mb-5 rounded-xl border border-status-danger/30 bg-status-danger-bg px-4 py-3 text-sm text-status-danger"
        >
          {priceRangeError}
        </p>
      )}
      <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-8">
        <PropertyFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          isOpenMobile={isMobileFiltersOpen}
          onCloseMobile={() => setIsMobileFiltersOpen(false)}
          availablePropertyTypes={availablePropertyTypes}
          availableNeighborhoods={availableNeighborhoods}
          priceError={priceRangeError}
        />

        {/* Content Area */}
        <div className="w-full min-w-0 flex-1">
          {initialProperties.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-card sm:p-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-muted text-accent-text shadow-sm">
                <Building2 className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-serif text-xl font-medium text-primary">
                No active property listings
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-secondary">
                KirayLink is currently waiting for landlords to list residences. Are you a verified property owner?
              </p>
              <div className="mt-7">
                <Link
                  href="/sign-up?role=landlord"
                  className="inline-flex items-center gap-2 rounded-full bg-button-primary px-7 py-3 text-xs font-semibold text-button-primary-text shadow-sm transition-colors hover:bg-button-primary-hover"
                >
                  <PlusCircle className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>List a Property</span>
                </Link>
              </div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="rounded-3xl border border-card-border bg-card p-10 text-center shadow-card sm:p-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                <Search className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-serif text-xl font-medium text-primary">
                {priceRangeError
                  ? "Check your price range"
                  : "No matching residences found"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-secondary">
                {priceRangeError
                  ? "Correct the price range above to see matching residences."
                  : "No properties matched your current filter criteria. Try adjusting your district or price threshold."}
              </p>
              <div className="mt-7">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-6 py-2.5 text-xs font-semibold text-primary transition-colors hover:border-accent cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-accent-text" aria-hidden="true" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-xs font-medium tracking-wide text-secondary">
                Showing <strong className="text-primary">{filteredProperties.length}</strong> of <strong className="text-primary">{initialProperties.length}</strong> residences
              </div>
              <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProperties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    initialSaved={savedPropertyIds.includes(property.id)}
                    eager={index < 3}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
