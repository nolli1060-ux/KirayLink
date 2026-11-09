import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";

export default function Footer() {
  return (
    <footer className="bg-strong-surface text-on-strong-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-16 md:grid-cols-[1.4fr_0.8fr_0.8fr] lg:px-8">
        <div className="max-w-sm">
          <BrandLogo
            href="/"
            size="footer"
            showWordmark
            wordmarkClassName="font-serif text-xl font-semibold tracking-tight text-on-strong-surface"
          />
          <p className="mt-5 text-sm leading-7 text-white/70">
            A thoughtful way to discover available rental homes and connect
            with landlords in Addis Ababa.
          </p>
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.15em] text-white/60">
            Addis Ababa · Ethiopia
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Explore
          </h2>
          <div className="mt-5 flex flex-col items-start gap-4 text-sm text-white/75">
            <Link className="transition-colors hover:text-accent" href="/">
              Home
            </Link>
            <Link
              className="transition-colors hover:text-accent"
              href="/listings"
            >
              Explore properties
            </Link>
            <Link
              className="transition-colors hover:text-accent"
              href="/#about"
            >
              About KirayLink
            </Link>
            <Link
              className="transition-colors hover:text-accent"
              href="/#contact"
            >
              Contact
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Your account
          </h2>
          <div className="mt-5 flex flex-col items-start gap-4 text-sm text-white/75">
            <Link
              className="transition-colors hover:text-accent"
              href="/sign-in"
            >
              Log in
            </Link>
            <Link
              className="inline-flex items-center gap-1 transition-colors hover:text-accent"
              href="/sign-up"
            >
              Create account
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link
              className="transition-colors hover:text-accent"
              href="/sign-up?role=landlord"
            >
              List a property
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; 2026 KirayLink. All rights reserved.</p>
          <p>Thoughtful discovery · Transparent rental details</p>
        </div>
      </div>
    </footer>
  );
}
