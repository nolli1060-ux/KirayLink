import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Maximize2, MapPin, Building2, ArrowRight } from "lucide-react";
import type { Property } from "@/types/property";
import Badge from "@/components/ui/Badge";
import { formatPrice, formatCare, getSafeImageUrl } from "@/lib/utils";
import SavePropertyButton from "@/components/properties/SavePropertyButton";

interface PropertyCardProps {
  property: Property;
  eager?: boolean;
  initialSaved?: boolean;
}

export default function PropertyCard({
  property,
  eager = false,
  initialSaved = false,
}: PropertyCardProps) {
  const rawImage = property.imageUrl || property.images?.[0];
  const displayImage = rawImage ? getSafeImageUrl(rawImage) : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-card-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-popover">
      {/* Property Thumbnail with Badges */}
      <div className="relative aspect-[1.28/1] w-full overflow-hidden bg-surface-muted">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading={eager ? "eager" : "lazy"}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-surface-muted text-accent">
            <Building2 className="h-10 w-10 opacity-60" aria-hidden="true" />
            <span className="mt-2 text-xs font-medium text-secondary">No photograph provided</span>
          </div>
        )}

        {/* Top Floating Badges */}
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          <Badge
            variant="navy"
            size="sm"
            className="rounded-full border border-white/25 bg-strong-surface/90 px-3 py-1 text-[10px] font-semibold tracking-wider text-on-strong-surface backdrop-blur-sm"
          >
            {property.propertyType}
          </Badge>
        </div>

        {/* Status Badge */}
        <div className="absolute right-4 top-4 z-10">
          <Badge
            variant={property.status === "available" ? "success" : "neutral"}
            size="sm"
            className={`rounded-full px-3 py-1 font-semibold text-[10px] tracking-wider ${
              property.status === "available"
                ? "bg-status-success-bg text-status-success border-status-success/25"
                : "bg-surface/95 text-secondary border-border"
            }`}
          >
            {property.status}
          </Badge>
        </div>

        <div className="absolute right-4 top-[4.25rem] z-10">
          <SavePropertyButton
            propertyId={property.id}
            initialSaved={initialSaved}
            compact
          />
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div className="space-y-3">
          {/* Price */}
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-xl font-semibold tracking-tight text-primary sm:text-2xl">
              {formatPrice(property.price, "ETB ", property.rentPeriod)}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-text">
              {property.furnished ? "Furnished" : "Residence"}
            </span>
          </div>

          {/* Title */}
          <h3 className="line-clamp-1 text-lg font-semibold text-primary transition-colors group-hover:text-accent-text">
            <Link
              href={`/properties/${property.id}`}
              className="focus:outline-none focus-visible:underline"
            >
              {property.title}
            </Link>
          </h3>

          {/* Location */}
          <p className="flex items-center gap-1.5 text-sm text-secondary">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-accent-text" aria-hidden="true" />
            <span className="truncate">{property.location}</span>
          </p>
        </div>

        {/* Property Specs Row */}
        <div className="mt-6 grid grid-cols-3 border-t border-border pt-4 text-xs text-secondary">
          <div className="flex items-center gap-1.5">
            <Bed className="h-4 w-4 text-accent-text" aria-hidden="true" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-accent-text" aria-hidden="true" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5 text-accent-text" aria-hidden="true" />
            <span>{formatCare(property.care)} m²</span>
          </div>
        </div>

        {/* View Details Link */}
        <div className="mt-5">
          <Link
            href={`/properties/${property.id}`}
            className="group/btn inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-surface-muted px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:border-button-primary hover:bg-button-primary hover:text-button-primary-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <span>View Residence</span>
            <ArrowRight className="h-3.5 w-3.5 text-accent transition-transform group-hover/btn:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
