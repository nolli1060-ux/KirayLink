"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Send, ShieldCheck, Clock, Loader2 } from "lucide-react";
import type { PropertyLandlord } from "@/types/property";
import Input from "@/components/ui/Input";
import { submitInquiryAction } from "@/lib/dashboard-actions";

interface PropertyInquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  landlord: PropertyLandlord;
}

export default function PropertyInquiryForm({
  propertyId,
  propertyTitle,
  landlord,
}: PropertyInquiryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [message, setMessage] = useState(
    `Hello, I am interested in leasing ${propertyTitle}. Please let me know when it is possible to arrange a private viewing.`
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setName(data.user.name || "");
            setEmail(data.user.email || "");
            if (data.user.phone) setPhone(data.user.phone);
          }
        }
      } catch {
        // Ignore session prefill failure
      }
    }
    loadUserData();
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!phone.trim()) errs.phone = "Phone number is required";
    if (!message.trim()) errs.message = "Please include a message";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("propertyId", propertyId);
      formData.set("name", name.trim());
      formData.set("email", email.trim());
      formData.set("phone", phone.trim());
      if (moveInDate) formData.set("moveInDate", moveInDate);
      formData.set("message", message.trim());

      const res = await submitInquiryAction(formData);
      if (res.success) {
        setIsSubmitted(true);
      } else {
        setErrors({ form: res.error || "Failed to submit inquiry." });
      }
    } catch {
      setErrors({ form: "An error occurred while sending your inquiry." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-4 rounded-2xl border border-status-success/30 bg-card p-7 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-success-bg text-status-success shadow-sm">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="font-serif text-xl font-medium text-primary">
          Inquiry Successfully Sent
        </h3>
        <p className="text-xs leading-relaxed text-secondary">
          Your inquiry regarding <strong>{propertyTitle}</strong> has been forwarded directly to <strong>{landlord.name}</strong>.
        </p>
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted p-3.5 text-xs text-secondary">
          <Clock className="h-4 w-4 text-accent-text" aria-hidden="true" />
          <span>Expected response: <strong className="text-primary">{landlord.responseTime || "within 24 hours"}</strong></span>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsSubmitted(false);
            setMessage("");
          }}
          className="cursor-pointer text-xs font-semibold text-accent-text underline transition-colors hover:text-primary"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errors.form && (
        <div
          role="alert"
          className="rounded-xl border border-status-danger/30 bg-status-danger-bg p-3.5 text-xs text-status-danger"
        >
          {errors.form}
        </div>
      )}

      <Input
        label="Your Full Name *"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your full name"
        error={errors.name}
        disabled={isSubmitting}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Email Address *"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          error={errors.email}
          disabled={isSubmitting}
          required
        />

        <Input
          label="Phone Number *"
          type="tel"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          error={errors.phone}
          disabled={isSubmitting}
          required
        />
      </div>

      <Input
        label="Desired Move-in Date"
        type="date"
        name="moveInDate"
        value={moveInDate}
        onChange={(e) => setMoveInDate(e.target.value)}
        placeholder="Select your preferred move-in date"
        disabled={isSubmitting}
        helperText="Optional target occupancy date."
      />

      <div className="space-y-1.5">
        <label
          htmlFor="inquiry-message"
          className="block text-xs font-semibold uppercase tracking-wider text-primary"
        >
          Message to Landlord *
        </label>
        <textarea
          id="inquiry-message"
          name="message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "inquiry-message-error" : undefined}
          disabled={isSubmitting}
          className={`w-full resize-y rounded-xl border bg-input p-3.5 text-sm text-primary placeholder:text-secondary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25 transition-all disabled:cursor-not-allowed disabled:bg-surface-muted ${
            errors.message ? "border-status-danger focus:ring-status-danger/25" : "border-input-border"
          }`}
        />
        {errors.message && (
          <p id="inquiry-message-error" role="alert" className="text-xs text-status-danger">
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-button-primary py-3 text-xs font-semibold uppercase tracking-wider text-button-primary-text shadow-sm transition-colors hover:bg-button-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
            <span>Transmitting Inquiry...</span>
          </>
        ) : (
          <>
            <Send className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>Send Direct Inquiry</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-secondary">
        <ShieldCheck className="h-3.5 w-3.5 text-status-success" aria-hidden="true" />
        <span>Direct inquiry delivered to verified landlord: {landlord.name}</span>
      </div>
    </form>
  );
}
