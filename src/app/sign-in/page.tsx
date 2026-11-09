import { Suspense } from "react";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign In | KirayLink",
  description:
    "Sign in to your KirayLink account to manage listings, save residences, or respond to tenant inquiries.",
};

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Member access"
      title="Welcome back."
      description="Sign in to revisit saved residences, manage your account, and continue your conversations."
    >
      <Suspense
        fallback={
          <div className="py-8 text-center text-sm text-secondary" role="status">
            Loading sign-in form...
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
