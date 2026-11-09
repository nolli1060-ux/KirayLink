"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Filter,
  LayoutDashboard,
  Loader2,
  MessageSquareText,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { Property, PropertyStatus } from "@/types/property";
import type { InquiryStatus } from "@/types/inquiry";
import {
  adminUpdatePropertyStatusAction,
  adminDeletePropertyAction,
  updateInquiryStatusAction,
} from "@/lib/dashboard-actions";
import { formatPrice, getSafeImageUrl } from "@/lib/utils";

interface AdminStats {
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  rentedProperties: number;
  totalInquiries: number;
  pendingInquiries: number;
  totalUsers: number;
  tenantCount: number;
  landlordCount: number;
  adminCount: number;
}

interface AdminInquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

type AdminProperty = Pick<
  Property,
  | "id"
  | "title"
  | "propertyType"
  | "neighborhood"
  | "city"
  | "price"
  | "imageUrl"
  | "status"
  | "createdAt"
> & {
  landlord: Pick<Property["landlord"], "name" | "company">;
};

interface ListingManagementProps {
  administratorName: string;
  initialProperties: AdminProperty[];
  inquiries: AdminInquiry[];
  stats: AdminStats;
}

type AdminTab = "overview" | "properties" | "inquiries" | "users" | "reports" | "activity";

type ConfirmAction =
  | { kind: "status"; propertyId: string; title: string; status: PropertyStatus }
  | { kind: "delete"; propertyId: string; title: string };

const navigation: {
  id: AdminTab;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "properties", label: "Property moderation", icon: Building2 },
  { id: "inquiries", label: "Inquiries", icon: MessageSquareText },
  { id: "users", label: "User overview", icon: Users },
  { id: "reports", label: "Reports", icon: ClipboardList },
  { id: "activity", label: "Platform activity", icon: Activity },
];

const propertyStatusLabels: Record<PropertyStatus, string> = {
  available: "Available",
  pending: "Pending",
  rented: "Rented",
};

const inquiryStatusLabels: Record<InquiryStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  responded: "Responded",
};

