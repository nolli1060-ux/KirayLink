import { Suspense } from "react";
import type { Metadata } from "next";
import { getAdminDashboardData } from "@/lib/dashboard-actions";
import ListingManagement from "@/components/admin/ListingManagement";

export const metadata: Metadata = {
  title: "Admin Dashboard | KirayLink",
  description: "Platform administration and property moderation.",
};

async function AdminDashboardContent() {
  const data = await getAdminDashboardData();

  return (
    <ListingManagement
      administratorName={data.user.name}
      initialProperties={data.allProperties}
      inquiries={data.allInquiries}
      stats={data.stats}
    />
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-24 text-center text-secondary">
          Verifying administrator permissions...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
