"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Mail, ShieldAlert } from "lucide-react";
import { signInAction } from "@/lib/auth";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/auth/PasswordInput";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("redirect") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const clearFieldError = (field: string) => {
    setFieldErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = "Enter the email address for your account.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!password) errors.password = "Enter your password.";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      if (returnUrl) formData.set("returnUrl", returnUrl);

      const result = await signInAction(null, formData);

      if (!result.success) {
        setErrorMessage(
          result.error || "Authentication failed. Please verify credentials."
        );
        setIsLoading(false);
      } else if (result.redirectUrl) {
        router.push(result.redirectUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
        aria-busy={isLoading}
      >
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-status-danger/30 bg-status-danger-bg p-3.5 text-xs text-status-danger"
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          name="email"
          id="sign-in-email"
          autoComplete="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError("email");
          }}
          icon={<Mail className="h-4 w-4" aria-hidden="true" />}
          error={fieldErrors.email}
          disabled={isLoading}
          required
        />

        <PasswordInput
          label="Password"
          name="password"
          id="sign-in-password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearFieldError("password");
          }}
          error={fieldErrors.password}
          disabled={isLoading}
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="mt-2 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-button-primary px-6 py-3 text-sm font-semibold text-button-primary-text shadow-sm transition-colors hover:bg-button-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="h-4 w-4 text-accent" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className="border-t border-border pt-5 text-center text-sm text-secondary">
        New to KirayLink?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-accent-text underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
