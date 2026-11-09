import { Suspense } from "react";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create Account | KirayLink",
  description:
    "Create a KirayLink account to save rental properties, send inquiries, or list and manage properties.",
};

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="KirayLink membership"
      title="Create your account."
      description="Join as a tenant searching for a home or as a landlord sharing a residence."
    >
      <Suspense
        fallback={
          <div className="py-8 text-center text-sm text-secondary" role="status">
            Loading registration form...
          </div>
        }
      >
        <SignUpForm />
      </Suspense>
    </AuthShell>
  );
}
