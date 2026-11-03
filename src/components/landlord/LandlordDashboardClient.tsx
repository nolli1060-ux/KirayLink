"use client";

import { useState } from "react";
import {
  Building2,
  MessageSquare,
  ShieldCheck,
  User,
  PlusCircle,
} from "lucide-react";
import type { Property } from "@/types/property";
import type { Inquiry } from "@/types/inquiry";
import type { SessionUser } from "@/types/user";
import Badge from "@/components/ui/Badge";
import MyListings from "@/components/landlord/MyListings";
import LandlordInquiries from "@/components/landlord/LandlordInquiries";
import AddListingModal from "@/components/landlord/AddListingModal";
import ProfileEditor from "@/components/auth/ProfileEditor";

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
  const [activeTab, setActiveTab] = useState<"listings" | "inquiries" | "profile">("listings");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const activeCount = myProperties.filter((p) => p.status === "available").length;
  const unavailableCount = myProperties.filter((p) => p.status !== "available").length;
  const pendingInquiriesCount = inquiries.filter((i) => i.status === "pending").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header and Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE8DE]">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="navy" className="rounded-full px-3 py-1 font-medium">
              Landlord Desk
            </Badge>
            <span className="text-xs text-[#77766F]">Verified Property Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#242622] tracking-tight mt-2">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-[#77766F] mt-1">
            {user.company ? `${user.company} · ` : ""}
            Manage your residences, edit listings, and respond to tenant inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#C6A56B] px-5 py-2.5 text-xs font-semibold text-[#123B32] hover:bg-[#d4b57e] transition-colors shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#123B32]" aria-hidden="true" />
            <span>Add New Residence</span>
          </button>
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-[#174A3D] bg-[#EAF3F0] border border-[#174A3D]/20 px-3.5 py-2 rounded-full">
            <ShieldCheck className="w-4 h-4 text-[#174A3D]" aria-hidden="true" />
            <span>Server Verified</span>
          </div>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab("listings")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "listings"
              ? "bg-white border-[#C6A56B] shadow-[0_12px_32px_-12px_rgba(198,165,107,0.25)] ring-1 ring-[#C6A56B]/30"
              : "bg-white border-[#EDE8DE] hover:border-[#C6A56B]/40 shadow-[0_4px_20px_-8px_rgba(18,59,50,0.06)]"
          }`}
        >
          <div className="flex items-center justify-between text-[#C6A56B] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Properties
            </span>
            <Building2 className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#242622]">
            {myProperties.length}
          </div>
          <p className="text-[11px] text-[#77766F] mt-1">
            {activeCount} active · {unavailableCount} unavailable
          </p>
        </div>

        <div
          onClick={() => setActiveTab("listings")}
          className="p-5 rounded-2xl border border-[#EDE8DE] bg-white transition-all cursor-pointer hover:border-[#C6A56B]/40 shadow-[0_4px_20px_-8px_rgba(18,59,50,0.06)]"
        >
          <div className="flex items-center justify-between text-[#174A3D] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Active Listings
            </span>
            <ShieldCheck className="w-4 h-4 text-[#174A3D]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#242622]">
            {activeCount}
          </div>
          <p className="text-[11px] text-[#77766F] mt-1">
            Visible on public listings
          </p>
        </div>

        <div
          onClick={() => setActiveTab("inquiries")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "inquiries"
              ? "bg-white border-[#C6A56B] shadow-[0_12px_32px_-12px_rgba(198,165,107,0.25)] ring-1 ring-[#C6A56B]/30"
              : "bg-white border-[#EDE8DE] hover:border-[#C6A56B]/40 shadow-[0_4px_20px_-8px_rgba(18,59,50,0.06)]"
          }`}
        >
          <div className="flex items-center justify-between text-[#C6A56B] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Received Inquiries
            </span>
            <MessageSquare className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#242622]">
            {inquiries.length}
          </div>
          <p className="text-[11px] text-[#77766F] mt-1">
            {pendingInquiriesCount} awaiting review
          </p>
        </div>

        <div
          onClick={() => setActiveTab("profile")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-white border-[#C6A56B] shadow-[0_12px_32px_-12px_rgba(198,165,107,0.25)] ring-1 ring-[#C6A56B]/30"
              : "bg-white border-[#EDE8DE] hover:border-[#C6A56B]/40 shadow-[0_4px_20px_-8px_rgba(18,59,50,0.06)]"
          }`}
        >
          <div className="flex items-center justify-between text-[#123B32] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Profile & Agency
            </span>
            <User className="w-4 h-4 text-[#123B32]" aria-hidden="true" />
          </div>
          <div className="text-sm font-semibold text-[#242622] truncate mt-1">
            {user.company || user.name}
          </div>
          <p className="text-[11px] text-[#77766F] mt-1">
            {user.phone || "No phone added"}
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-[#EDE8DE]">
        <nav className="flex space-x-6" aria-label="Landlord Dashboard Tabs">
          <button
            type="button"
            onClick={() => setActiveTab("listings")}
            className={`py-3 px-1 border-b-2 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "listings"
                ? "border-[#123B32] text-[#123B32]"
                : "border-transparent text-[#77766F] hover:text-[#123B32]"
            }`}
          >
            <Building2 className="w-4 h-4" aria-hidden="true" />
            <span>My Properties</span>
            <span className="text-[10px] bg-[#F8F6F0] border border-[#EDE8DE] px-2 py-0.5 rounded-full text-[#242622]">
              {myProperties.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inquiries")}
            className={`py-3 px-1 border-b-2 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "inquiries"
                ? "border-[#123B32] text-[#123B32]"
                : "border-transparent text-[#77766F] hover:text-[#123B32]"
            }`}
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            <span>Tenant Inquiries</span>
            <span className="text-[10px] bg-[#F8F6F0] border border-[#EDE8DE] px-2 py-0.5 rounded-full text-[#242622]">
              {inquiries.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`py-3 px-1 border-b-2 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "profile"
                ? "border-[#123B32] text-[#123B32]"
                : "border-transparent text-[#77766F] hover:text-[#123B32]"
            }`}
          >
            <User className="w-4 h-4" aria-hidden="true" />
            <span>Profile & Contact</span>
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
        ) : activeTab === "inquiries" ? (
          <LandlordInquiries initialInquiries={inquiries} />
        ) : (
          <ProfileEditor user={user} />
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