export default function ListingManagement({
  administratorName,
  initialProperties,
  inquiries: initialInquiries,
  stats,
}: ListingManagementProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [properties, setProperties] = useState(initialProperties);
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const activeCount = properties.filter((property) => property.status === "available").length;
  const pendingCount = properties.filter((property) => property.status === "pending").length;
  const rentedCount = properties.filter((property) => property.status === "rented").length;

  const filteredProperties = properties.filter((property) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      property.title.toLowerCase().includes(query) ||
      property.neighborhood.toLowerCase().includes(query) ||
      property.landlord.name.toLowerCase().includes(query);
    return matchesSearch && (statusFilter === "all" || property.status === statusFilter);
  });

  const activityItems = [
    ...properties.map((property) => ({
      id: `property:${property.id}`,
      kind: "Property listing",
      title: property.title,
      detail: `${property.propertyType} · ${property.neighborhood}, ${property.city}`,
      createdAt: property.createdAt,
      icon: Building2,
    })),
    ...inquiries.map((inquiry) => ({
      id: `inquiry:${inquiry.id}`,
      kind: "Tenant inquiry",
      title: inquiry.propertyTitle,
      detail: "A new inquiry was submitted for this residence.",
      createdAt: inquiry.createdAt,
      icon: MessageSquareText,
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  const currentTitle = navigation.find((item) => item.id === activeTab)?.label ?? "Overview";
  const currentDescription: Record<AdminTab, string> = {
    overview: "A clear view of current platform records and moderation workload.",
    properties: "Review listings and manage their existing availability status.",
    inquiries: "Review inquiry content and update its existing workflow status.",
    users: "Role totals from registered accounts; account-level actions are not available.",
    reports: "Reports are not currently stored or supported by the platform.",
    activity: "Recent property and inquiry submissions derived from existing records.",
  };

  const requestConfirmation = (action: ConfirmAction) => {
    setActionFeedback(null);
    setConfirmAction(action);
  };

  const confirmPropertyAction = async () => {
    if (!confirmAction) return;
    const action = confirmAction;
    setBusyId(action.propertyId);
    setActionFeedback(null);
    setConfirmAction(null);
    try {
      if (action.kind === "status") {
        const result = await adminUpdatePropertyStatusAction(
          action.propertyId,
          action.status
        );
        if (!result.success) {
          setActionFeedback({
            type: "error",
            message: result.error || "Could not update this listing.",
          });
          return;
        }
        setProperties((previous) =>
          previous.map((property) =>
            property.id === action.propertyId
              ? { ...property, status: action.status }
              : property
          )
        );
        setActionFeedback({
          type: "success",
          message: `“${action.title}” is now ${propertyStatusLabels[action.status].toLowerCase()}.`,
        });
      } else {
        const result = await adminDeletePropertyAction(action.propertyId);
        if (!result.success) {
          setActionFeedback({
            type: "error",
            message: result.error || "Could not remove this listing.",
          });
          return;
        }
        setProperties((previous) =>
          previous.filter((property) => property.id !== action.propertyId)
        );
        setActionFeedback({
          type: "success",
          message: `“${action.title}” was removed from active platform listings.`,
        });
      }
    } catch {
      setActionFeedback({
        type: "error",
        message: "An unexpected error occurred while processing the listing action.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const updateInquiryStatus = async (id: string, status: InquiryStatus) => {
    setBusyId(id);
    setActionFeedback(null);
    try {
      const result = await updateInquiryStatusAction(id, status);
      if (!result.success) {
        setActionFeedback({
          type: "error",
          message: result.error || "Could not update this inquiry.",
        });
        return;
      }
      setInquiries((previous) =>
        previous.map((inquiry) =>
          inquiry.id === id ? { ...inquiry, status } : inquiry
        )
      );
      setActionFeedback({
        type: "success",
        message: `Inquiry status updated to ${inquiryStatusLabels[status].toLowerCase()}.`,
      });
    } catch {
      setActionFeedback({
        type: "error",
        message: "An unexpected error occurred while updating the inquiry.",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 border-b border-border pb-7 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
              <ShieldCheck className="h-3.5 w-3.5 text-status-success" aria-hidden="true" />
              Administrator workspace
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-primary sm:text-4xl lg:text-5xl">
              Platform overview.
            </h1>
            <p className="mt-2 text-sm text-secondary">
              Signed in as {administratorName} · Administrator permissions verified on the server
            </p>
          </div>
          <div className="inline-flex min-h-10 items-center gap-2 self-start rounded-full border border-status-success/30 bg-status-success-bg px-4 text-xs font-semibold text-status-success sm:self-auto">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Secure admin session
          </div>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-8">
          <aside className="rounded-3xl border border-card-border bg-card p-3 shadow-card lg:sticky lg:top-24">
            <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-secondary">
              Administration
            </p>
            <nav
              aria-label="Administrator navigation"
              className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
            >
              {navigation.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                const count =
                  id === "properties"
                    ? properties.length
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
            <div className="mt-3 hidden border-t border-border px-3 pt-3 text-xs leading-5 text-secondary lg:block">
              Sensitive account contact details are not shown in this workspace.
            </div>
          </aside>

          <main className="min-w-0">
            <section className="mb-6 border-b border-border pb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-accent-text">
                Platform governance
              </p>
              <h2 className="mt-1 font-serif text-2xl font-medium text-primary sm:text-3xl">
                {currentTitle}
              </h2>
              <p className="mt-1 text-sm text-secondary">{currentDescription[activeTab]}</p>
            </section>

            {actionFeedback && (
              <div
                role={actionFeedback.type === "error" ? "alert" : "status"}
                className={`mb-5 flex items-start justify-between gap-3 rounded-xl border p-3.5 text-sm ${
                  actionFeedback.type === "success"
                    ? "border-status-success/30 bg-status-success-bg text-status-success"
                    : "border-status-danger/30 bg-status-danger-bg text-status-danger"
                }`}
              >
                <span className="inline-flex items-start gap-2">
                  {actionFeedback.type === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  {actionFeedback.message}
                </span>
                <button
                  type="button"
                  onClick={() => setActionFeedback(null)}
                  aria-label="Dismiss message"
                  className="rounded p-1 transition-colors hover:bg-black/5"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}

            {activeTab === "overview" && (
              <OverviewPanel
                properties={properties}
                inquiries={inquiries}
                stats={stats}
                activeCount={activeCount}
                pendingCount={pendingCount}
                rentedCount={rentedCount}
                activityItems={activityItems.slice(0, 5)}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === "properties" && (
              <PropertyModeration
                properties={filteredProperties}
                totalCount={properties.length}
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                busyId={busyId}
                onSearchChange={setSearchQuery}
                onStatusFilterChange={setStatusFilter}
                onRequestConfirmation={requestConfirmation}
              />
            )}

            {activeTab === "inquiries" && (
              <InquiryManagement
                inquiries={inquiries}
                busyId={busyId}
                onUpdateStatus={updateInquiryStatus}
              />
            )}

            {activeTab === "users" && <UserOverview stats={stats} />}

            {activeTab === "reports" && (
              <UnavailablePanel
                title="Property reports are not available"
                detail="The current application has no report-submission flow or persisted report records. No moderation queue can be shown until those backend capabilities exist."
              />
            )}

            {activeTab === "activity" && (
              <ActivityPanel items={activityItems} />
            )}
          </main>
        </div>
      </div>

      {confirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmAction(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            aria-describedby="admin-confirm-description"
            className="w-full max-w-md rounded-3xl border border-card-border bg-card p-6 shadow-popover sm:p-7"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full ${
                confirmAction.kind === "delete"
                  ? "bg-status-danger-bg text-status-danger"
                  : "bg-accent-soft text-accent-text"
              }`}
            >
              {confirmAction.kind === "delete" ? (
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <h2 id="admin-confirm-title" className="mt-4 font-serif text-2xl font-medium text-primary">
              {confirmAction.kind === "delete" ? "Remove this listing?" : "Change listing status?"}
            </h2>
            <p id="admin-confirm-description" className="mt-2 text-sm leading-6 text-secondary">
              {confirmAction.kind === "delete"
                ? `“${confirmAction.title}” will be removed from active platform listings.`
                : `“${confirmAction.title}” will be marked ${propertyStatusLabels[confirmAction.status].toLowerCase()}.`}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="min-h-10 rounded-full border border-border px-4 text-sm font-semibold text-primary transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPropertyAction}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                  confirmAction.kind === "delete"
                    ? "bg-status-danger hover:opacity-90"
                    : "bg-button-primary text-button-primary-text hover:bg-button-primary-hover"
                }`}
              >
                {confirmAction.kind === "delete" ? "Remove listing" : "Confirm status"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function OverviewPanel({
  properties,
  inquiries,
  stats,
  activeCount,
  pendingCount,
  rentedCount,
  activityItems,
  onNavigate,
}: {
  properties: AdminProperty[];
  inquiries: AdminInquiry[];
  stats: AdminStats;
  activeCount: number;
  pendingCount: number;
  rentedCount: number;
  activityItems: Array<{
    id: string;
    kind: string;
    title: string;
    detail: string;
    createdAt: string;
    icon: typeof Building2;
  }>;
  onNavigate: (tab: AdminTab) => void;
}) {
  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active listings"
          value={activeCount}
          detail={`${pendingCount} pending · ${rentedCount} rented`}
          icon={Building2}
          onClick={() => onNavigate("properties")}
        />
        <MetricCard
          label="Total properties"
          value={properties.length}
          detail="Current non-deleted listings"
          icon={ShieldCheck}
          onClick={() => onNavigate("properties")}
        />
        <MetricCard
          label="Tenant inquiries"
          value={inquiries.length}
          detail={`${inquiries.filter((inquiry) => inquiry.status === "pending").length} pending review`}
          icon={MessageSquareText}
          onClick={() => onNavigate("inquiries")}
        />
        <MetricCard
          label="Registered users"
          value={stats.totalUsers}
          detail={`${stats.tenantCount} tenants · ${stats.landlordCount} landlords`}
          icon={Users}
          onClick={() => onNavigate("users")}
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <section className="rounded-2xl border border-card-border bg-card p-5 shadow-card sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-medium text-primary">Listing status</h3>
              <p className="mt-1 text-xs text-secondary">Current inventory distribution</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("properties")}
              className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-accent-text hover:text-primary"
            >
              Review listings <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 space-y-5">
            <StatusBar
              label="Available"
              value={activeCount}
              total={properties.length}
              color="bg-status-success"
            />
            <StatusBar
              label="Pending"
              value={pendingCount}
              total={properties.length}
              color="bg-accent"
            />
            <StatusBar
              label="Rented"
              value={rentedCount}
              total={properties.length}
              color="bg-secondary"
            />
          </div>
          <p className="mt-5 border-t border-border pt-4 text-[11px] leading-5 text-secondary">
            These are the platform’s existing availability statuses, not a separate approval or rejection workflow.
          </p>
        </section>

        <section className="rounded-2xl border border-card-border bg-card p-5 shadow-card sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-medium text-primary">Recent submissions</h3>
              <p className="mt-1 text-xs text-secondary">Latest listings and inquiries on record</p>
            </div>
            <Clock3 className="mt-1 h-4 w-4 text-accent-text" aria-hidden="true" />
          </div>
          {activityItems.length ? (
            <div className="mt-4 divide-y divide-border">
              {activityItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">
                        {item.kind}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-medium text-primary">{item.title}</p>
                      <p className="truncate text-xs text-secondary">{item.detail}</p>
                    </div>
                    <time className="shrink-0 pt-1 text-[10px] text-secondary">
                      {formatDate(item.createdAt)}
                    </time>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-secondary">No submissions are available yet.</p>
          )}
          <p className="mt-4 border-t border-border pt-3 text-[11px] leading-5 text-secondary">
            Submission history only. The platform does not currently keep an audit log of administrative changes.
          </p>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  onClick,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Building2;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[126px] rounded-2xl border border-card-border bg-card p-4 text-left shadow-card transition-colors hover:border-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:p-5"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">{label}</span>
        <Icon className="h-4 w-4 text-accent-text" aria-hidden="true" />
      </span>
      <span className="mt-3 block font-serif text-3xl font-medium text-primary">{value}</span>
      <span className="mt-1 block truncate text-xs text-secondary">{detail}</span>
    </button>
  );
}

function StatusBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-primary">{label}</span>
        <span className="text-secondary">{value} <span className="text-muted">({percentage}%)</span></span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-label={`${label} listings`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
      >
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function PropertyModeration({
  properties,
  totalCount,
  searchQuery,
  statusFilter,
  busyId,
  onSearchChange,
  onStatusFilterChange,
  onRequestConfirmation,
}: {
  properties: AdminProperty[];
  totalCount: number;
  searchQuery: string;
  statusFilter: PropertyStatus | "all";
  busyId: string | null;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (status: PropertyStatus | "all") => void;
  onRequestConfirmation: (action: ConfirmAction) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-card">
      <div className="flex flex-col gap-3 border-b border-border bg-surface-muted p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <h3 className="font-serif text-xl font-medium text-primary">Property moderation</h3>
          <p className="mt-1 text-xs leading-5 text-secondary">
            Manage the current availability status or remove active listings.
          </p>
        </div>
        <p className="text-xs text-secondary">
          <span className="font-semibold text-primary">{totalCount}</span> listings
        </p>
      </div>

      <div className="flex flex-col gap-3 border-b border-border p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block min-w-0 flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" aria-hidden="true" />
          <span className="sr-only">Search listings</span>
          <input
            type="search"
            placeholder="Search title, neighborhood, or landlord name"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="min-h-10 w-full rounded-full border border-input-border bg-input pl-10 pr-4 text-sm text-primary placeholder:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          />
        </label>
        <div className="flex gap-1.5 overflow-x-auto" aria-label="Filter by listing status">
          {(["all", "available", "pending", "rented"] as const).map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={statusFilter === status}
              onClick={() => onStatusFilterChange(status)}
              className={`min-h-9 shrink-0 rounded-full border px-3.5 text-xs font-semibold capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                statusFilter === status
                  ? "border-strong-surface bg-strong-surface text-on-strong-surface"
                  : "border-border bg-surface text-secondary hover:text-primary"
              }`}
            >
              {status === "all" ? "All statuses" : propertyStatusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      <p className="border-b border-border px-4 py-2 text-[11px] text-secondary sm:px-5">
        Status changes use the existing availability values; no approval or rejection queue is configured.
      </p>

      {properties.length === 0 ? (
        <div className="px-4 py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-text">
            <Filter className="h-5 w-5" aria-hidden="true" />
          </span>
          <h4 className="mt-4 font-serif text-lg font-medium text-primary">No matching listings</h4>
          <p className="mt-1 text-sm text-secondary">Try another search or clear the filters.</p>
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              onStatusFilterChange("all");
            }}
            className="mt-4 min-h-9 rounded-full border border-border px-4 text-xs font-semibold text-primary hover:bg-surface-muted"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
                <th scope="col" className="px-4 py-3.5 sm:px-5">Property</th>
                <th scope="col" className="px-4 py-3.5">Landlord</th>
                <th scope="col" className="px-4 py-3.5">Monthly rent</th>
                <th scope="col" className="px-4 py-3.5">Status</th>
                <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {properties.map((property) => {
                const isBusy = busyId === property.id;
                return (
                  <tr key={property.id} className="transition-colors hover:bg-surface-muted/60">
                    <td className="px-4 py-4 sm:px-5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
                          <Image
                            src={getSafeImageUrl(property.imageUrl)}
                            alt={property.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/properties/${property.id}`}
                            className="group inline-flex max-w-[240px] items-center gap-1 truncate text-sm font-medium text-primary hover:text-accent-text"
                          >
                            <span className="truncate">{property.title}</span>
                            <ArrowUpRight className="h-3 w-3 shrink-0 opacity-60" aria-hidden="true" />
                          </Link>
                          <p className="mt-0.5 max-w-[240px] truncate text-xs text-secondary">
                            {property.propertyType} · {property.neighborhood}, {property.city}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="block max-w-[160px] truncate text-sm font-medium text-primary">
                        {property.landlord.name}
                      </span>
                      {property.landlord.company && (
                        <span className="mt-0.5 block max-w-[160px] truncate text-xs text-secondary">
                          {property.landlord.company}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-primary">
                      {formatPrice(property.price)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill status={property.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <label className="sr-only" htmlFor={`status-${property.id}`}>Change listing status</label>
                        <select
                          id={`status-${property.id}`}
                          value={property.status}
                          disabled={busyId !== null}
                          onChange={(event) => {
                            const status = event.target.value as PropertyStatus;
                            if (status !== property.status) {
                              onRequestConfirmation({
                                kind: "status",
                                propertyId: property.id,
                                title: property.title,
                                status,
                              });
                            }
                          }}
                          className="min-h-9 rounded-lg border border-input-border bg-input px-2.5 text-xs text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60"
                        >
                          {Object.entries(propertyStatusLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() =>
                            onRequestConfirmation({
                              kind: "delete",
                              propertyId: property.id,
                              title: property.title,
                            })
                          }
                          aria-label={`Remove ${property.title} from listings`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-status-danger/25 text-status-danger transition-colors hover:bg-status-danger-bg disabled:opacity-50"
                        >
                          {isBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function InquiryManagement({
  inquiries,
  busyId,
  onUpdateStatus,
}: {
  inquiries: AdminInquiry[];
  busyId: string | null;
  onUpdateStatus: (id: string, status: InquiryStatus) => void;
}) {
  if (inquiries.length === 0) {
    return <EmptyPanel title="No inquiries on record" detail="Submitted tenant inquiries will appear here." />;
  }
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-xs leading-5 text-secondary">
        Tenant email, phone, and account identifiers are intentionally omitted from the administrator view.
      </div>
      {inquiries.map((inquiry) => {
        const isBusy = busyId === inquiry.id;
        return (
          <article key={inquiry.id} className="rounded-2xl border border-card-border bg-card p-4 shadow-card sm:p-5">
            <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
                  Inquiry · {formatDate(inquiry.createdAt)}
                </p>
                <h3 className="mt-1 font-serif text-lg font-medium text-primary">
                  {inquiry.propertyTitle}
                </h3>
                <Link
                  href={`/properties/${inquiry.propertyId}`}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-accent-text hover:text-primary"
                >
                  View property
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
              <StatusPill status={inquiry.status} />
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-primary">
              {inquiry.message}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
              {(["pending", "reviewed", "responded"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={isBusy || inquiry.status === status}
                  onClick={() => onUpdateStatus(inquiry.id, status)}
                  className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    inquiry.status === status
                      ? "border-accent/50 bg-accent-soft text-accent-text"
                      : "border-border bg-surface text-secondary hover:text-primary"
                  }`}
                >
                  {isBusy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : inquiry.status === status ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : null}
                  Mark {inquiryStatusLabels[status].toLowerCase()}
                </button>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function UserOverview({ stats }: { stats: AdminStats }) {
  const roles = [
    { label: "Tenants", count: stats.tenantCount, detail: "Rental seekers" },
    { label: "Landlords", count: stats.landlordCount, detail: "Property providers" },
    { label: "Administrators", count: stats.adminCount, detail: "Platform admins" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <div key={role.label} className="rounded-2xl border border-card-border bg-card p-5 shadow-card">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">{role.label}</p>
            <p className="mt-3 font-serif text-3xl font-medium text-primary">{role.count}</p>
            <p className="mt-1 text-xs text-secondary">{role.detail}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-surface-muted p-4 text-sm leading-6 text-secondary sm:p-5">
        <strong className="font-semibold text-primary">{stats.totalUsers}</strong> registered accounts.
        The current backend exposes role totals only; individual user records, role changes,
        suspension, and account deletion are not available here.
      </div>
    </div>
  );
}

function ActivityPanel({
  items,
}: {
  items: Array<{
    id: string;
    kind: string;
    title: string;
    detail: string;
    createdAt: string;
    icon: typeof Building2;
  }>;
}) {
  if (!items.length) {
    return <EmptyPanel title="No recent submissions" detail="New listings and inquiries will appear here when available." />;
  }
  return (
    <section className="rounded-2xl border border-card-border bg-card p-4 shadow-card sm:p-6">
      <div className="divide-y divide-border">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">{item.kind}</p>
                  <time className="text-[10px] text-secondary">{formatDate(item.createdAt)}</time>
                </div>
                <p className="mt-1 truncate text-sm font-medium text-primary">{item.title}</p>
                <p className="mt-0.5 text-xs text-secondary">{item.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-5 text-secondary">
        This timeline is derived from existing property and inquiry creation dates. Administrative status changes and deletions are not recorded as events.
      </p>
    </section>
  );
}

function UnavailablePanel({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center shadow-card sm:px-8">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-secondary">
        <ClipboardList className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-serif text-xl font-medium text-primary">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-secondary">{detail}</p>
    </div>
  );
}

function EmptyPanel({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center shadow-card">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-text">
        <MessageSquareText className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-serif text-xl font-medium text-primary">{title}</h3>
      <p className="mt-2 text-sm text-secondary">{detail}</p>
    </div>
  );
}

function StatusPill({ status }: { status: PropertyStatus | InquiryStatus }) {
  const style =
    status === "available" || status === "responded"
      ? "bg-status-success-bg text-status-success"
      : status === "pending"
        ? "bg-accent-soft text-accent-text"
        : "bg-surface-muted text-secondary";
  const label =
    status in propertyStatusLabels
      ? propertyStatusLabels[status as PropertyStatus]
      : inquiryStatusLabels[status as InquiryStatus];
  return (
    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${style}`}>
      {label}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
