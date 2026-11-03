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
}

export default function ListingsClient({
  initialProperties,
}: ListingsClientProps) {
  const searchParams = useSearchParams();

  // Initialize filters from URL params if present
  const initialSearch = searchParams.get("search") || "";
  const initialType = searchParams.get("type") || "";
  const initialNeighborhood = searchParams.get("neighborhood") || "";

  const maxPriceLimit = useMemo(() => {
    if (initialProperties.length === 0) return 1000000;
    const highest = Math.max(...initialProperties.map((p) => p.price));
    return Math.max(500000, highest + 50000);
  }, [initialProperties]);

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
    minPrice: 0,
    maxPrice: maxPriceLimit,
    bedrooms: "any",
    sortBy: "featured",
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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
      minPrice: 0,
      maxPrice: maxPriceLimit,
      bedrooms: "any",
      sortBy: "featured",
    });
  };

  // Filter & sort logic
  const filteredProperties = useMemo(() => {
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
        if (prop.price < filters.minPrice || prop.price > filters.maxPrice) {
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
  }, [initialProperties, filters]);

  // Active filter count (excluding defaults)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.propertyType) count++;
    if (filters.neighborhood) count++;
    if (filters.minPrice > 0 || filters.maxPrice < maxPriceLimit) count++;
    if (filters.bedrooms !== "any") count++;
    return count;
  }, [filters, maxPriceLimit]);

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="space-y-3 mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C6A56B]">
          Curated Portfolio · Addis Ababa
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#123B32] font-serif tracking-tight">
          Available Residences
        </h1>
        <p className="text-sm sm:text-base leading-relaxed text-[#77766F] max-w-2xl">
          Browse verified residential properties, luxury apartments, and townhouses with direct landlord communication.
        </p>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="bg-white border border-[#EDE8DE] rounded-2xl p-3 sm:p-4 mb-8 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-[#C6A56B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search by neighborhood, street, or property type..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#F8F6F0] border border-[#EDE8DE] rounded-full text-[#242622] placeholder:text-[#77766F] focus:outline-none focus:border-[#C6A56B] focus:ring-2 focus:ring-[#C6A56B]/25 transition-all"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => handleFilterChange({ searchQuery: "" })}
              aria-label="Clear search text"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
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
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full border border-[#EDE8DE] bg-[#F8F6F0] text-[#123B32] hover:border-[#C6A56B] cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#123B32] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="sort-select"
              className="text-xs text-[#77766F] font-semibold hidden sm:inline-block"
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
              className="bg-[#F8F6F0] border border-[#EDE8DE] rounded-full px-4 py-2 text-xs font-bold text-[#242622] focus:outline-none focus:border-[#C6A56B] cursor-pointer"
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
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs text-[#77766F] font-medium mr-1">
            Active Filters:
          </span>

          {filters.propertyType && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#F5EFE4] text-[#123B32] border border-[#C6A56B]/40 font-medium">
              <span>Type: {filters.propertyType}</span>
              <button
                type="button"
                onClick={() => handleFilterChange({ propertyType: "" })}
                className="hover:text-black cursor-pointer"
                aria-label="Remove property type filter"
              >
                <X className="w-3 h-3 text-[#123B32]" aria-hidden="true" />
              </button>
            </span>
          )}

          {filters.neighborhood && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#F5EFE4] text-[#123B32] border border-[#C6A56B]/40 font-medium">
              <span>District: {filters.neighborhood}</span>
              <button
                type="button"
                onClick={() => handleFilterChange({ neighborhood: "" })}
                className="hover:text-black cursor-pointer"
                aria-label="Remove neighborhood filter"
              >
                <X className="w-3 h-3 text-[#123B32]" aria-hidden="true" />
              </button>
            </span>
          )}

          {filters.bedrooms !== "any" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#F5EFE4] text-[#123B32] border border-[#C6A56B]/40 font-medium">
              <span>Bedrooms: {filters.bedrooms}+</span>
              <button
                type="button"
                onClick={() => handleFilterChange({ bedrooms: "any" })}
                className="hover:text-black cursor-pointer"
                aria-label="Remove bedroom filter"
              >
                <X className="w-3 h-3 text-[#123B32]" aria-hidden="true" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-[#C6A56B] underline hover:text-[#123B32] ml-2 font-bold cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Main Layout: Filters Sidebar + Properties Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <PropertyFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          isOpenMobile={isMobileFiltersOpen}
          onCloseMobile={() => setIsMobileFiltersOpen(false)}
          availablePropertyTypes={availablePropertyTypes}
          availableNeighborhoods={availableNeighborhoods}
          maxPriceLimit={maxPriceLimit}
        />

        {/* Content Area */}
        <div className="flex-1 w-full">
          {initialProperties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#EDE8DE] bg-white p-12 sm:p-16 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F6F0] text-[#123B32] border border-[#C6A56B]/30 shadow-xs">
                <Building2 className="h-7 w-7 text-[#C6A56B]" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#123B32] font-serif">
                No active property listings
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#77766F]">
                KirayLink is currently waiting for landlords to list residences. Are you a verified property owner?
              </p>
              <div className="mt-7">
                <Link
                  href="/sign-up?role=landlord"
                  className="inline-flex items-center gap-2 rounded-full bg-[#123B32] px-7 py-3 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#174A3D]"
                >
                  <PlusCircle className="h-4 w-4 text-[#C6A56B]" aria-hidden="true" />
                  <span>List a Property</span>
                </Link>
              </div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="rounded-2xl border border-[#EDE8DE] bg-white p-12 sm:p-16 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F6F0] text-[#C6A56B]">
                <Search className="h-7 w-7 text-[#C6A56B]" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#123B32] font-serif">
                No matching residences found
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#77766F]">
                No properties matched your current filter criteria. Try adjusting your district or price threshold.
              </p>
              <div className="mt-7">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-[#EDE8DE] bg-[#F8F6F0] px-6 py-2.5 text-xs font-bold text-[#123B32] hover:border-[#C6A56B] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-xs text-[#77766F] font-semibold tracking-wide">
                Showing <strong className="text-[#123B32]">{filteredProperties.length}</strong> of <strong className="text-[#123B32]">{initialProperties.length}</strong> verified residences
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
