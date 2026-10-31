"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MessageSquare,
  Plus,
  ShieldCheck,
  Compass,
} from "lucide-react";
import type { Property } from "@/types/property";
import type { Inquiry } from "@/types/inquiry";
import type { SessionUser } from "@/types/user";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import MyListings from "@/components/landlord/MyListings";
import LandlordInquiries from "@/components/landlord/LandlordInquiries";
import AddListingModal from "@/components/landlord/AddListingModal";

interface LandlordDashboardClientProps {
  user: SessionUser;
  myProperties: Property[];
  inquiries: Inquiry[];
}

export default function LandlordDashboardClient({
  user,
  myProperties,
  inquiries,
}: LandlordDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"listings" | "inquiries">("listings");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const activeCount = myProperties.filter((p) => p.status === "available").length;
  const pendingInquiriesCount = inquiries.filter((i) => i.status === "pending").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header and Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="navy">Landlord Portfolio Workspace</Badge>
            <span className="text-xs text-muted">Verified Property Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-main mt-2">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-muted mt-1">
            {user.company ? `${user.company} Ã‚Â· ` : ""}
            Manage your listings, update availability, and review tenant inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Add New Residence
          </Button>
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-success bg-success-bg border border-[#1B6348]/20 px-3 py-2 rounded">
            <ShieldCheck className="w-4 h-4 text-success" aria-hidden="true" />
            <span>Server Verified</span>
          </div>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab("listings")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setActiveTab("listings");
            }
          }}
          role="button"
          tabIndex={0}
          aria-pressed={activeTab === "listings"}
          className={`p-4 rounded-xl border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6E43] hover:-translate-y-0.5 hover:shadow-md ${
            activeTab === "listings"
              ? "bg-surface border-[#C5A880] shadow-sm"
              : "bg-ivory border-border hover:border-border"
          }`}
        >
          <div className="flex items-center justify-between text-gold-strong mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Owned Residences
            </span>
            <Building2 className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-main">
            {myProperties.length}
          </div>
          <p className="text-[11px] text-muted mt-1">
            {activeCount} active Ã‚Â· {myProperties.length - activeCount} leased/pending
          </p>
        </div>

        <div
          onClick={() => setActiveTab("inquiries")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setActiveTab("inquiries");
            }
          }}
          role="button"
          tabIndex={0}
          aria-pressed={activeTab === "inquiries"}
          className={`p-4 rounded-xl border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6E43] hover:-translate-y-0.5 hover:shadow-md ${
            activeTab === "inquiries"
              ? "bg-surface border-[#C5A880] shadow-sm"
              : "bg-ivory border-border hover:border-border"
          }`}
        >
          <div className="flex items-center justify-between text-gold-strong mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Tenant Inquiries
            </span>
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-main">
            {inquiries.length}
          </div>
          <p className="text-[11px] text-muted mt-1">
            {pendingInquiriesCount} awaiting your response
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-border bg-ivory flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-strong">
              Listing Reach
            </span>
            <p className="text-xs text-muted mt-1">
              Your listings are surfaced to verified embassy and corporate clientele.
            </p>
          </div>
          <Link
            href="/listings"
            className="text-xs font-bold text-main hover:text-gold-strong inline-flex items-center gap-1 mt-2"
          >
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>View Public Platform Listings</span>
          </Link>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-6" aria-label="Landlord Dashboard Tabs">
          <button
            type="button"
            onClick={() => setActiveTab("listings")}
            className={`py-3 px-1 border-b-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "listings"
                ? "border-[#0F172A] text-main"
                : "border-transparent text-muted hover:text-main"
            }`}
          >
            <Building2 className="w-4 h-4" aria-hidden="true" />
            <span>My Listed Residences</span>
            <span className="text-[10px] bg-gold-light px-2 py-0.5 rounded-full text-main">
              {myProperties.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inquiries")}
            className={`py-3 px-1 border-b-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "inquiries"
                ? "border-[#0F172A] text-main"
                : "border-transparent text-muted hover:text-main"
            }`}
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            <span>Tenant Inquiries</span>
            <span className="text-[10px] bg-gold-light px-2 py-0.5 rounded-full text-main">
              {inquiries.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "listings" ? (
          <MyListings
            initialProperties={myProperties}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        ) : (
          <LandlordInquiries initialInquiries={inquiries} />
        )}
      </div>

      {/* Add Listing Modal */}
      <AddListingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
