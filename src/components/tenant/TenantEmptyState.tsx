import type { ElementType } from "react";
import Link from "next/link";

interface TenantEmptyStateProps {
  icon: ElementType;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export default function TenantEmptyState({
  icon: Icon,
  title,
  description,
  actionText = "Browse Properties",
  actionHref = "/listings",
}: TenantEmptyStateProps) {
  return (
    <div className="space-y-5 rounded-3xl border border-dashed border-border bg-card px-5 py-14 text-center shadow-card sm:px-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-accent-soft text-accent-text">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="mx-auto max-w-sm space-y-2">
        <h3 className="font-serif text-xl font-medium text-primary">{title}</h3>
        <p className="text-sm leading-6 text-secondary">{description}</p>
      </div>
      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-button-primary px-5 text-sm font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
