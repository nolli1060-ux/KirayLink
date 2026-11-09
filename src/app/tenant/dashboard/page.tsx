import { Suspense } from "react";
import type { Metadata } from "next";
import { getTenantDashboardData } from "@/lib/dashboard-actions";
import TenantDashboardClient from "@/components/tenant/TenantDashboardClient";

export const metadata: Metadata = {
  title: "Tenant Dashboard | KirayLink",
  description: "View saved properties and track your rental inquiries.",
};

async function TenantDashboardContent() {
  const data = await getTenantDashboardData();

  return (
    <TenantDashboardClient
      user={data.user}
      savedProperties={data.savedProperties}
      inquiries={data.inquiries}
    />
  );
}

export default function TenantDashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          className="mx-auto max-w-7xl px-4 py-24 text-center text-sm text-secondary"
        >
          Loading your tenant dashboard...
        </div>
      }
    >
      <TenantDashboardContent />
    </Suspense>
  );
}
