import { Suspense } from "react";
import type { Metadata } from "next";
import SignUpForm from "@/components/auth/SignUpForm";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Create Account | KirayLink",
  description:
    "Create a KirayLink account to save rental properties, send inquiries, or list and manage properties.",
};

export default function SignUpPage() {
  return (
    <div className="py-16 max-w-xl mx-auto px-4 sm:px-6">
      <div className="bg-white border border-[#EDE8DE] rounded-3xl p-6 sm:p-9 shadow-[0_24px_80px_-32px_rgba(18,59,50,0.12)] space-y-6">
        <div className="space-y-2 text-center">
          <Badge variant="gold" size="sm" className="rounded-full px-3 py-1">
            KirayLink Membership
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#242622] tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-[#77766F] font-sans">
            Join KirayLink as a prospective tenant or property landlord.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-8 text-center text-xs text-[#77766F]">
              Loading registration form...
            </div>
          }
        >
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
