"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  MessageSquare,
  Compass,
  ShieldCheck,
  User,
} from "lucide-react";
import type { Property } from "@/types/property";
import type { Inquiry } from "@/types/inquiry";
import type { SessionUser } from "@/types/user";
import Badge from "@/components/ui/Badge";
import SavedProperties from "@/components/tenant/SavedProperties";
import TenantInquiries from "@/components/tenant/TenantInquiries";
import ProfileEditor from "@/components/auth/ProfileEditor";

interface TenantDashboardClientProps {
  user: SessionUser;
  savedProperties: Property[];
  inquiries: Inquiry[];
}

export default function TenantDashboardClient({
  user,
  savedProperties,
  inquiries,
}: TenantDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"saved" | "inquiries" | "profile">("saved");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header and Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE8DE]">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="navy" className="rounded-full px-3 py-1 font-medium">
              Tenant Workspace
            </Badge>
            <span className="text-xs text-[#77766F]">Verified Tenant Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#242622] tracking-tight mt-2">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-[#77766F] mt-1">
            Manage your saved residences, review rental inquiries, and arrange viewings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 rounded-full bg-[#C6A56B] px-5 py-2.5 text-xs font-semibold text-[#123B32] hover:bg-[#d4b57e] transition-colors shadow-xs"
          >
            <Compass className="w-4 h-4 text-[#123B32]" aria-hidden="true" />
            <span>Browse Residences</span>
          </Link>
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-[#174A3D] bg-[#EAF3F0] border border-[#174A3D]/20 px-3.5 py-2 rounded-full">
            <ShieldCheck className="w-4 h-4 text-[#174A3D]" aria-hidden="true" />
            <span>Verified</span>
          </div>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab("saved")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "saved"
              ? "bg-white border-[#C6A56B] shadow-[0_12px_32px_-12px_rgba(198,165,107,0.25)] ring-1 ring-[#C6A56B]/30"
              : "bg-white border-[#EDE8DE] hover:border-[#C6A56B]/40 shadow-[0_4px_20px_-8px_rgba(18,59,50,0.06)]"
          }`}
        >
          <div className="flex items-center justify-between text-[#C6A56B] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Saved Residences
            </span>
            <Bookmark className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#242622]">
            {savedProperties.length}
          </div>
          <p className="text-[11px] text-[#77766F] mt-1">
            Bookmarked for review
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
              Active Inquiries
            </span>
            <MessageSquare className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#242622]">
            {inquiries.length}
          </div>
          <p className="text-[11px] text-[#77766F] mt-1">
            Sent to landlords
          </p>
        </div>

        <div
          onClick={() => setActiveTab("profile")}
          className={`col-span-2 sm:col-span-1 p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-white border-[#C6A56B] shadow-[0_12px_32px_-12px_rgba(198,165,107,0.25)] ring-1 ring-[#C6A56B]/30"
              : "bg-white border-[#EDE8DE] hover:border-[#C6A56B]/40 shadow-[0_4px_20px_-8px_rgba(18,59,50,0.06)]"
          }`}
        >
          <div className="flex items-center justify-between text-[#123B32] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              My Profile
            </span>
            <User className="w-4 h-4 text-[#123B32]" aria-hidden="true" />
          </div>
          <div className="text-sm font-semibold text-[#242622] truncate mt-1">
            {user.name}
          </div>
          <p className="text-[11px] text-[#77766F] mt-1">
            {user.phone || "No phone recorded"}
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-[#EDE8DE]">
        <nav className="flex space-x-6" aria-label="Tenant Dashboard Tabs">
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`py-3 px-1 border-b-2 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "saved"
                ? "border-[#123B32] text-[#123B32]"
                : "border-transparent text-[#77766F] hover:text-[#123B32]"
            }`}
          >
            <Bookmark className="w-4 h-4" aria-hidden="true" />
            <span>Saved Residences</span>
            <span className="text-[10px] bg-[#F8F6F0] border border-[#EDE8DE] px-2 py-0.5 rounded-full text-[#242622]">
              {savedProperties.length}
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
            <span>Rental Inquiries</span>
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
            <span>My Profile</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "saved" ? (
          <SavedProperties initialProperties={savedProperties} />
        ) : activeTab === "inquiries" ? (
          <TenantInquiries inquiries={inquiries} />
        ) : (
          <ProfileEditor user={user} />
        )}
      </div>
    </div>
  );
}
