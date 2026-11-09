import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PropertyCard from "@/components/properties/PropertyCard";
import type { Property } from "@/types/property";

export default function RecentlyAddedProperties({
  properties,
  savedPropertyIds,
}: {
  properties: Property[];
  savedPropertyIds: string[];
}) {
  const recentProperties = [...properties]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  if (recentProperties.length === 0) return null;

  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
              Just listed
            </p>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-primary sm:text-4xl">
              Recently added homes.
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-secondary">
              The latest available residences added to the KirayLink collection.
            </p>
          </div>
          <Link
            href="/listings"
            className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:text-accent-text"
          >
            View all properties
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recentProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              initialSaved={savedPropertyIds.includes(property.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
