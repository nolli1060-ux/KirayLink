import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  ClipboardCheck,
  Compass,
  Heart,
  KeyRound,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import BrandLogo from "@/components/layout/BrandLogo";
import { getSafeImageUrl } from "@/lib/utils";
import type { Property, PropertyType } from "@/types/property";

export default function HomeSections({
  properties,
}: {
  properties: Property[];
}) {
  const categories = Array.from(
    new Set(properties.map((property) => property.propertyType).filter(Boolean))
  ) as PropertyType[];

  return (
    <>
      <section className="bg-surface-muted py-20 sm:py-24" id="categories">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
                Find your kind of place
              </p>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-primary sm:text-4xl">
                Browse by property type.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-secondary">
              Explore the home styles currently available from landlords in our
              collection.
            </p>
          </div>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => {
                const property = properties.find(
                  (item) => item.propertyType === category
                );
                const count = properties.filter(
                  (item) => item.propertyType === category
                ).length;

                return (
                  <Link
                    key={category}
                    href={`/listings?type=${encodeURIComponent(category)}`}
                    className="group relative flex min-h-52 flex-col justify-end overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-transform duration-300 hover:-translate-y-1 sm:min-h-64"
                  >
                    {property && (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{
                          backgroundImage: `url("${getSafeImageUrl(property.imageUrl)}")`,
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <div className="relative z-10 p-4 text-white sm:p-5">
                      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/75">
                        {count} {count === 1 ? "residence" : "residences"}
                      </span>
                      <span className="mt-1 flex items-center justify-between gap-2 font-serif text-lg sm:text-xl">
                        {category}
                        <ArrowRight
                          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
              <Building2 className="mx-auto h-8 w-8 text-accent-text" aria-hidden="true" />
              <p className="mt-4 font-serif text-xl text-primary">
                New property types will appear here as homes are listed.
              </p>
              <Link
                href="/listings"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-text hover:underline"
              >
                Browse available homes <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-strong-surface py-20 text-on-strong-surface sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                A simpler journey
              </p>
              <h2 className="mt-4 max-w-md font-serif text-3xl font-medium leading-tight sm:text-4xl">
                From first look to feeling at home.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-on-strong-surface/70">
                Discover available residences, review the details, then start a
                conversation with the landlord directly through the listing.
              </p>
              <Link
                href="/listings"
                className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-inverse transition-colors hover:bg-button-secondary-hover"
              >
                Start exploring <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Compass,
                  step: "01",
                  title: "Explore",
                  description:
                    "Search available homes by neighborhood, property type, and budget.",
                },
                {
                  icon: ClipboardCheck,
                  step: "02",
                  title: "Compare",
                  description:
                    "Review each residence’s price, features, location, and lease details.",
                },
                {
                  icon: MessageCircle,
                  step: "03",
                  title: "Connect",
                  description:
                    "Send an inquiry from a listing and coordinate directly with its landlord.",
                },
              ].map(({ icon: Icon, step, title, description }) => (
                <article
                  key={step}
                  className="rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                    <span className="text-xs font-medium tracking-[0.16em] text-white/45">
                      {step}
                    </span>
                  </div>
                  <h3 className="mt-8 font-serif text-xl">{title}</h3>
                  <p className="mt-3 text-xs leading-6 text-white/65 sm:text-sm">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
              For tenants
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium text-primary sm:text-4xl">
              A more considered way to find home.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-secondary">
              Useful details and direct communication help you make your next
              move with more confidence.
            </p>
            <ul className="mt-7 space-y-4">
              {[
                "Search homes by neighborhood, type, and rent budget.",
                "See property details, amenities, and lease information together.",
                "Save residences and manage inquiries from your tenant account.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-primary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/listings"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-text hover:underline"
            >
              Find a home <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="rounded-3xl border border-border bg-surface-muted p-7 sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-text">
              <Heart className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
              For landlords
            </p>
            <h2 className="mt-3 max-w-md font-serif text-3xl font-medium text-primary">
              Give your property a thoughtful introduction.
            </h2>
            <p className="mt-4 text-sm leading-7 text-secondary">
              Create a landlord account to publish residences, share the details
              renters need, and manage incoming inquiries from your dashboard.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Create and manage property listings",
                "Review tenant inquiries in one place",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 rounded-xl border border-border bg-surface p-3 text-xs leading-5 text-primary"
                >
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
            <Link
              href="/sign-up?role=landlord"
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-button-primary px-5 text-sm font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover"
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Get started as a landlord
            </Link>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-24 border-y border-border bg-surface-muted py-20 sm:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-20 lg:px-8">
          <div className="flex h-56 items-center justify-center rounded-3xl border border-border bg-surface sm:h-72">
            <BrandLogo size="feature" className="shadow-popover" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
              About KirayLink
            </p>
            <h2 className="mt-4 max-w-2xl font-serif text-3xl font-medium leading-tight text-primary sm:text-4xl">
              Finding a home should feel clear, not complicated.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-secondary sm:text-base">
              KirayLink brings renters and landlords together around the details
              that matter: available homes, transparent listing information,
              and a direct way to begin a conversation. We are building a more
              thoughtful rental experience for Addis Ababa.
            </p>
            <Link
              href="/listings"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-accent-text hover:underline"
            >
              Discover the collection <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-24 bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-8 overflow-hidden rounded-[2rem] bg-strong-surface p-7 text-on-strong-surface sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Your next address awaits
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium leading-tight sm:text-4xl">
              Ready to make a move?
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              Explore current residences and reach out to a landlord directly
              from the property that feels right.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/listings"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-inverse transition-colors hover:bg-button-secondary-hover"
            >
              Explore properties <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/sign-up?role=landlord"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:border-accent hover:text-accent"
            >
              List a property <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
