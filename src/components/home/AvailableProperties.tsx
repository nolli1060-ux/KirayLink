import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PropertyCard from "@/components/properties/PropertyCard";
import { getAllActiveProperties } from "@/lib/properties-store";

export default async function AvailableProperties() {
  const availableProperties = (await getAllActiveProperties())
    .filter((property) => property.status === "available")
    .slice(0, 3);

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-strong">
              Make room for what matters
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-main">
              Available homes.
            </h2>
            <p className="max-w-xl text-sm text-muted">
              Find a home that fits your life in Addis Ababa.
            </p>
          </div>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold-strong hover:text-main"
          >
            View all properties
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {availableProperties.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableProperties.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-border-subtle bg-surface p-6 text-sm text-muted">
            No homes are available right now. Please check back soon.
          </p>
        )}
      </div>
    </section>
  );
}
