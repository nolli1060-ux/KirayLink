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
    <div className="max-w-2xl bg-white border border-[#EDE8DE] rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_-8px_rgba(18,59,50,0.06)]">
      <div className="mb-6 border-b border-[#EDE8DE] pb-4">
        <h2 className="text-lg font-serif font-bold text-[#242622]">Account Profile Details</h2>
        <p className="text-xs text-[#77766F] mt-1 font-sans">
          Manage your personal information, contact phone, and public agency profile.
        </p>
      </div>

      {statusMessage && (
        <div
          role="alert"
          className={`flex items-start gap-2.5 p-3.5 rounded-xl text-xs mb-5 ${
            statusMessage.type === "success"
              ? "bg-[#EAF3F0] border border-[#174A3D]/30 text-[#174A3D]"
              : "bg-[#FDF2F2] border border-[#9E2A2B]/30 text-[#9E2A2B]"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#174A3D]" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#9E2A2B]" aria-hidden="true" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Legal Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />}
          disabled={isLoading}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#242622]">
            Email Address (Read-only)
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full rounded-xl border border-[#EDE8DE] bg-[#F8F6F0] px-3.5 py-2.5 text-xs text-[#77766F] cursor-not-allowed"
          />
          <p className="text-[11px] text-[#77766F]">
            Account email cannot be modified directly for security reasons.
          </p>
        </div>

        <Input
          label="Contact Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+251 91 123 4567"
          icon={<Phone className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />}
          disabled={isLoading}
          helperText="Displayed to prospective tenants on your verified listings."
        />

        {user.role === "landlord" && (
          <Input
            label="Agency / Real Estate Company Name"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Bole Luxury Estates"
            icon={<Building className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />}
            disabled={isLoading}
            helperText="Optional branding shown on property cards and detail headers."
          />
        )}

        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full bg-[#C6A56B] px-6 py-2.5 text-xs font-semibold text-[#123B32] hover:bg-[#d4b57e] transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#123B32]" aria-hidden="true" />
                <span>Saving Profile...</span>
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
