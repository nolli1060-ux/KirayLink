"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Mail,
  MessageSquareText,
  Phone,
} from "lucide-react";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";
import { updateInquiryStatusAction } from "@/lib/dashboard-actions";
import { formatPrice } from "@/lib/utils";

interface LandlordInquiriesProps {
  initialInquiries: Inquiry[];
}

function InquiryStatus({ status }: { status: InquiryStatus }) {
  const styles: Record<InquiryStatus, string> = {
    pending: "bg-accent-soft text-accent-text",
    reviewed: "bg-surface-muted text-secondary",
    responded: "bg-status-success-bg text-status-success",
  };
  const labels: Record<InquiryStatus, string> = {
    pending: "Pending review",
    reviewed: "Under review",
    responded: "Responded",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function LandlordInquiries({
  initialInquiries,
}: LandlordInquiriesProps) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusUpdate = async (
    inquiryId: string,
    newStatus: InquiryStatus
  ) => {
    setUpdatingId(inquiryId);
    setActionError(null);
    try {
      const result = await updateInquiryStatusAction(inquiryId, newStatus);
      if (!result.success) {
        setActionError(result.error || "Could not update this inquiry.");
        return;
      }
      setInquiries((previous) =>
        previous.map((inquiry) =>
          inquiry.id === inquiryId
            ? { ...inquiry, status: newStatus }
            : inquiry
        )
      );
    } catch {
      setActionError("An unexpected error occurred while updating this inquiry.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {actionError && (
        <div
          role="alert"
          className="rounded-xl border border-status-danger/30 bg-status-danger-bg px-4 py-3 text-sm text-status-danger"
        >
          {actionError}
        </div>
      )}

      {inquiries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-5 py-14 text-center shadow-card sm:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-text">
            <MessageSquareText className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="mt-5 font-serif text-2xl font-medium text-primary">
            No tenant inquiries yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">
            Messages sent about your residences will appear here with the tenant’s
            contact details and requested move-in date.
          </p>
        </div>
      ) : (
        <>
          <p className="border-b border-border pb-3 text-sm text-secondary">
            <span className="font-semibold text-primary">{inquiries.length}</span>{" "}
            {inquiries.length === 1 ? "inquiry" : "inquiries"} received
          </p>
          <div className="space-y-3">
            {inquiries.map((inquiry) => {
              const isUpdating = updatingId === inquiry.id;
              return (
                <article
                  key={inquiry.id}
                  className="rounded-2xl border border-card-border bg-card p-4 shadow-card sm:p-5"
                >
                  <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-text">
                        Prospective tenant
                      </p>
                      <h3 className="mt-1 font-serif text-xl font-medium text-primary">
                        {inquiry.tenantName}
                      </h3>
                      <div className="mt-2 flex flex-col gap-2 text-xs text-secondary sm:flex-row sm:flex-wrap sm:gap-x-4">
                        <a
                          href={`mailto:${inquiry.tenantEmail}`}
                          className="inline-flex min-h-8 items-center gap-1.5 break-all transition-colors hover:text-accent-text"
                        >
                          <Mail className="h-3.5 w-3.5 shrink-0 text-accent-text" aria-hidden="true" />
                          {inquiry.tenantEmail}
                        </a>
                        <a
                          href={`tel:${inquiry.tenantPhone}`}
                          className="inline-flex min-h-8 items-center gap-1.5 transition-colors hover:text-accent-text"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0 text-accent-text" aria-hidden="true" />
                          {inquiry.tenantPhone}
                        </a>
                      </div>
                    </div>
                    <InquiryStatus status={inquiry.status} />
                  </header>

                  <div className="mt-4 rounded-xl border border-border bg-surface-muted p-3.5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-secondary">
                          Residence
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-primary">
                          {inquiry.propertyTitle}
                        </p>
                        {inquiry.propertyPrice && (
                          <p className="mt-0.5 text-xs text-secondary">
                            {formatPrice(inquiry.propertyPrice)}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/properties/${inquiry.propertyId}`}
                        className="inline-flex min-h-9 w-fit items-center gap-1.5 text-xs font-semibold text-accent-text transition-colors hover:text-primary"
                      >
                        View listing
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-border bg-surface p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-secondary">
                      Tenant message
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-primary">
                      {inquiry.message}
                    </p>
                  </div>

                  <footer className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 text-xs text-secondary sm:flex-row sm:flex-wrap sm:gap-x-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5 text-accent-text" aria-hidden="true" />
                        Received {new Date(inquiry.createdAt).toLocaleDateString()}
                      </span>
                      {inquiry.moveInDate && (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-accent-text" aria-hidden="true" />
                          Move-in {inquiry.moveInDate}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {inquiry.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(inquiry.id, "reviewed")}
                          disabled={isUpdating}
                          className="inline-flex min-h-9 items-center justify-center rounded-full border border-border bg-surface px-3.5 text-xs font-semibold text-primary transition-colors hover:border-accent/60 hover:bg-surface-muted disabled:opacity-50"
                        >
                          {isUpdating ? "Updating..." : "Mark reviewed"}
                        </button>
                      )}
                      {inquiry.status !== "responded" && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(inquiry.id, "responded")}
                          disabled={isUpdating}
                          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-button-primary px-3.5 text-xs font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                          {isUpdating ? "Updating..." : "Mark responded"}
                        </button>
                      )}
                    </div>
                  </footer>
                  {inquiry.status !== "responded" && (
                    <p className="mt-3 text-[11px] leading-5 text-secondary">
                      To reply, contact the tenant by email or phone above. Marking
                      responded updates the inquiry status only.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
