import Link from "next/link";
import { ArrowDown, MapPin } from "lucide-react";
import PropertySearch from "@/components/properties/PropertySearch";
import { properties } from "@/data/properties";

export default function Hero() {
  const featuredProperty = properties.find((property) => property.featured);

  return (
    <section className="relative isolate mx-auto min-h-[620px] max-w-[1600px] overflow-hidden bg-[#17191F] text-white sm:min-h-[680px]">
      {featuredProperty && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-[center_55%]"
          style={{ backgroundImage: `url("${featuredProperty.imageUrl}")` }}
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(13,15,19,0.2)_0%,rgba(13,15,19,0.42)_38%,rgba(13,15,19,0.88)_100%)]"
      />

      <div className="mx-auto flex min-h-[620px] max-w-7xl flex-col items-center justify-center px-4 pb-20 pt-16 text-center sm:min-h-[680px] sm:px-6 sm:pt-20 lg:px-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-4 py-2 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-sm">
          <MapPin className="h-4 w-4 text-[#F3B41B]" aria-hidden="true" />
          Find your next home in Addis Ababa
        </div>

        <h1 className="max-w-4xl text-4xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
          Come home to
          <br />
          <span className="text-[#F3B41B]">something better.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
          Find a rental that fits your life, from the right neighborhood to the
          right monthly price.
        </p>

        <div className="mt-8 w-full max-w-3xl rounded-2xl bg-[#FAF9F6] p-2 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.65)] sm:mt-10 sm:flex sm:items-center sm:rounded-full sm:p-2">
          <PropertySearch />
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-white/75 sm:text-sm">
          <span>Explore available homes</span>
          <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-[#F3B41B] sm:block" />
          <span>Compare rental options</span>
          <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-[#F3B41B] sm:block" />
          <span>Connect with landlords</span>
        </div>

        <Link
          href="/listings"
          className="absolute bottom-6 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F3B41B]"
        >
          Scroll to explore
          <ArrowDown className="h-4 w-4 text-[#F3B41B]" aria-hidden="true" />
          <span className="sr-only">Browse all rental listings</span>
        </Link>
      </div>
    </section>
  );
}
