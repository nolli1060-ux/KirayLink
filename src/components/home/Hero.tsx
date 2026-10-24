import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import PropertySearch from "@/components/properties/PropertySearch";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0F172A] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-35"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85')",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/90 to-[#0F172A]/35" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C5A880]/50 bg-black/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#E5D3B4]">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Addis Ababa&apos;s verified homes
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Find a home that{" "}
            <span className="text-[#D7BD94]">suits you.</span>
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">
            Browse apartments and homes with verified ownership and clear rental
            terms.
          </p>
          <PropertySearch />
          <p className="text-xs text-slate-300">
            Homes in Bole, Kazanchis, Old Airport, and other neighborhoods.
          </p>
        </div>

        <div className="hidden justify-end lg:flex">
          <Link
            href="/listings"
            className="group flex items-center gap-4 rounded border border-white/20 bg-black/25 p-5 text-sm text-white backdrop-blur transition-colors hover:border-[#C5A880]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded bg-[#C5A880] text-[#0F172A]">
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold">Browse properties</span>
              <span className="mt-1 block text-xs text-slate-300">
                Find your next home
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
