import type { Metadata } from "next";
import FeaturedProperties from "@/components/home/FeaturedProperties";
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
      <FeaturedProperties />
    </>
  );
}