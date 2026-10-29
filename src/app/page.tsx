import { Suspense } from "react";
import type { Metadata } from "next";
import AvailableProperties from "@/components/home/AvailableProperties";
import Hero from "@/components/home/Hero";

export const metadata: Metadata = {
  title: "Find Your Next Home | KirayLink",
  description:
    "Browse verified homes and apartments for rent in Addis Ababa with clear lease terms.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Suspense
        fallback={
          <div className="py-16 text-center text-sm text-[#5B677A]">
            Loading available homes...
          </div>
        }
      >
        <AvailableProperties />
      </Suspense>
    </>
  );
}