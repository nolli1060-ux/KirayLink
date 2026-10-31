"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ShieldAlert, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import type { SessionUser } from "@/types/user";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("redirect") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message || "Authentication failed. Please verify credentials.");
        return;
      }

      const response = await fetch("/api/auth/session", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Could not load your account profile.");
      }

      const { user } = (await response.json()) as { user: SessionUser | null };
      if (!user) {
        setErrorMessage("Your account profile is not available. Please contact support.");
        return;
      }

      const safeReturnUrl =
        returnUrl.startsWith("/") &&
        !returnUrl.startsWith("//") &&
        !returnUrl.includes("\\")
          ? returnUrl
          : "";
      const destination =
        safeReturnUrl ||
        (user.role === "landlord"
            ? "/landlord/dashboard"
            : user.role === "admin"
              ? "/admin/dashboard"
              : "/tenant/dashboard");
      router.push(destination);
      router.refresh();
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded bg-error-bg border border-[#9E2A2B]/30 flex items-start gap-2.5 text-xs text-error"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="e.g. resident@kiraylink.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" aria-hidden="true" />}
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" aria-hidden="true" />}
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          <span>Sign In to Account</span>
          <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
        </Button>
      </form>

      <div className="text-center pt-2 text-xs text-muted">
        Do not have an account yet?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-gold-strong hover:text-main underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
