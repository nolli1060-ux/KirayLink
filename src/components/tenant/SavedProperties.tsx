"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, Trash2, ArrowUpRight, Bed, Bath, Maximize2 } from "lucide-react";
import type { Property } from "@/types/property";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import TenantEmptyState from "@/components/tenant/TenantEmptyState";
import { unsavePropertyAction } from "@/lib/dashboard-actions";
import { formatPrice, formatCare } from "@/lib/utils";

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
        actionText="Explore Properties"
        actionHref="/listings"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[#5B677A] pb-2 border-b border-[#E6E0D5]">
        <span>
          You have <strong className="text-[#0F172A]">{properties.length}</strong> saved{" "}
          {properties.length === 1 ? "residence" : "residences"}
        </span>
        <Link
          href="/listings"
          className="text-[#8C6E43] font-semibold hover:underline"
        >
          Add more properties
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((property) => (
          <article
            key={property.id}
            className="bg-white rounded-lg border border-[#E6E0D5] overflow-hidden flex flex-col justify-between hover:border-[#C5A880] transition-colors shadow-sm"
          >
            <div className="relative aspect-[16/9] w-full bg-slate-100">
              <Image
                src={property.imageUrl}
                alt={property.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-1.5">
                <Badge variant="navy" size="sm">
                  {property.propertyType}
                </Badge>
                <Badge
                  variant={property.status === "available" ? "success" : "neutral"}
                  size="sm"
                >
                  {property.status}
                </Badge>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-lg font-bold text-[#0F172A]">
                    {formatPrice(property.price)}
                  </span>
                  <span className="text-[11px] text-[#5B677A]">
                    {property.neighborhood}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#0F172A] line-clamp-1">
                  {property.title}
                </h3>
                <p className="text-xs text-[#5B677A] truncate mt-1">
                  {property.location}
                </p>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#F0ECE3] text-xs text-[#5B677A]">
                  <span className="flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5 text-[#8C6E43]" aria-hidden="true" />
                    {property.bedrooms} Beds
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-3.5 h-3.5 text-[#8C6E43]" aria-hidden="true" />
                    {property.bathrooms} Baths
                  </span>
                  <span className="flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-[#8C6E43]" aria-hidden="true" />
                    {formatCare(property.care)} m²
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#F0ECE3]">
                <Button
                  href={`/properties/${property.id}`}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <span>View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                </Button>

                <button
                  type="button"
                  onClick={() => handleRemove(property.id)}
                  disabled={removingId === property.id}
                  className="p-2 rounded border border-[#E6E0D5] text-[#5B677A] hover:text-[#9E2A2B] hover:border-[#9E2A2B]/40 hover:bg-[#FDF2F2] transition-colors cursor-pointer text-xs"
                  title="Remove from saved properties"
                  aria-label={`Remove ${property.title} from saved`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
