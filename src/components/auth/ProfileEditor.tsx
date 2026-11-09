"use client";

import { useState } from "react";
import { User, Phone, Building, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { SessionUser } from "@/types/user";
import { updateUserProfileAction } from "@/lib/auth";
import Input from "@/components/ui/Input";

interface ProfileEditorProps {
  user: SessionUser;
}

export default function ProfileEditor({ user }: ProfileEditorProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [company, setCompany] = useState(user.company || "");

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("phone", phone.trim());
    formData.set("company", company.trim());

    try {
      const res = await updateUserProfileAction(null, formData);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: res.message || "Your profile has been successfully updated.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to update profile.",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "An unexpected error occurred while saving your profile.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl rounded-3xl border border-card-border bg-card p-5 shadow-card sm:p-8">
      <div className="mb-6 border-b border-border pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-text">
          Personal details
        </p>
        <h2 className="mt-1 font-serif text-xl font-medium text-primary">
          Account profile
        </h2>
        <p className="mt-2 text-sm leading-6 text-secondary">
          Review your name and contact details associated with your account.
        </p>
      </div>

      {statusMessage && (
        <div
          role={statusMessage.type === "success" ? "status" : "alert"}
          className={`mb-5 flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${
            statusMessage.type === "success"
              ? "border-status-success/30 bg-status-success-bg text-status-success"
              : "border-status-danger/30 bg-status-danger-bg text-status-danger"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User className="h-4 w-4" aria-hidden="true" />}
          disabled={isLoading}
          required
        />

        <div className="space-y-1.5">
          <label
            htmlFor="profile-email"
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-primary"
          >
            Email address
          </label>
          <input
            id="profile-email"
            type="email"
            value={user.email}
            placeholder="Enter your email address"
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-input-border bg-surface-muted px-3.5 py-2.5 text-sm text-secondary"
          />
          <p className="text-xs leading-5 text-secondary">
            Account email cannot be modified directly for security reasons.
          </p>
        </div>

        <Input
          label="Contact phone number"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          icon={<Phone className="h-4 w-4" aria-hidden="true" />}
          disabled={isLoading}
          helperText="Used for communication about your rental inquiries."
        />

        {user.role === "landlord" && (
          <Input
            label="Agency / company name"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Enter company or agency name"
            icon={<Building className="h-4 w-4" aria-hidden="true" />}
            disabled={isLoading}
            helperText="Optional agency or business name."
          />
        )}

        <div className="flex items-center justify-end border-t border-border pt-5">
          <button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-button-primary px-6 text-sm font-semibold text-button-primary-text shadow-sm transition-colors hover:bg-button-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
                <span>Saving profile...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
