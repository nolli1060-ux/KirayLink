import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0C2822] text-[#EDE8DE] border-t border-[#174A3D]/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_0.8fr_0.8fr] md:py-20 lg:px-8">
        <div className="max-w-sm space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C6A56B]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C6A56B] text-[#123B32] shadow-sm">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-xl font-bold tracking-tight text-white font-serif">
              Kiray<span className="text-[#C6A56B]">Link</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-[#EDE8DE]/70">
            Ethiopia&apos;s refined platform for luxury residences, penthouses, and premier rental properties in Addis Ababa.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C6A56B]/30 bg-[#123B32]/60 px-3 py-1 text-[11px] font-medium text-[#C6A56B]">
              Addis Ababa · Luxury Real Estate
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#C6A56B]">
            Residences & Discovery
          </h2>
          <div className="mt-5 flex flex-col items-start gap-3.5 text-sm text-[#EDE8DE]/75">
            <Link className="transition-colors hover:text-[#C6A56B]" href="/">
              Home
            </Link>
            <Link
              className="transition-colors hover:text-[#C6A56B]"
              href="/listings"
            >
              Curated Residences
            </Link>
            <Link
              className="transition-colors hover:text-[#C6A56B]"
              href="/sign-up?role=landlord"
            >
              List a Property
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#C6A56B]">
            Private Access
          </h2>
          <div className="mt-5 flex flex-col items-start gap-3.5 text-sm text-[#EDE8DE]/75">
            <Link
              className="transition-colors hover:text-[#C6A56B]"
              href="/sign-in"
            >
              Member Sign In
            </Link>
            <Link
              className="inline-flex items-center gap-1 transition-colors hover:text-[#C6A56B]"
              href="/sign-up"
            >
              Create Account
              <ArrowUpRight className="h-3.5 w-3.5 text-[#C6A56B]" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[#174A3D]/50 bg-[#09201B]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-[#77766F] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; 2026 KirayLink. An exceptional standard of rental living.</p>
          <p className="text-[11px] text-[#94938B]">Curated Residences · Transparent Terms</p>
        </div>
      </div>
    </footer>
  );
}
