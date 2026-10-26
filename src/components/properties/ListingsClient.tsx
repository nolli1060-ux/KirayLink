"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Home } from "lucide-react";
import type { Property, PropertyFiltersState } from "@/types/property";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyFilters from "@/components/properties/PropertyFilters";
import Button from "@/components/ui/Button";
import { formatNumber } from "@/lib/utils";

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

  const [filters, setFilters] = useState<PropertyFiltersState>({
    searchQuery: initialSearch,
    propertyType: initialType,
    neighborhood: initialNeighborhood,
    minPrice: 0,
    maxPrice: 100000,
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
      maxPrice: 100000,
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
          if (filters.bedrooms === "4") {
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
    if (filters.minPrice > 0 || filters.maxPrice < 100000) count++;
    if (filters.bedrooms !== "any") count++;
    return count;
  }, [filters]);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="space-y-3 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
          Properties for Rent
        </h1>
        <p className="text-sm sm:text-base text-[#5B677A] max-w-2xl">
          Verified apartments, lofts, and townhouses across Addis Ababa.
        </p>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="bg-white border border-[#E6E0D5] rounded-lg p-3 sm:p-4 mb-8 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search by neighborhood, title, or keywords..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#FDFBF7] border border-[#E6E0D5] rounded text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
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
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded border border-[#E6E0D5] bg-[#FDFBF7] text-[#0F172A] hover:bg-[#F5F1E8] cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C6E43]" aria-hidden="true" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#0F172A] text-white text-[10px] flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="sort-select"
              className="text-xs text-[#5B677A] font-medium hidden sm:inline-block"
            >
              Sort by:
            </label>
            <div className="relative">
              <select
                id="sort-select"
                value={filters.sortBy}
                onChange={(e) =>
                  handleFilterChange({
                    sortBy: e.target.value as PropertyFiltersState["sortBy"],
                  })
                }
                className="bg-[#FDFBF7] border border-[#E6E0D5] rounded px-3 py-2 text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="size-desc">Largest Area</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Pills (if any are active) */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-[#5B677A] font-medium mr-1">
            Active Filters:
          </span>

          {filters.propertyType && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-[#F7F3EC] text-[#8C6E43] border border-[#C5A880]/40">
              <span>Type: {filters.propertyType}</span>
              <button
                type="button"
                onClick={() => handleFilterChange({ propertyType: "" })}
                className="hover:text-black cursor-pointer"
                aria-label="Remove property type filter"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </span>
          )}

          {filters.neighborhood && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-[#F7F3EC] text-[#8C6E43] border border-[#C5A880]/40">
              <span>District: {filters.neighborhood}</span>
              <button
                type="button"
                onClick={() => handleFilterChange({ neighborhood: "" })}
                className="hover:text-black cursor-pointer"
                aria-label="Remove neighborhood filter"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </span>
          )}

          {filters.bedrooms !== "any" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-[#F7F3EC] text-[#8C6E43] border border-[#C5A880]/40">
              <span>{filters.bedrooms}+ Beds</span>
              <button
                type="button"
                onClick={() => handleFilterChange({ bedrooms: "any" })}
                className="hover:text-black cursor-pointer"
                aria-label="Remove bedroom filter"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </span>
          )}

          {(filters.minPrice > 0 || filters.maxPrice < 100000) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-[#F7F3EC] text-[#8C6E43] border border-[#C5A880]/40">
              <span>
                ETB {formatNumber(filters.minPrice)} - ETB {formatNumber(filters.maxPrice)}
              </span>
              <button
                type="button"
                onClick={() =>
                  handleFilterChange({ minPrice: 0, maxPrice: 100000 })
                }
                className="hover:text-black cursor-pointer"
                aria-label="Remove price filter"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-[#8C6E43] hover:text-[#0F172A] font-medium underline ml-2 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Content: Sidebar Filters + Listings Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <PropertyFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          isOpenMobile={isMobileFiltersOpen}
          onCloseMobile={() => setIsMobileFiltersOpen(false)}
        />

        {/* Listings Display Area */}
        <div className="flex-1 w-full space-y-4">
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-[#5B677A] pb-2 border-b border-[#E6E0D5]">
            <span>
              Showing{" "}
              <strong className="text-[#0F172A]">
                {filteredProperties.length}
              </strong>{" "}
              of {initialProperties.length} residences
            </span>
            {filteredProperties.length > 0 && (
              <span className="text-[#8C6E43]">
                Available for Immediate Lease
              </span>
            )}
          </div>

          {/* Grid or Empty State */}
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            /* Informative Empty State */
            <div className="p-12 text-center bg-white border border-[#E6E0D5] rounded-lg space-y-4 my-8">
              <div className="w-14 h-14 rounded-full bg-[#F7F3EC] text-[#8C6E43] mx-auto flex items-center justify-center">
                <Home className="w-7 h-7" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                No properties match your criteria
              </h2>
              <p className="text-sm text-[#5B677A] max-w-md mx-auto leading-relaxed">
                We could not find any residences matching your active filter
                settings. Try adjusting your price range, choosing another
                district, or resetting your search.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleResetFilters}
                >
                  Reset All Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
