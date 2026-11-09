"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Bath,
  Bed,
  Building2,
  Loader2,
  Maximize2,
  Trash2,
} from "lucide-react";
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
  const [errorMessage, setErrorMessage] = useState("");

  const handleRemove = async (propertyId: string) => {
    setRemovingId(propertyId);
    setErrorMessage("");
    try {
      const res = await unsavePropertyAction(propertyId);
      if (res.success) {
        setProperties((previous) => previous.filter((property) => property.id !== propertyId));
      } else {
        setErrorMessage(res.error || "Unable to remove this residence from your saved list.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  if (properties.length === 0) {
    return (
      <TenantEmptyState
        icon={Building2}
        title="Your shortlist starts here"
        description="Save residences while browsing to compare their details, prices, and locations."
        actionText="Explore residences"
        actionHref="/listings"
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 border-b border-border pb-3 text-sm text-secondary sm:flex-row sm:items-center sm:justify-between">
        <span>
          <strong className="font-semibold text-primary">{properties.length}</strong>{" "}
          saved {properties.length === 1 ? "residence" : "residences"}
        </span>
        <Link
          href="/listings"
          className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-accent-text transition-colors hover:text-primary"
        >
          Explore more residences
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-xl border border-status-danger/30 bg-status-danger-bg p-3 text-sm text-status-danger"
        >
          {errorMessage}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {properties.map((property, index) => {
          const rawImage = property.imageUrl || property.images?.[0];
          const displayImage = rawImage ? getSafeImageUrl(rawImage) : null;

          return (
            <article
              key={property.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-card-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/70"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-muted">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={property.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1279px) 50vw, 40vw"
                    loading={index === 0 ? "eager" : "lazy"}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-accent-text">
                    <Building2 className="h-9 w-9 opacity-70" aria-hidden="true" />
                  </div>
                )}
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <Badge
                    variant="navy"
                    size="sm"
                    className="rounded-full border border-white/20 bg-strong-surface/90 px-3 text-on-strong-surface backdrop-blur"
                  >
                    {property.propertyType}
                  </Badge>
                  <Badge
                    variant={property.status === "available" ? "success" : "neutral"}
                    size="sm"
                    className="rounded-full px-3 capitalize"
                  >
                    {property.status}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-serif text-xl font-medium text-primary">
                      {formatPrice(property.price, "ETB ", property.rentPeriod)}
                    </span>
                    <span className="text-xs text-secondary">{property.neighborhood}</span>
                  </div>
                  <h3 className="mt-2 line-clamp-1 font-serif text-lg font-medium text-primary">
                    {property.title}
                  </h3>
                  <p className="mt-1 truncate text-sm text-secondary">{property.location}</p>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-xs text-secondary">
                    <span className="flex items-center gap-1.5">
                      <Bed className="h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
                      {property.bedrooms} beds
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bath className="h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
                      {property.bathrooms} baths
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Maximize2 className="h-3.5 w-3.5 shrink-0 text-accent-text" aria-hidden="true" />
                      {formatCare(property.care)} m²
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                  <Link
                    href={`/properties/${property.id}`}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-button-primary px-4 text-xs font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    View residence
                    <ArrowUpRight className="h-4 w-4 text-accent" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(property.id)}
                    disabled={removingId !== null}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-secondary transition-colors hover:border-status-danger/40 hover:bg-status-danger-bg hover:text-status-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-wait disabled:opacity-60"
                    title="Remove from saved properties"
                    aria-label={`Remove ${property.title} from saved`}
                  >
                    {removingId === property.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    )}
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
