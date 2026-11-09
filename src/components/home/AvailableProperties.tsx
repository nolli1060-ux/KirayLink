import Link from "next/link";
import { ArrowRight, Building2, PlusCircle } from "lucide-react";
import PropertyCard from "@/components/properties/PropertyCard";
import type { Property } from "@/types/property";

export default function AvailableProperties({
  properties,
  savedPropertyIds,
}: {
  properties: Property[];
  savedPropertyIds: string[];
}) {
  const featuredProperties = properties
    .filter((property) => property.featured)
    .slice(0, 3);
  const availableProperties = (
    featuredProperties.length > 0 ? featuredProperties : properties
  ).slice(0, 3);

  return (
    <section className="bg-surface-muted py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
              A considered collection
            </p>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-primary sm:text-4xl">
              Featured residences.
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-secondary">
              Explore featured residences currently available across Addis Ababa.
            </p>
          </div>
          {availableProperties.length > 0 && (
            <Link
              href="/listings"
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:text-accent-text"
            >
              <span>View full collection</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          )}
        </div>

        {availableProperties.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {availableProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                initialSaved={savedPropertyIds.includes(property.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center shadow-card sm:p-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-muted text-accent-text shadow-sm">
              <Building2 className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-medium text-primary">
              No active listings yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-secondary">
              Be the first to list a verified property or check back soon as new residences are added to the portfolio.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/sign-up?role=landlord"
                className="inline-flex items-center gap-2 rounded-full bg-button-primary px-6 py-2.5 text-xs font-semibold text-button-primary-text shadow-sm transition-colors hover:bg-button-primary-hover"
              >
                <PlusCircle className="h-4 w-4 text-accent" aria-hidden="true" />
                List Your Property
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-2.5 text-xs font-semibold text-primary transition-colors hover:border-accent hover:text-accent-text"
              >
                Browse All
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
