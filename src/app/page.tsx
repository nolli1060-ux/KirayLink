import { Suspense } from "react";
import type { Metadata } from "next";
import AvailableProperties from "@/components/home/AvailableProperties";
import HomeSections from "@/components/home/HomeSections";
import Hero from "@/components/home/Hero";
import RecentlyAddedProperties from "@/components/home/RecentlyAddedProperties";
import { getAllActiveProperties, getSavedPropertyIds } from "@/lib/properties-store";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "KirayLink | Curated Luxury Residences in Addis Ababa",
  description:
    "Browse exclusive villas, luxury apartments, and penthouses for rent in Addis Ababa with verified terms.",
};

async function HomeContent() {
  const [properties, session] = await Promise.all([
    getAllActiveProperties(),
    getSession(),
  ]);
  const savedPropertyIds =
    session?.role === "tenant" ? await getSavedPropertyIds(session.id) : [];
  const availableProperties = properties.filter(
    (property) => property.status === "available"
  );

  return (
    <>
      <Hero properties={availableProperties} />
      <AvailableProperties
        properties={availableProperties}
        savedPropertyIds={savedPropertyIds}
      />
      <RecentlyAddedProperties
        properties={availableProperties}
        savedPropertyIds={savedPropertyIds}
      />
      <HomeSections properties={availableProperties} />
    </>
  );
}

function HomeFallback() {
  return (
    <div className="min-h-[80vh] animate-pulse bg-background">
      <div className="mx-auto grid min-h-[70vh] max-w-7xl grid-cols-1 items-center gap-8 px-4 py-16 lg:grid-cols-2 lg:px-8">
        <div className="space-y-5">
          <div className="h-4 w-44 rounded-full bg-surface-muted" />
          <div className="h-24 max-w-xl rounded-2xl bg-surface-muted" />
          <div className="h-12 max-w-lg rounded-xl bg-surface-muted" />
        </div>
        <div className="min-h-[380px] rounded-[2rem] bg-surface-muted" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
