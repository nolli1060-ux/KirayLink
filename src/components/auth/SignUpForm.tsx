"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Building, Phone, ShieldAlert, ArrowRight } from "lucide-react";
import { signUpAction } from "@/lib/auth";
import type { UserRole } from "@/types/user";
import Input from "@/components/ui/Input";

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRole = searchParams.get("role");

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const role: UserRole = selectedRole ?? (urlRole === "landlord" ? "landlord" : "tenant");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
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
    if (!phone.trim()) {
      setErrorMessage("Please provide a contact phone number.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("email", email.trim());
      formData.set("password", password);
      formData.set("role", role);
      formData.set("phone", phone.trim());
      if (company.trim()) formData.set("company", company.trim());

      const result = await signUpAction(null, formData);

      if (!result.success) {
        setErrorMessage(result.error || "Sign-up failed. Please review your details.");
        setIsLoading(false);
      } else if (result.redirectUrl) {
        router.push(result.redirectUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Type Selector Tabs */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#242622] block">
          Select Account Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedRole("tenant")}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              role === "tenant"
                ? "bg-[#123B32] text-white border-[#123B32] shadow-sm"
                : "bg-white text-[#77766F] border-[#EDE8DE] hover:border-[#C6A56B]"
            }`}
          >
            <div className="font-semibold text-xs">Prospective Tenant</div>
            <div
              className={`text-[11px] mt-0.5 ${
                role === "tenant" ? "text-[#EDE8DE]/80" : "text-[#77766F]"
              }`}
            >
              Discover & rent residences
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("landlord")}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              role === "landlord"
                ? "bg-[#123B32] text-white border-[#123B32] shadow-sm"
                : "bg-white text-[#77766F] border-[#EDE8DE] hover:border-[#C6A56B]"
            }`}
          >
            <div className="font-semibold text-xs">Property Landlord</div>
            <div
              className={`text-[11px] mt-0.5 ${
                role === "landlord" ? "text-[#EDE8DE]/80" : "text-[#77766F]"
              }`}
            >
              List & manage properties
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#9E2A2B]/30 flex items-start gap-2.5 text-xs text-[#9E2A2B]"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#9E2A2B]" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label="Full Legal Name"
          type="text"
          placeholder="e.g. Dawit Haile"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />}
          disabled={isLoading}
          required
        />

        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="e.g. dawit@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />}
          disabled={isLoading}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+251 91 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />}
            disabled={isLoading}
            required
            helperText="Used for tenant-landlord communication."
          />

          {role === "landlord" ? (
            <Input
              label="Real Estate / Company Name"
              type="text"
              placeholder="e.g. Addis Property Group"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              icon={<Building className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />}
              disabled={isLoading}
              helperText="Optional agency branding."
            />
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Create Password"
            type="password"
            autoComplete="new-password"
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />}
            disabled={isLoading}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />}
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-3 inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-full bg-[#C6A56B] px-6 py-3 text-sm font-semibold text-[#123B32] transition-colors hover:bg-[#d4b57e] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-xs"
        >
          <span>{isLoading ? "Creating Account..." : "Complete Registration"}</span>
          <ArrowRight className="w-4 h-4 text-[#123B32]" aria-hidden="true" />
        </button>
      </form>

      <div className="text-center pt-2 text-xs text-[#77766F]">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-[#123B32] hover:text-[#C6A56B] underline transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
