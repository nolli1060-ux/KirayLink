"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, Trash2, ArrowUpRight, Bed, Bath, Maximize2, Building2 } from "lucide-react";
import type { Property } from "@/types/property";
import Badge from "@/components/ui/Badge";
import TenantEmptyState from "@/components/tenant/TenantEmptyState";
import { unsavePropertyAction } from "@/lib/dashboard-actions";
import { formatPrice, formatCare, getSafeImageUrl } from "@/lib/utils";

interface SavedPropertiesProps {
  initialProperties: Property[];
}

export default function SavedProperties({
  initialProperties,
}: SavedPropertiesProps) {
  const [properties, setProperties] = useState(initialProperties);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (propertyId: string) => {
    setRemovingId(propertyId);
    try {
      const res = await unsavePropertyAction(propertyId);
      if (res.success) {
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      }
    } finally {
      setRemovingId(null);
    }
  };

  if (properties.length === 0) {
    return (
      <TenantEmptyState
        icon={Bookmark}
        title="No saved properties yet"
        description="Save properties while browsing to compare terms, prices, and locations."
        actionText="Explore Residences"
        actionHref="/listings"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[#77766F] pb-2 border-b border-[#EDE8DE]">
        <span>
          You have <strong className="text-[#242622]">{properties.length}</strong> saved{" "}
          {properties.length === 1 ? "residence" : "residences"}
        </span>
        <Link
          href="/listings"
          className="text-[#C6A56B] font-semibold hover:underline"
        >
          Explore more residences
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((property) => {
          const rawImage = property.imageUrl || property.images?.[0];
          const displayImage = rawImage ? getSafeImageUrl(rawImage) : null;

          return (
            <article
              key={property.id}
              className="bg-white rounded-2xl border border-[#EDE8DE] overflow-hidden flex flex-col justify-between hover:border-[#C6A56B] transition-colors shadow-[0_4px_20px_-8px_rgba(18,59,50,0.06)]"
            >
              <div className="relative aspect-[16/9] w-full bg-[#F8F6F0]">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={property.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#C6A56B] bg-[#F8F6F0]">
                    <Building2 className="w-8 h-8 opacity-60 text-[#C6A56B]" aria-hidden="true" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <Badge variant="navy" size="sm" className="rounded-full px-2.5">
                    {property.propertyType}
                  </Badge>
                  <Badge
                    variant={property.status === "available" ? "success" : "neutral"}
                    size="sm"
                    className="rounded-full px-2.5"
                  >
                    {property.status}
                  </Badge>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-lg font-serif font-bold text-[#123B32]">
                      {formatPrice(property.price, "ETB ", property.rentPeriod)}
                    </span>
                    <span className="text-xs text-[#77766F]">
                      {property.neighborhood}
                    </span>
                  </div>
                  <h3 className="text-sm font-serif font-semibold text-[#242622] line-clamp-1">
                    {property.title}
                  </h3>
                  <p className="text-xs text-[#77766F] truncate mt-1 font-sans">
                    {property.location}
                  </p>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#EDE8DE] text-xs text-[#77766F]">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
                      {property.bedrooms} Beds
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
                      {property.bathrooms} Baths
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
                      {formatCare(property.care)} m²
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#EDE8DE]">
                  <Link
                    href={`/properties/${property.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-[#EDE8DE] bg-[#F8F6F0] py-2 text-xs font-semibold text-[#242622] hover:bg-[#C6A56B] hover:border-[#C6A56B] hover:text-[#123B32] transition-colors"
                  >
                    <span>View Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleRemove(property.id)}
                    disabled={removingId === property.id}
                    className="p-2 rounded-full border border-[#EDE8DE] text-[#77766F] hover:text-red-700 hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer text-xs"
                    title="Remove from saved properties"
                    aria-label={`Remove ${property.title} from saved`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
