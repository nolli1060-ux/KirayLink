"use client";

import { useState } from "react";
import { CheckCircle2, Send, ShieldCheck, Clock } from "lucide-react";
import type { PropertyLandlord } from "@/types/property";
import Button from "@/components/ui/Button";
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
      <div className="bg-surface border border-[#1B6348]/30 rounded-lg p-6 space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-success-bg text-success mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-main">
          Inquiry Successfully Sent
        </h3>
        <p className="text-xs text-muted leading-relaxed">
          Your request regarding <strong>{propertyTitle}</strong> has been
          forwarded to <strong>{landlord.name}</strong>.
        </p>
        <div className="p-3 rounded bg-ivory border border-border text-xs text-muted flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-gold-strong" aria-hidden="true" />
          <span>Typical response time: {landlord.responseTime}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsSubmitted(false);
            setMessage("");
          }}
          className="text-xs text-gold-strong font-semibold underline hover:text-main cursor-pointer"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6 space-y-5 shadow-sm">
      <div className="border-b border-border-subtle pb-4 space-y-1">
        <h3 className="text-base font-bold text-main">
          Inquire About This Residence
        </h3>
        <p className="text-xs text-muted">
          Direct contact with verified manager:{" "}
          <strong className="text-main">{landlord.name}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Your Full Name"
          placeholder="Please enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          disabled={isSubmitting}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="Please enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={isSubmitting}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="Please enter your number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          disabled={isSubmitting}
        />

        <Input
          label="Target Move-In Date (Optional)"
          type="date"
          value={moveInDate}
          onChange={(e) => setMoveInDate(e.target.value)}
          disabled={isSubmitting}
        />

        <div className="space-y-1.5">
          <label
            htmlFor="inquiry-message"
            className="text-xs font-semibold uppercase tracking-wider text-main block"
          >
            Message to Landlord
          </label>
          <textarea
            id="inquiry-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-main focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
          />
          {errors.message && (
            <p className="text-xs text-error font-medium" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isSubmitting}
        >
          <Send className="w-4 h-4 mr-2" aria-hidden="true" />
          <span>Submit Direct Inquiry</span>
        </Button>
      </form>

      <div className="pt-3 border-t border-border-subtle flex items-center justify-center gap-2 text-[11px] text-muted">
        <ShieldCheck className="w-3.5 h-3.5 text-success" aria-hidden="true" />
        <span>Verified Identity & Encrypted Messaging</span>
      </div>
    </div>
  );
}
