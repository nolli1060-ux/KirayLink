import { Suspense } from "react";
import type { Metadata } from "next";
import { getLandlordDashboardData } from "@/lib/dashboard-actions";
import LandlordDashboardClient from "@/components/landlord/LandlordDashboardClient";

export const metadata: Metadata = {
  title: "Landlord Dashboard | KirayLink",
  description: "Manage your property listings and tenant inquiries.",
};

async function LandlordDashboardContent() {
  const data = await getLandlordDashboardData();

  return (
    <LandlordDashboardClient
      user={data.user}
      myProperties={data.myProperties}
      inquiries={data.inquiries}
    />
  );
}

export default function LandlordDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 max-w-7xl mx-auto px-4 text-center text-muted">
          Verifying landlord session...
        </div>
      }
    >
      <LandlordDashboardContent />
    </Suspense>
  );
}
