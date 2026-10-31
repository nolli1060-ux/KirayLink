import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111216] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_0.8fr_0.8fr] md:py-16 lg:px-8">
        <div className="max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8C6E43]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C5A880] text-brand-contrast">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Kiray<span className="text-gold-accent">Link</span>
            </span>
          </Link>
          <p className="mt-4 text-sm leading-6 text-white/60">
            A clearer way to find rental homes and connect with landlords in
            Addis Ababa.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">
            Explore
          </h2>
          <div className="mt-4 flex flex-col items-start gap-3 text-sm text-white/75">
            <Link className="transition-colors hover:text-gold-accent" href="/">
              Home
            </Link>
            <Link
              className="transition-colors hover:text-gold-accent"
              href="/listings"
            >
              Browse homes
            </Link>
            <Link
              className="transition-colors hover:text-gold-accent"
              href="/sign-up?role=landlord"
            >
              List a property
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">
            Your account
          </h2>
          <div className="mt-4 flex flex-col items-start gap-3 text-sm text-white/75">
            <Link
              className="transition-colors hover:text-gold-accent"
              href="/sign-in"
            >
              Sign in
            </Link>
            <Link
              className="inline-flex items-center gap-1 transition-colors hover:text-gold-accent"
              href="/sign-up"
            >
              Create an account
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; KirayLink</p>
          <p>Find a place to feel at home.</p>
        </div>
      </div>
    </footer>
  );
}
