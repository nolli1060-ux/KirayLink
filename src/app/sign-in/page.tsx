import { Suspense } from "react";
import type { Metadata } from "next";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign In | KirayLink",
  description:
    "Sign in to your KirayLink account to access your saved properties, inquiries, or manage your real estate portfolio.",
};

export default function SignInPage() {
  return (
    <div className="py-16 max-w-xl mx-auto px-4 sm:px-6">
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Sign In to KirayLink
          </h1>
          <p className="text-xs sm:text-sm text-[#5B677A]">
            Enter your credentials to access your tenant, landlord, or administration portal.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-8 text-center text-xs text-[#5B677A]">
              Loading sign-in form...
            </div>
          }
        >
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
