"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, MessageSquare, Compass, ShieldCheck, ArrowRight } from "lucide-react";
import type { Property } from "@/types/property";
import type { Inquiry } from "@/types/inquiry";
import type { SessionUser } from "@/types/user";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SavedProperties from "@/components/tenant/SavedProperties";
import TenantInquiries from "@/components/tenant/TenantInquiries";

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
  const [activeTab, setActiveTab] = useState<"saved" | "inquiries">("saved");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header and Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E0D5]">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="navy">Tenant Workspace</Badge>
            <span className="text-xs text-[#5B677A]">Verified Tenant Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-2">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-[#5B677A] mt-1">
            Manage saved properties, review your rental inquiries, and arrange viewings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/listings">
            <Button variant="primary" size="sm">
              <Compass className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Browse Residences
            </Button>
          </Link>
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#1B6348] bg-[#EDF7F2] border border-[#1B6348]/20 px-3 py-2 rounded">
            <ShieldCheck className="w-4 h-4 text-[#1B6348]" aria-hidden="true" />
            <span>Server Verified</span>
          </div>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab("saved")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === "saved"
              ? "bg-white border-[#C5A880] shadow-sm"
              : "bg-[#FDFBF7] border-[#E6E0D5] hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-[#8C6E43] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Saved Residences
            </span>
            <Bookmark className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">
            {savedProperties.length}
          </div>
          <p className="text-[11px] text-[#5B677A] mt-1">
            Bookmarked for review
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
              Active Inquiries
            </span>
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">
            {inquiries.length}
          </div>
          <p className="text-[11px] text-[#5B677A] mt-1">
            Dispatched to landlords
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-[#E6E0D5] bg-[#FDFBF7] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6E43]">
              Need Help?
            </span>
            <p className="text-xs text-[#5B677A] mt-1">
              Looking for help with your move or rental?
            </p>
          </div>
          <Link
            href="/listings"
            className="text-xs font-bold text-[#0F172A] hover:text-[#8C6E43] inline-flex items-center gap-1 mt-2"
          >
            <span>Browse Properties</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-[#E6E0D5]">
        <nav className="flex space-x-6" aria-label="Tenant Dashboard Tabs">
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`py-3 px-1 border-b-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "saved"
                ? "border-[#0F172A] text-[#0F172A]"
                : "border-transparent text-[#5B677A] hover:text-[#0F172A]"
            }`}
          >
            <Bookmark className="w-4 h-4" aria-hidden="true" />
            <span>Saved Residences</span>
            <span className="text-[10px] bg-[#F7F3EC] px-2 py-0.5 rounded-full text-[#0F172A]">
              {savedProperties.length}
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
            <span>Rental Inquiries</span>
            <span className="text-[10px] bg-[#F7F3EC] px-2 py-0.5 rounded-full text-[#0F172A]">
              {inquiries.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "saved" ? (
          <SavedProperties initialProperties={savedProperties} />
        ) : (
          <TenantInquiries inquiries={inquiries} />
        )}
      </div>
    </div>
  );
}
