"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Phone, ShieldAlert, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import type { UserRole } from "@/types/user";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SignUpForm() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole>("tenant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message || "Sign-up failed. Please review your details.");
        return;
      }

      const profileResponse = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, phone: phone.trim() || undefined }),
      });
      const profileResult = (await profileResponse.json()) as {
        user?: { role: UserRole };
        error?: string;
      };

      if (!profileResponse.ok || !profileResult.user) {
        setErrorMessage(
          profileResult.error || "Your account was created, but its profile could not be saved."
        );
        return;
      }

      router.push(
        profileResult.user.role === "landlord"
          ? "/landlord/dashboard"
          : "/tenant/dashboard"
      );
      router.refresh();
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Type Selector Tabs */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-main block">
          Select Account Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("tenant")}
            className={`p-3 rounded border text-left transition-all cursor-pointer ${
              role === "tenant"
                ? "bg-[#0F172A] text-white border-[#0F172A]"
                : "bg-surface text-muted border-border hover:border-[#C5A880]"
            }`}
          >
            <div className="font-semibold text-xs">Prospective Tenant</div>
            <div
              className={`text-[11px] ${
                role === "tenant" ? "text-slate-300" : "text-muted"
              }`}
            >
              Discover & rent residences
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole("landlord")}
            className={`p-3 rounded border text-left transition-all cursor-pointer ${
              role === "landlord"
                ? "bg-[#0F172A] text-white border-[#0F172A]"
                : "bg-surface text-muted border-border hover:border-[#C5A880]"
            }`}
          >
            <div className="font-semibold text-xs">Property Landlord</div>
            <div
              className={`text-[11px] ${
                role === "landlord" ? "text-slate-300" : "text-muted"
              }`}
            >
              List & manage properties
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
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
          label="Full Legal Name"
          type="text"
          placeholder="e.g. Dawit Haile"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User className="w-4 h-4" aria-hidden="true" />}
          disabled={isLoading}
        />

        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="e.g. dawit@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" aria-hidden="true" />}
          disabled={isLoading}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+251 91 123 4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          icon={<Phone className="w-4 h-4" aria-hidden="true" />}
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Create Password"
            type="password"
            autoComplete="new-password"
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" aria-hidden="true" />}
            disabled={isLoading}
          />

          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" aria-hidden="true" />}
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          <span>Complete Registration</span>
          <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
        </Button>
      </form>

      <div className="text-center pt-2 text-xs text-muted">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-gold-strong hover:text-main underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
