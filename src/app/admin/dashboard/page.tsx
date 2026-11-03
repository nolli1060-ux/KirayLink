import { Suspense } from "react";
import type { Metadata } from "next";
import { getAdminDashboardData } from "@/lib/dashboard-actions";
import ListingManagement from "@/components/admin/ListingManagement";
import Badge from "@/components/ui/Badge";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard | KirayLink",
  description: "Platform administration and property moderation.",
};

async function AdminDashboardContent() {
  const data = await getAdminDashboardData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Top Banner & Security Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE8DE]">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="navy" className="rounded-full px-3 py-1 font-medium">Admin Console — High Privilege</Badge>
            <span className="text-xs text-[#77766F]">Platform Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#242622] tracking-tight mt-2">
            Platform Administration
          </h1>
          <p className="text-xs text-[#77766F] mt-1">
            Logged in as {data.user.name} ({data.user.email}) · Strict server-enforced role: {data.user.role}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-[#174A3D] bg-[#EAF3F0] border border-[#174A3D]/20 px-3.5 py-2 rounded-full">
          <ShieldCheck className="w-4 h-4 text-[#174A3D]" aria-hidden="true" />
          <span>Super-Admin Verified</span>
        </div>
      </div>

      {/* Main Admin Management Workspace */}
      <ListingManagement
        initialProperties={data.allProperties}
        stats={data.stats}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 max-w-7xl mx-auto px-4 text-center text-[#77766F] font-sans">
          Verifying administrator permissions...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
