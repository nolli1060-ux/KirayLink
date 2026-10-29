import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Maximize2, MapPin } from "lucide-react";
import type { Property } from "@/types/property";
import Badge from "@/components/ui/Badge";
import { formatPrice, formatCare } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  priority?: boolean;
}

export default function PropertyCard({
  property,
  priority = false,
}: PropertyCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[#E9E6DF] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#D9B149] hover:shadow-[0_20px_50px_-30px_rgba(23,25,31,0.35)]">
      {/* Property Thumbnail with Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Image
          src={property.imageUrl}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />

        {/* Top Floating Badges */}
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          <Badge variant="navy" size="sm" className="rounded-full px-3 py-1">
            {property.propertyType}
          </Badge>
        </div>

        {/* Status Badge */}
        <div className="absolute right-4 top-4 z-10">
          <Badge
            variant={property.status === "available" ? "success" : "neutral"}
            size="sm"
            className="rounded-full px-3 py-1"
          >
            {property.status}
          </Badge>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div className="space-y-2">
          {/* Price */}
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold tracking-tight text-[#17191F]">
              {formatPrice(property.price, "ETB ", property.rentPeriod)}
            </span>
          </div>

          {/* Title */}
          <h3 className="line-clamp-1 text-base font-semibold text-[#17191F] transition-colors group-hover:text-[#A87900]">
            <Link
              href={`/properties/${property.id}`}
              className="focus:outline-none focus-visible:underline"
            >
              {property.title}
            </Link>
          </h3>

          {/* Location */}
          <p className="flex items-center gap-1.5 text-sm text-[#737985]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#A87900]" aria-hidden="true" />
            <span className="truncate">{property.location}</span>
          </p>
        </div>

        {/* Property Specs Row */}
        <div className="mt-5 grid grid-cols-3 border-t border-[#EEECE7] pt-4 text-xs text-[#626873]">
          <div className="flex items-center gap-1.5">
            <Bed className="h-4 w-4 text-[#A87900]" aria-hidden="true" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-[#A87900]" aria-hidden="true" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5 text-[#A87900]" aria-hidden="true" />
            <span>{formatCare(property.care)} m²</span>
          </div>
        </div>

        {/* View Details Link */}
        <div className="mt-5">
          <Link
            href={`/properties/${property.id}`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#E3DFD6] bg-[#FAF9F6] px-4 py-2 text-sm font-semibold text-[#17191F] transition-colors hover:border-[#F3B41B] hover:bg-[#F3B41B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A87900]"
          >
            View property
          </Link>
        </div>
      </div>
    </article>
  );
}
