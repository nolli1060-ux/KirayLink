"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building,
  Loader2,
  Mail,
  Phone,
  ShieldAlert,
  User,
} from "lucide-react";
import { signUpAction } from "@/lib/auth";
import type { UserRole } from "@/types/user";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/auth/PasswordInput";

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
    if (name.trim().length < 2) {
      errors.name = "Enter your name using at least 2 characters.";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!phone.trim()) errors.phone = "Enter a contact phone number.";
    if (password.length < 6) {
      errors.password = "Use at least 6 characters for your password.";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "The passwords do not match.";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
        setErrorMessage(result.error || "Registration failed. Please review your details.");
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

  const accountTypes: { value: UserRole; title: string; detail: string }[] = [
    {
      value: "tenant",
      title: "Prospective tenant",
      detail: "Discover and rent residences",
    },
    {
      value: "landlord",
      title: "Property landlord",
      detail: "List and manage properties",
    },
  ];

  return (
    <div className="space-y-6">
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          I am joining as a
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {accountTypes.map((account) => {
            const isSelected = role === account.value;
            return (
              <button
                key={account.value}
                type="button"
                aria-pressed={isSelected}
                disabled={isLoading}
                onClick={() => setSelectedRole(account.value)}
                className={`min-h-[76px] rounded-2xl border p-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60 ${
                  isSelected
                    ? "border-button-primary bg-button-primary text-button-primary-text"
                    : "border-border bg-surface text-primary hover:border-accent"
                }`}
              >
                <span className="block text-xs font-semibold">{account.title}</span>
                <span
                  className={`mt-1 block text-[11px] ${
                    isSelected ? "text-button-primary-text/75" : "text-secondary"
                  }`}
                >
                  {account.detail}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
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
          label="Full name"
          type="text"
          name="name"
          id="sign-up-name"
          autoComplete="name"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearFieldError("name");
          }}
          icon={<User className="h-4 w-4" aria-hidden="true" />}
          error={fieldErrors.name}
          disabled={isLoading}
          required
        />

        <Input
          label="Email address"
          type="email"
          name="email"
          id="sign-up-email"
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Phone number"
            type="tel"
            name="phone"
            id="sign-up-phone"
            autoComplete="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              clearFieldError("phone");
            }}
            icon={<Phone className="h-4 w-4" aria-hidden="true" />}
            error={fieldErrors.phone}
            helperText="For tenant and landlord communication."
            disabled={isLoading}
            required
          />

          {role === "landlord" && (
            <Input
              label="Company name"
              type="text"
              name="company"
              id="sign-up-company"
              autoComplete="organization"
              placeholder="Enter company or agency name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              icon={<Building className="h-4 w-4" aria-hidden="true" />}
              helperText="Optional agency or business name."
              disabled={isLoading}
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PasswordInput
            label="Create password"
            name="password"
            id="sign-up-password"
            autoComplete="new-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldError("password");
              clearFieldError("confirmPassword");
            }}
            error={fieldErrors.password}
            helperText="Use at least 6 characters."
            disabled={isLoading}
            required
          />

          <PasswordInput
            label="Confirm password"
            name="confirmPassword"
            id="sign-up-confirm-password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearFieldError("confirmPassword");
            }}
            error={fieldErrors.confirmPassword}
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="mt-2 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-button-primary px-6 py-3 text-sm font-semibold text-button-primary-text shadow-sm transition-colors hover:bg-button-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="h-4 w-4 text-accent" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className="border-t border-border pt-5 text-center text-sm text-secondary">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-accent-text underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
