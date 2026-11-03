import Link from "next/link";
import { ArrowDown, MapPin, Sparkles } from "lucide-react";
import PropertySearch from "@/components/properties/PropertySearch";
import { getAllActiveProperties } from "@/lib/properties-store";

export default async function Hero() {
  const activeProperties = await getAllActiveProperties();
  const featuredProperty = activeProperties.find((p) => p.featured) || activeProperties[0];

  return (
    <section className="relative isolate mx-auto min-h-[640px] max-w-[1600px] overflow-hidden bg-gradient-to-b from-[#123B32] via-[#0F322A] to-[#0A221C] text-white sm:min-h-[700px]">
      {featuredProperty?.imageUrl && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-[center_55%] opacity-35 mix-blend-luminosity"
          style={{ backgroundImage: `url("${featuredProperty.imageUrl}")` }}
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(23,74,61,0.6)_0%,rgba(14,43,36,0.92)_55%,rgba(10,31,26,0.98)_100%)]"
      />

      <div className="mx-auto flex min-h-[640px] max-w-7xl flex-col items-center justify-center px-4 pb-20 pt-16 text-center sm:min-h-[700px] sm:px-6 sm:pt-20 lg:px-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C6A56B]/30 bg-black/25 px-4 py-2 text-xs font-semibold tracking-wide text-[#EDE8DE] backdrop-blur-md">
          <MapPin className="h-4 w-4 text-[#C6A56B]" aria-hidden="true" />
          <span>Curated Residences Across Addis Ababa</span>
        </div>

        <h1 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight font-serif sm:text-6xl lg:text-7xl">
          Come home to
          <br />
          <span className="text-[#C6A56B] italic font-normal">something better.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#EDE8DE]/80 sm:text-base sm:leading-8">
          Discover a curated portfolio of luxury residences, penthouses, and apartments in Addis Ababa with transparent lease terms and direct landlord representation.
        </p>

        <div className="mt-8 w-full max-w-3xl rounded-2xl bg-[#F8F6F0] p-2.5 shadow-[0_24px_70px_-24px_rgba(10,31,26,0.7)] border border-[#C6A56B]/30 sm:mt-10 sm:flex sm:items-center sm:rounded-full sm:p-2.5">
          <PropertySearch />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-[#EDE8DE]/75 sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
            Verified luxury residences
          </span>
          <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-[#C6A56B] sm:block" />
          <span>Transparent lease terms</span>
          <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-[#C6A56B] sm:block" />
          <span>Direct landlord inquiries</span>
        </div>

        <div className="mt-10 sm:mt-12">
          <Link
            href="/listings"
            className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#EDE8DE]/80 transition-colors hover:text-[#C6A56B]"
          >
            <span>Explore Collection</span>
            <ArrowDown className="h-4 w-4 text-[#C6A56B] transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
