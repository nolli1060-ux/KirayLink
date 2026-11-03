import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign In | KirayLink",
  description:
    "Sign in to your KirayLink account to manage listings, save residences, or respond to tenant inquiries.",
};

export default function SignInPage() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-8rem)] items-center overflow-hidden bg-gradient-to-br from-[#123B32] via-[#0F322A] to-[#0A221C] py-12 sm:py-16 lg:py-20">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(198,165,107,0.18),rgba(0,0,0,0))]"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8">
        <div className="max-w-2xl text-white">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-sm">
            <Building2 className="h-4 w-4 text-[#C6A56B]" aria-hidden="true" />
            Verified luxury rental marketplace
          </div>

          <h1 className="text-4xl font-serif font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl text-white">
            Find a place
            <br className="hidden sm:block" /> that feels{" "}
            <span className="text-[#C6A56B] italic font-serif">like home.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-[#EDE8DE]/80 sm:text-base sm:leading-7 font-sans">
            Explore curated residences across Addis Ababa, keep track of places
            you love, and connect directly with verified property landlords.
          </p>

          <Link
            href="/listings"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#C6A56B] px-7 py-3 text-sm font-semibold text-[#123B32] shadow-sm transition-colors hover:bg-[#d4b57e]"
          >
            Explore available homes
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <div className="border border-[#EDE8DE] bg-white p-6 shadow-[0_24px_80px_-32px_rgba(18,59,50,0.35)] sm:p-9 rounded-3xl">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C6A56B]">
                KirayLink member access
              </p>
              <h2 className="mt-3 text-3xl font-serif font-bold tracking-tight text-[#242622]">
                Welcome back
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#77766F] font-sans">
                Sign in to view your dashboard, saved homes, and rental inquiries.
              </p>
            </div>

            <Suspense
              fallback={
                <div className="py-8 text-center text-xs text-[#77766F]">
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
