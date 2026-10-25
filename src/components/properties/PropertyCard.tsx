import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Maximize2, MapPin, Sparkles } from "lucide-react";
import type { Property } from "@/types/property";
import Badge from "@/components/ui/Badge";
import { formatPrice, formatAreaSqM } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  priority?: boolean;
}

export default function PropertyCard({
  property,
  priority = false,
}: PropertyCardProps) {
  return (
    <article className="group bg-white rounded border border-[#E6E0D5] overflow-hidden flex flex-col hover:border-[#C5A880] hover:shadow-md transition-all duration-200">
      {/* Property Thumbnail with Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image
          src={property.imageUrl}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <Badge variant="navy" size="sm">
            {property.propertyType}
          </Badge>
          {property.featured && (
            <Badge variant="gold" size="sm" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C5A880]" aria-hidden="true" />
              <span>Featured</span>
            </Badge>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge
            variant={property.status === "available" ? "success" : "neutral"}
            size="sm"
          >
            {property.status}
          </Badge>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div className="space-y-2">
          {/* Price */}
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#0F172A] tracking-tight">
              {formatPrice(property.price)}
            </span>
            <span className="text-xs uppercase tracking-wider text-[#8C6E43] font-medium">
              Verified Rental
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-[#0F172A] line-clamp-1 group-hover:text-[#8C6E43] transition-colors">
            <Link
              href={`/properties/${property.id}`}
              className="focus:outline-none focus-visible:underline"
            >
              {property.title}
            </Link>
          </h3>

          {/* Location */}
          <p className="text-xs text-[#5B677A] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" aria-hidden="true" />
            <span className="truncate">{property.location}</span>
          </p>
        </div>

        {/* Property Specs Row */}
        <div className="mt-4 pt-4 border-t border-[#F0ECE3] grid grid-cols-3 text-xs text-[#5B677A]">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-[#8C6E43]" aria-hidden="true" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-[#8C6E43]" aria-hidden="true" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-[#8C6E43]" aria-hidden="true" />
            <span>{formatAreaSqM(property.areaSqFt)} m²</span>
          </div>
        </div>

        {/* View Details Link */}
        <div className="mt-4 pt-2">
          <Link
            href={`/properties/${property.id}`}
            className="w-full inline-flex items-center justify-center py-2 px-3 text-xs font-semibold tracking-wider uppercase rounded border border-[#E6E0D5] text-[#0F172A] bg-[#FDFBF7] hover:bg-[#C5A880] hover:text-[#0F172A] hover:border-[#C5A880] transition-colors text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
