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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E0D5]">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="navy">Landlord Portfolio Workspace</Badge>
            <span className="text-xs text-[#5B677A]">Verified Property Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-2">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-[#5B677A] mt-1">
            {user.company ? `${user.company} · ` : ""}
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
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#1B6348] bg-[#EDF7F2] border border-[#1B6348]/20 px-3 py-2 rounded">
            <ShieldCheck className="w-4 h-4 text-[#1B6348]" aria-hidden="true" />
            <span>Server Verified</span>
          </div>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab("listings")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === "listings"
              ? "bg-white border-[#C5A880] shadow-sm"
              : "bg-[#FDFBF7] border-[#E6E0D5] hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-[#8C6E43] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Owned Residences
            </span>
            <Building2 className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">
            {myProperties.length}
          </div>
          <p className="text-[11px] text-[#5B677A] mt-1">
            {activeCount} active · {myProperties.length - activeCount} leased/pending
          </p>
        </div>

        <div
          onClick={() => setActiveTab("inquiries")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === "inquiries"
              ? "bg-white border-[#C5A880] shadow-sm"
              : "bg-[#FDFBF7] border-[#E6E0D5] hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-[#8C6E43] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Tenant Inquiries
            </span>
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">
            {inquiries.length}
          </div>
          <p className="text-[11px] text-[#5B677A] mt-1">
            {pendingInquiriesCount} awaiting your response
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-[#E6E0D5] bg-[#FDFBF7] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6E43]">
              Listing Reach
            </span>
            <p className="text-xs text-[#5B677A] mt-1">
              Your listings are surfaced to verified embassy and corporate clientele.
            </p>
          </div>
          <Link
            href="/listings"
            className="text-xs font-bold text-[#0F172A] hover:text-[#8C6E43] inline-flex items-center gap-1 mt-2"
          >
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>View Public Platform Listings</span>
          </Link>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-[#E6E0D5]">
        <nav className="flex space-x-6" aria-label="Landlord Dashboard Tabs">
          <button
            type="button"
            onClick={() => setActiveTab("listings")}
            className={`py-3 px-1 border-b-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "listings"
                ? "border-[#0F172A] text-[#0F172A]"
                : "border-transparent text-[#5B677A] hover:text-[#0F172A]"
            }`}
          >
            <Building2 className="w-4 h-4" aria-hidden="true" />
            <span>My Listed Residences</span>
            <span className="text-[10px] bg-[#F7F3EC] px-2 py-0.5 rounded-full text-[#0F172A]">
              {myProperties.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inquiries")}
            className={`py-3 px-1 border-b-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "inquiries"
                ? "border-[#0F172A] text-[#0F172A]"
                : "border-transparent text-[#5B677A] hover:text-[#0F172A]"
            }`}
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            <span>Tenant Inquiries</span>
            <span className="text-[10px] bg-[#F7F3EC] px-2 py-0.5 rounded-full text-[#0F172A]">
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
