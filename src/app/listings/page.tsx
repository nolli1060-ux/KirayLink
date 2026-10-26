import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllActiveProperties } from "@/lib/properties-store";
import ListingsClient from "@/components/properties/ListingsClient";

export const metadata: Metadata = {
  title: "Available Residences | KirayLink",
  description:
    "Browse verified homes, apartments, villas, and townhouses for rent in Addis Ababa.",
};

export default function ListingsPage() {
  const properties = getAllActiveProperties();

  return (
    <Suspense
      fallback={
        <div className="py-24 max-w-7xl mx-auto px-4 text-center text-[#5B677A]">
          Loading property collection...
        </div>
      }
    >
      <ListingsClient initialProperties={properties} />
    </Suspense>
  );
}
