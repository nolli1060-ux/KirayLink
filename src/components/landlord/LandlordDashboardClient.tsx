"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Mail,
  MessageSquareText,
  Plus,
  UserRound,
} from "lucide-react";
import type { Property } from "@/types/property";
import type { Inquiry } from "@/types/inquiry";
import type { SessionUser } from "@/types/user";
import MyListings from "@/components/landlord/MyListings";
import LandlordInquiries from "@/components/landlord/LandlordInquiries";
import AddListingModal from "@/components/landlord/AddListingModal";
import ProfileEditor from "@/components/auth/ProfileEditor";

interface LandlordDashboardClientProps {
  user: SessionUser;
  myProperties: Property[];
  inquiries: Inquiry[];
}

type DashboardTab = "listings" | "inquiries" | "profile";

const navigation: {
  id: DashboardTab;
  label: string;
  icon: typeof Building2;
}[] = [
  { id: "listings", label: "My residences", icon: Building2 },
  { id: "inquiries", label: "Tenant inquiries", icon: MessageSquareText },
  { id: "profile", label: "Profile & contact", icon: UserRound },
];

export default function LandlordDashboardClient({
  user,
  myProperties,
  inquiries,
}: LandlordDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("listings");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const activeCount = myProperties.filter((property) => property.status === "available").length;
  const unavailableCount = myProperties.length - activeCount;
  const pendingInquiriesCount = inquiries.filter(
    (inquiry) => inquiry.status === "pending"
  ).length;

  const contentTitle =
    activeTab === "listings"
      ? "Your residences"
      : activeTab === "inquiries"
        ? "Tenant inquiries"
        : "Your profile";
  const contentDescription =
    activeTab === "listings"
      ? "Manage the listings associated with your account."
      : activeTab === "inquiries"
        ? "Review tenant messages and keep inquiry statuses current."
        : "Manage your account and contact information.";

  return (
    <div className="min-h-screen bg-background text-primary">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 border-b border-border pb-7 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
              <CheckCircle2 className="h-3.5 w-3.5 text-status-success" aria-hidden="true" />
              Landlord workspace
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-primary sm:text-4xl lg:text-5xl">
              Welcome back, {user.name}.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
              {user.company ? `${user.company} · ` : ""}
              Manage your residences and conversations with prospective tenants.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-button-primary px-5 text-sm font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <Plus className="h-4 w-4 text-accent" aria-hidden="true" />
            Add a residence
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <section
          aria-label="Landlord dashboard overview"
          className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4"
        >
          <SummaryCard
            label="Total properties"
            value={myProperties.length}
            note={`${activeCount} active · ${unavailableCount} unavailable`}
            icon={Building2}
            selected={activeTab === "listings"}
            onClick={() => setActiveTab("listings")}
          />
          <SummaryCard
            label="Active listings"
            value={activeCount}
            note="Available for rent"
            icon={CheckCircle2}
            selected={false}
            onClick={() => setActiveTab("listings")}
          />
          <SummaryCard
            label="Received inquiries"
            value={inquiries.length}
            note={`${pendingInquiriesCount} awaiting review`}
            icon={MessageSquareText}
            selected={activeTab === "inquiries"}
            onClick={() => setActiveTab("inquiries")}
          />
          <SummaryCard
            label="Profile & contact"
            value={user.company || user.name}
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
              Management
            </p>
            <nav
              aria-label="Landlord dashboard navigation"
              className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
            >
              {navigation.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                const count =
                  id === "listings"
                    ? myProperties.length
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
              <a
                href={`mailto:${user.email}`}
                className="inline-flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-secondary transition-colors hover:bg-surface-muted hover:text-primary"
              >
                <Mail className="h-4 w-4 text-accent-text" aria-hidden="true" />
                Contact email
              </a>
            </div>
            <div className="mt-3 hidden rounded-2xl border border-border bg-surface-muted p-4 lg:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
                Account
              </p>
              <p className="mt-2 break-all text-xs leading-5 text-primary">{user.email}</p>
              {user.company && (
                <p className="mt-1 truncate text-xs text-secondary">{user.company}</p>
              )}
            </div>
          </aside>

          <main className="min-w-0">
            <section className="mb-6 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-accent-text">
                  Landlord desk
                </p>
                <h2 className="mt-1 font-serif text-2xl font-medium text-primary sm:text-3xl">
                  {contentTitle}
                </h2>
                <p className="mt-1 text-sm text-secondary">{contentDescription}</p>
              </div>
              {activeTab === "listings" && myProperties.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex min-h-9 w-fit items-center gap-1.5 text-xs font-semibold text-accent-text transition-colors hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add listing
                </button>
              )}
            </section>

            {activeTab === "listings" ? (
              <MyListings
                key={JSON.stringify(myProperties)}
                initialProperties={myProperties}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            ) : activeTab === "inquiries" ? (
              <LandlordInquiries
                key={inquiries.map(({ id, status }) => `${id}:${status}`).join("|")}
                initialInquiries={inquiries}
              />
            ) : (
              <ProfileEditor user={user} />
            )}
          </main>
        </div>
      </div>

      <AddListingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
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
  icon: typeof Building2;
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
