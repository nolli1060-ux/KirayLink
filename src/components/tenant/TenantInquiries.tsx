import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MessageSquareText,
} from "lucide-react";
import type { Inquiry } from "@/types/inquiry";
import TenantEmptyState from "@/components/tenant/TenantEmptyState";
import { formatPrice } from "@/lib/utils";

interface TenantInquiriesProps {
  inquiries: Inquiry[];
}

const inquiryStatuses: Record<
  Inquiry["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Awaiting review",
    className: "border-status-warning/30 bg-status-warning-bg text-status-warning",
  },
  reviewed: {
    label: "Under review",
    className: "border-border bg-surface-muted text-secondary",
  },
  responded: {
    label: "Landlord responded",
    className: "border-status-success/30 bg-status-success-bg text-status-success",
  },
};

export default function TenantInquiries({ inquiries }: TenantInquiriesProps) {
  if (inquiries.length === 0) {
    return (
      <TenantEmptyState
        icon={MessageSquareText}
        title="No inquiries just yet"
        description="When a residence catches your eye, send a direct inquiry to start a conversation with its landlord."
        actionText="Browse residences"
        actionHref="/listings"
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="border-b border-border pb-3 text-sm text-secondary">
        <strong className="font-semibold text-primary">{inquiries.length}</strong>{" "}
        {inquiries.length === 1 ? "inquiry sent" : "inquiries sent"}
      </div>

      <div className="space-y-4">
        {inquiries.map((inquiry) => {
          const status = inquiryStatuses[inquiry.status];
          return (
            <article
              key={inquiry.id}
              className="rounded-3xl border border-card-border bg-card p-5 shadow-card transition-colors hover:border-accent/60 sm:p-6"
            >
              <header className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-text">
                    Residence inquiry
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-medium text-primary">
                    {inquiry.propertyTitle}
                  </h3>
                  {inquiry.propertyLocation && (
                    <p className="mt-1 text-sm text-secondary">
                      {inquiry.propertyLocation}
                    </p>
                  )}
                  {inquiry.propertyPrice && (
                    <p className="mt-2 text-sm font-medium text-primary">
                      {formatPrice(inquiry.propertyPrice)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                  <Link
                    href={`/properties/${inquiry.propertyId}`}
                    className="inline-flex min-h-9 items-center gap-1 rounded-full border border-border px-3 text-xs font-semibold text-primary transition-colors hover:border-accent hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    View
                    <ArrowUpRight className="h-3.5 w-3.5 text-accent-text" aria-hidden="true" />
                  </Link>
                </div>
              </header>

              <div className="mt-4 rounded-2xl border border-border bg-surface-muted p-4">
                <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-text">
                  <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
                  Your message
                </p>
                <p className="whitespace-pre-line text-sm leading-6 text-primary">
                  {inquiry.message}
                </p>
              </div>

              <footer className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-accent-text" aria-hidden="true" />
                  Sent {new Date(inquiry.createdAt).toLocaleDateString()}
                </span>
                {inquiry.moveInDate && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-accent-text" aria-hidden="true" />
                    Move-in target: {inquiry.moveInDate}
                  </span>
                )}
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}
