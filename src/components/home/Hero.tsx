import Link from "next/link";
import { ArrowDownRight, ArrowRight, MapPin, Sparkles } from "lucide-react";
import PropertySearch from "@/components/properties/PropertySearch";
import { getSafeImageUrl } from "@/lib/utils";
import type { Property, PropertyType } from "@/types/property";

export default function Hero({ properties }: { properties: Property[] }) {
  const featuredProperty =
    properties.find((property) => property.featured) || properties[0];
  const heroImage = getSafeImageUrl(featuredProperty?.imageUrl);
  const neighborhoods = Array.from(
    new Set(properties.map((property) => property.neighborhood).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
  const propertyTypes = Array.from(
    new Set(properties.map((property) => property.propertyType).filter(Boolean))
  ) as PropertyType[];

  return (
    <section className="relative overflow-hidden bg-background text-primary">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:min-h-[650px] lg:grid-cols-[1fr_0.92fr] lg:gap-14 lg:px-8 lg:py-16">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-secondary shadow-sm sm:text-xs">
            <MapPin className="h-3.5 w-3.5 text-accent-text" aria-hidden="true" />
            A considered way to rent in Addis Ababa
          </p>
          <h1 className="mt-7 max-w-2xl font-serif text-5xl font-medium leading-[1.04] tracking-tight text-primary sm:text-6xl lg:text-7xl">
            A place to call
            <span className="mt-1 block italic text-accent-text">your own.</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-secondary sm:text-base sm:leading-8">
            Find a home that feels right. Explore available residences across
            Addis Ababa, compare the details, and connect directly with
            landlords.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/listings"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-button-primary px-6 text-sm font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover"
            >
              Explore properties
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/sign-up?role=landlord"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-6 text-sm font-semibold text-primary transition-colors hover:border-accent hover:text-accent-text"
            >
              List your property
              <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-secondary">
            <Sparkles className="h-4 w-4 text-accent-text" aria-hidden="true" />
            <span>Thoughtful discovery. Transparent rental details.</span>
          </div>
        </div>

        <div className="relative mx-auto h-[360px] w-full max-w-[620px] sm:h-[480px] lg:h-[550px]">
          <div
            role="img"
            aria-label={
              featuredProperty
                ? `${featuredProperty.title} in ${featuredProperty.location}`
                : "Residential property in Addis Ababa"
            }
            className="absolute inset-0 overflow-hidden rounded-[2rem] bg-surface-muted bg-cover bg-center shadow-popover sm:rounded-[2.5rem]"
            style={{ backgroundImage: `url("${heroImage}")` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/5" />
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 rounded-2xl border border-white/20 bg-black/35 p-4 text-white backdrop-blur-md sm:inset-x-7 sm:bottom-7 sm:p-5">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
                  {featuredProperty?.propertyType || "Addis Ababa"}
                </p>
                <p className="mt-1 truncate font-serif text-lg sm:text-xl">
                  {featuredProperty?.location || "Find your next residence"}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white">
                {featuredProperty ? "Available now" : "Explore homes"}
              </span>
            </div>
          </div>
          <div className="absolute -left-3 top-8 hidden rounded-2xl border border-border bg-surface p-4 shadow-card sm:block lg:-left-8 lg:top-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
              Your next chapter
            </p>
            <p className="mt-1 font-serif text-lg text-primary">starts at home</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-popover sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-text">
                Find your next home
              </p>
              <h2 className="mt-1 font-serif text-xl text-primary sm:text-2xl">
                Search residences
              </h2>
            </div>
            <p className="text-xs text-secondary">
              Browse real listings and connect with landlords.
            </p>
          </div>
          <PropertySearch
            neighborhoods={neighborhoods}
            propertyTypes={propertyTypes}
          />
        </div>
      </div>
    </section>
  );
}
