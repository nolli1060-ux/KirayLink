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
    `Hello, I am interested in leasing ${propertyTitle} (Ref: ${propertyId}). Please let me know when it is possible to arrange a private viewing.`
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
      <div className="bg-white border border-[#1B6348]/30 rounded-lg p-6 space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-[#EDF7F2] text-[#1B6348] mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-[#0F172A]">
          Inquiry Successfully Sent
        </h3>
        <p className="text-xs text-[#5B677A] leading-relaxed">
          Your request regarding <strong>{propertyTitle}</strong> has been
          forwarded to <strong>{landlord.name}</strong>.
        </p>
        <div className="p-3 rounded bg-[#FDFBF7] border border-[#E6E0D5] text-xs text-[#5B677A] flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-[#8C6E43]" aria-hidden="true" />
          <span>Typical response time: {landlord.responseTime}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsSubmitted(false);
            setMessage("");
          }}
          className="text-xs text-[#8C6E43] font-semibold underline hover:text-[#0F172A] cursor-pointer"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E6E0D5] rounded-lg p-6 space-y-5 shadow-sm">
      <div className="border-b border-[#F0ECE3] pb-4 space-y-1">
        <h3 className="text-base font-bold text-[#0F172A]">
          Inquire About This Residence
        </h3>
        <p className="text-xs text-[#5B677A]">
          Direct contact with verified manager:{" "}
          <strong className="text-[#0F172A]">{landlord.name}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Your Full Name"
          placeholder="e.g. Samuel Kebede"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          disabled={isSubmitting}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. samuel@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={isSubmitting}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="e.g. +251 91 123 4567"
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
            className="text-xs font-semibold uppercase tracking-wider text-[#0F172A] block"
          >
            Message to Landlord
          </label>
          <textarea
            id="inquiry-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-white border border-[#E6E0D5] rounded px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
          />
          {errors.message && (
            <p className="text-xs text-[#9E2A2B] font-medium" role="alert">
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

      <div className="pt-3 border-t border-[#F0ECE3] flex items-center justify-center gap-2 text-[11px] text-[#5B677A]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#1B6348]" aria-hidden="true" />
        <span>Verified Identity & Encrypted Messaging</span>
      </div>
    </div>
  );
}
