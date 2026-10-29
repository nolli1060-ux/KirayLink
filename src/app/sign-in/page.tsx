import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import SignInForm from "@/components/auth/SignInForm";
import { properties } from "@/data/properties";

export const metadata: Metadata = {
  title: "Sign In | KirayLink",
  description:
    "Sign in to your KirayLink account to access your saved properties, inquiries, or manage your real estate portfolio.",
};

export default function SignInPage() {
  const featuredProperty = properties.find((property) => property.featured);

  return (
    <section className="relative isolate flex min-h-[calc(100svh-8rem)] items-center overflow-hidden bg-[#101114] py-10 sm:py-14 lg:py-16">
      {featuredProperty && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url("${featuredProperty.imageUrl}")` }}
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(12,14,18,0.86)_0%,rgba(12,14,18,0.66)_48%,rgba(12,14,18,0.55)_100%)]"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8">
        <div className="max-w-2xl text-white">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-sm">
            <Building2 className="h-4 w-4 text-[#F3B41B]" aria-hidden="true" />
            A better way to find your next home
          </div>

          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Find a place
            <br className="hidden sm:block" /> that feels{" "}
            <span className="text-[#F3B41B]">like home.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
            Explore rental homes across Addis Ababa, keep track of the places
            you love, and connect with landlords when you&apos;re ready.
          </p>

          <Link
            href="/listings"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#F3B41B] px-6 py-3 text-sm font-bold text-[#17191F] shadow-sm transition-colors hover:bg-[#FFC72C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F3B41B]"
          >
            Explore available homes
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <div className="border border-white/60 bg-[#FAF9F6] p-6 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.6)] sm:p-9">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A87900]">
                KirayLink member access
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#17191F]">
                Welcome back
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#626873]">
                Sign in to view your saved homes and rental activity.
              </p>
            </div>

            <Suspense
              fallback={
                <div
                  role="status"
                  className="py-8 text-center text-sm text-[#626873]"
                >
                  Loading sign-in form...
                </div>
              }
            >
              <SignInForm />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
