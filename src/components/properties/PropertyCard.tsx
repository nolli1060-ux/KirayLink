import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Maximize2, MapPin, Building2, ArrowRight } from "lucide-react";
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
  const displayImage = property.imageUrl || property.images?.[0];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#EDE8DE] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#C6A56B] hover:shadow-[0_22px_50px_-25px_rgba(18,59,50,0.22)]">
      {/* Property Thumbnail with Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EDE8DE]/40">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[#F8F6F0] text-[#C6A56B]">
            <Building2 className="h-10 w-10 opacity-60" aria-hidden="true" />
            <span className="mt-2 text-xs font-medium text-[#77766F]">No photograph provided</span>
          </div>
        )}

        {/* Top Floating Badges */}
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          <Badge
            variant="navy"
            size="sm"
            className="rounded-full px-3 py-1 bg-[#123B32]/90 text-[#F8F6F0] border border-[#C6A56B]/30 backdrop-blur-sm text-[10px] font-bold tracking-wider"
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
                ? "bg-[#EAF3F0] text-[#174A3D] border-[#174A3D]/25"
                : "bg-white/90 text-[#77766F] border-[#EDE8DE]"
            }`}
          >
            {property.status}
          </Badge>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="space-y-2.5">
          {/* Price */}
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-[#123B32] font-serif">
              {formatPrice(property.price, "ETB ", property.rentPeriod)}
            </span>
            <span className="text-xs uppercase tracking-[0.16em] text-[#C6A56B] font-bold">
              Verified
            </span>
          </div>

          {/* Title */}
          <h3 className="line-clamp-1 text-base font-semibold text-[#242622] transition-colors group-hover:text-[#C6A56B]">
            <Link
              href={`/properties/${property.id}`}
              className="focus:outline-none focus-visible:underline"
            >
              {property.title}
            </Link>
          </h3>

          {/* Location */}
          <p className="flex items-center gap-1.5 text-sm text-[#77766F]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C6A56B]" aria-hidden="true" />
            <span className="truncate">{property.location}</span>
          </p>
        </div>

        {/* Property Specs Row */}
        <div className="mt-6 grid grid-cols-3 border-t border-[#EDE8DE] pt-4 text-xs text-[#77766F]">
          <div className="flex items-center gap-1.5">
            <Bed className="h-4 w-4 text-[#C6A56B]" aria-hidden="true" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-[#C6A56B]" aria-hidden="true" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5 text-[#C6A56B]" aria-hidden="true" />
            <span>{formatCare(property.care)} m²</span>
          </div>
        </div>

        {/* View Details Link */}
        <div className="mt-5">
          <Link
            href={`/properties/${property.id}`}
            className="group/btn inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#EDE8DE] bg-[#F8F6F0] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#123B32] transition-all hover:border-[#123B32] hover:bg-[#123B32] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6A56B]"
          >
            <span>View Residence</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#C6A56B] transition-transform group-hover/btn:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
