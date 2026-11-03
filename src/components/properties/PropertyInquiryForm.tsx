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
      <div className="bg-white border border-[#174A3D]/30 rounded-2xl p-7 space-y-4 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#EAF3F0] text-[#174A3D] mx-auto flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-[#123B32] font-serif">
          Inquiry Successfully Sent
        </h3>
        <p className="text-xs text-[#77766F] leading-relaxed">
          Your inquiry regarding <strong>{propertyTitle}</strong> has been forwarded directly to <strong>{landlord.name}</strong>.
        </p>
        <div className="p-3.5 rounded-xl bg-[#F8F6F0] border border-[#EDE8DE] text-xs text-[#77766F] flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />
          <span>Expected response: <strong className="text-[#123B32]">{landlord.responseTime || "within 24 hours"}</strong></span>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsSubmitted(false);
            setMessage("");
          }}
          className="text-xs text-[#C6A56B] font-bold underline hover:text-[#123B32] transition-colors cursor-pointer"
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
          className="p-3.5 rounded-xl bg-[#FBEFEF] border border-[#8B2627]/30 text-xs text-[#8B2627]"
        >
          {errors.form}
        </div>
      )}

      <Input
        label="Your Full Name *"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Alazar Mengistu"
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
          placeholder="alazar@example.com"
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
          placeholder="+251 91 234 5678"
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
        disabled={isSubmitting}
        helperText="Optional target occupancy date."
      />

      <div className="space-y-1.5">
        <label
          htmlFor="inquiry-message"
          className="block text-xs font-semibold uppercase tracking-wider text-[#242622]"
        >
          Message to Landlord *
        </label>
        <textarea
          id="inquiry-message"
          name="message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about viewing availability, lease terms, or deposit requirements..."
          disabled={isSubmitting}
          className={`w-full text-xs text-[#242622] bg-[#F8F6F0] border rounded-xl p-3.5 focus:outline-none focus:border-[#C6A56B] focus:ring-2 focus:ring-[#C6A56B]/25 transition-all resize-y ${
            errors.message ? "border-[#8B2627]" : "border-[#EDE8DE]"
          }`}
        />
        {errors.message && (
          <p role="alert" className="text-xs text-[#8B2627]">
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#123B32] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#174A3D] transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#C6A56B]" aria-hidden="true" />
            <span>Transmitting Inquiry...</span>
          </>
        ) : (
          <>
            <Send className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
            <span>Send Direct Inquiry</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#77766F] pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-[#174A3D]" aria-hidden="true" />
        <span>Direct inquiry delivered to verified landlord: {landlord.name}</span>
      </div>
    </form>
  );
}
