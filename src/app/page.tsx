import { Suspense } from "react";
import type { Metadata } from "next";
import AvailableProperties from "@/components/home/AvailableProperties";
import Hero from "@/components/home/Hero";

export const metadata: Metadata = {
  title: "KirayLink | Curated Luxury Residences in Addis Ababa",
  description:
    "Browse exclusive villas, luxury apartments, and penthouses for rent in Addis Ababa with verified terms.",
};

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-[620px] bg-[#123B32]" />}>
        <Hero />
      </Suspense>
      <Suspense
        fallback={
          <div className="py-16 text-center text-sm text-[#77766F] font-sans">
            Loading curated residences...
          </div>
        }
      >
        <AvailableProperties />
      </Suspense>
    </>
  );
}
