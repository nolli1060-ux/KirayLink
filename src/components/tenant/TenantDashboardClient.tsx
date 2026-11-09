"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  Compass,
  MessageSquare,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { Property } from "@/types/property";
import type { Inquiry } from "@/types/inquiry";
import type { SessionUser } from "@/types/user";
import SavedProperties from "@/components/tenant/SavedProperties";
import TenantInquiries from "@/components/tenant/TenantInquiries";
import ProfileEditor from "@/components/auth/ProfileEditor";

interface TenantDashboardClientProps {
  user: SessionUser;
  savedProperties: Property[];
  inquiries: Inquiry[];
}

type DashboardTab = "saved" | "inquiries" | "profile";

const navigation: {
  id: DashboardTab;
  label: string;
  icon: typeof Bookmark;
}[] = [
  { id: "saved", label: "Saved residences", icon: Bookmark },
  { id: "inquiries", label: "Rental inquiries", icon: MessageSquare },
  { id: "profile", label: "Profile details", icon: UserRound },
];

export default function TenantDashboardClient({
  user,
  savedProperties,
  inquiries,
}: TenantDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("saved");
  const inquiryUpdates = inquiries
    .filter((inquiry) => inquiry.status !== "pending")
    .slice(0, 3);

  const contentTitle =
    activeTab === "saved"
      ? "Your saved residences"
      : activeTab === "inquiries"
        ? "Your rental inquiries"
        : "Your profile";
  const contentDescription =
    activeTab === "saved"
      ? "The homes you have kept for a closer look."
      : activeTab === "inquiries"
        ? "Follow the status of messages you have sent to landlords."
        : "Keep your contact details current.";

  return (
    <div className="min-h-screen bg-background text-primary">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 border-b border-border pb-7 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
              <ShieldCheck className="h-3.5 w-3.5 text-status-success" aria-hidden="true" />
              Tenant workspace
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-primary sm:text-4xl lg:text-5xl">
              Welcome back, {user.name}.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
              Keep your favorite homes close and stay up to date on conversations with landlords.
            </p>
          </div>
          <Link
            href="/listings"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-button-primary px-5 text-sm font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <Compass className="h-4 w-4 text-accent" aria-hidden="true" />
            Explore residences
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </header>

        <section
          aria-label="Your dashboard summary"
          className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
        >
          <SummaryCard
            label="Saved residences"
            value={savedProperties.length}
            note="Your shortlist"
            icon={Bookmark}
            selected={activeTab === "saved"}
            onClick={() => setActiveTab("saved")}
          />
          <SummaryCard
            label="Rental inquiries"
            value={inquiries.length}
            note="Messages sent"
            icon={MessageSquare}
            selected={activeTab === "inquiries"}
            onClick={() => setActiveTab("inquiries")}
          />
          <SummaryCard
            label="Account profile"
            value={user.name}
            note={user.phone || "Add a contact number"}
            icon={UserRound}
            selected={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            isText
          />
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
          <aside className="rounded-3xl border border-card-border bg-card p-3 shadow-card lg:sticky lg:top-24">
            <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-secondary">
              Your workspace
            </p>
            <nav
              aria-label="Tenant dashboard navigation"
              className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
            >
              {navigation.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                const count =
                  id === "saved"
                    ? savedProperties.length
                    : id === "inquiries"
                      ? inquiries.length
                      : null;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setActiveTab(id)}
                    className={`inline-flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus lg:w-full ${
                      isActive
                        ? "bg-accent-soft text-primary"
                        : "text-secondary hover:bg-surface-muted hover:text-primary"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${isActive ? "text-accent-text" : ""}`}
                      aria-hidden="true"
                    />
                    <span className="whitespace-nowrap">{label}</span>
                    {count !== null && (
                      <span className="ml-auto rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] text-secondary">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="mt-3 hidden border-t border-border pt-3 lg:block">
              <Link
                href="/listings"
                className="inline-flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-secondary transition-colors hover:bg-surface-muted hover:text-primary"
              >
                <Compass className="h-4 w-4 text-accent-text" aria-hidden="true" />
                Browse properties
              </Link>
            </div>
            <div className="mt-3 hidden rounded-2xl border border-border bg-surface-muted p-4 lg:block">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4 text-status-success" aria-hidden="true" />
                Your account
              </div>
              <p className="mt-2 break-all text-xs leading-5 text-secondary">
                {user.email}
              </p>
            </div>
          </aside>

          <main className="min-w-0">
            <section className="mb-6 flex flex-col gap-1 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-accent-text">
                  Your account
                </p>
                <h2 className="mt-1 font-serif text-2xl font-medium text-primary sm:text-3xl">
                  {contentTitle}
                </h2>
                <p className="mt-1 text-sm text-secondary">{contentDescription}</p>
              </div>
            </section>

            {activeTab === "saved" ? (
              <SavedProperties initialProperties={savedProperties} />
            ) : activeTab === "inquiries" ? (
              <TenantInquiries inquiries={inquiries} />
            ) : (
              <ProfileEditor user={user} />
            )}

            {activeTab !== "inquiries" && (
              <section
                aria-labelledby="inquiry-updates-heading"
                className="mt-8 rounded-3xl border border-card-border bg-card p-5 shadow-card sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-text">
                          Latest activity
                        </p>
                        <h3
                          id="inquiry-updates-heading"
                          className="mt-1 font-serif text-lg font-medium text-primary"
                        >
                          Inquiry updates
                        </h3>
                      </div>
                      {inquiries.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("inquiries")}
                          className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-accent-text hover:text-primary"
                        >
                          View all
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    {inquiryUpdates.length > 0 ? (
                      <ul className="mt-4 divide-y divide-border">
                        {inquiryUpdates.map((inquiry) => (
                          <li
                            key={inquiry.id}
                            className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-primary">
                                {inquiry.propertyTitle}
                              </p>
                              <p className="mt-0.5 text-xs text-secondary">
                                Status updated to{" "}
                                <span className="font-medium capitalize text-primary">
                                  {inquiry.status}
                                </span>
                              </p>
                            </div>
                            <Link
                              href={`/properties/${inquiry.propertyId}`}
                              className="inline-flex min-h-9 shrink-0 items-center gap-1 text-xs font-semibold text-accent-text hover:text-primary"
                            >
                              View residence
                              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-secondary">
                        When a landlord updates one of your inquiries, its latest status will appear here.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  note,
  icon: Icon,
  selected,
  onClick,
  isText = false,
}: {
  label: string;
  value: number | string;
  note: string;
  icon: typeof Bookmark;
  selected: boolean;
  onClick: () => void;
  isText?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-[124px] rounded-2xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:p-5 ${
        selected
          ? "border-accent bg-card shadow-card"
          : "border-card-border bg-card hover:border-accent/60"
      }`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
          {label}
        </span>
        <Icon className="h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
      </span>
      <span
        className={`mt-3 block truncate font-serif font-medium text-primary ${
          isText ? "text-lg sm:text-xl" : "text-3xl"
        }`}
      >
        {value}
      </span>
      <span className="mt-1 block truncate text-xs text-secondary">{note}</span>
    </button>
  );
}
