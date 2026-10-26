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
      <div className="bg-white border border-[#E6E0D5] rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2 text-center">
          <Badge variant="gold" size="sm">
            KirayLink Membership
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-[#5B677A]">
            Join KirayLink as a tenant or property owner.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-8 text-center text-xs text-[#5B677A]">
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
