"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ShieldAlert, ArrowRight } from "lucide-react";
import { signInAction } from "@/lib/auth";
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded bg-[#FDF2F2] border border-[#9E2A2B]/30 flex items-start gap-2.5 text-xs text-[#9E2A2B]"
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
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" aria-hidden="true" />}
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="secondary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          <span>Sign In to Account</span>
          <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
        </Button>
      </form>

      <div className="text-center pt-2 text-xs text-[#5B677A]">
        Do not have an account yet?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-[#8C6E43] hover:text-[#0F172A] underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
