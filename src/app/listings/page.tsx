import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllActiveProperties, getSavedPropertyIds } from "@/lib/properties-store";
import ListingsClient from "@/components/properties/ListingsClient";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Available Residences | KirayLink",
  description:
    "Browse verified homes, apartments, villas, and townhouses for rent in Addis Ababa.",
};

async function ListingsContent() {
  const [properties, session] = await Promise.all([
    getAllActiveProperties(),
    getSession(),
  ]);
  const savedPropertyIds =
    session?.role === "tenant" ? await getSavedPropertyIds(session.id) : [];
  return (
    <ListingsClient
      initialProperties={properties}
      savedPropertyIds={savedPropertyIds}
    />
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 max-w-7xl mx-auto px-4 text-center text-[#5B677A]">
          Loading property collection...
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}
