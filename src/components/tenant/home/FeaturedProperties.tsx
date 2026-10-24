import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllActiveProperties } from "@/lib/properties-store";
import PropertyCard from "@/components/properties/PropertyCard";
import Badge from "@/components/ui/Badge";

export default function FeaturedProperties() {
  const properties = getAllActiveProperties();
  const featuredProperties = properties
    .filter((property) => property.featured && property.status === "available")
    .slice(0, 3);

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Badge variant="gold" size="sm">
              Handpicked for you
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">
              Featured residences
            </h2>
            <p className="max-w-xl text-sm text-[#5B677A]">
              A selection of distinguished homes in Addis Ababa&apos;s most
              sought-after neighborhoods.
            </p>
          </div>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8C6E43] hover:text-[#0F172A]"
          >
            View all properties
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProperties.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              priority={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
