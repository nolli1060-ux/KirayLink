import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto grid min-h-[min(760px,calc(100svh-10rem))] max-w-7xl items-stretch gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:gap-10">
        <aside className="relative hidden min-h-[560px] overflow-hidden rounded-[2rem] bg-strong-surface p-9 text-on-strong-surface shadow-popover lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full border border-accent/20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-[24rem] w-[24rem] rounded-full border border-accent/20"
          />
          <BrandLogo
            href="/"
            size="auth"
            showWordmark
            className="relative z-10 gap-3"
            wordmarkClassName="font-serif text-xl font-medium tracking-tight text-on-strong-surface"
          />

          <div className="relative z-10 py-12">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 text-accent">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              <span className="absolute h-5 w-5 rounded-full border border-accent/50" aria-hidden="true" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              A considered way to find home
            </p>
            <h2 className="mt-4 max-w-lg font-serif text-4xl font-medium leading-[1.13] tracking-tight xl:text-5xl">
              A new address.
              <br />
              <span className="italic text-accent">A fresh beginning.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-on-strong-surface/75">
              Discover residences across Addis Ababa, keep the details close,
              and connect directly with property owners.
            </p>

            <div className="mt-8 flex items-center gap-3 border-t border-on-strong-surface/15 pt-5">
              <span className="text-xs font-medium text-on-strong-surface/70">
                Addis Ababa
              </span>
              <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
              <span className="text-xs font-medium text-on-strong-surface/70">
                Ethiopia
              </span>
            </div>
          </div>

          <Link
            href="/listings"
            className="relative z-10 inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-on-strong-surface/20 px-5 text-sm font-medium text-on-strong-surface transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Explore residences
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </aside>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-[560px] rounded-[1.75rem] border border-card-border bg-card p-6 shadow-card sm:p-9 lg:p-10">
            <div className="mb-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-text">
                {eyebrow}
              </p>
              <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-primary sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-secondary">
                {description}
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
