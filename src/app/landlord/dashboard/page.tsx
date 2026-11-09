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
        <div className="mx-auto max-w-7xl px-4 py-24 text-center font-sans text-secondary">
          Verifying landlord session...
        </div>
      }
    >
      <LandlordDashboardContent />
    </Suspense>
  );
}
