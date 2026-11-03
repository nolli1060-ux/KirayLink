import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "KirayLink | Property Rentals in Addis Ababa",
    template: "%s | KirayLink",
  },
  description:
    "Browse verified homes and apartments for rent in Addis Ababa with clear lease terms.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F8F6F0] text-[#242622] antialiased selection:bg-[#C6A56B]/25 selection:text-[#123B32]">
        <Suspense fallback={<header className="sticky top-0 z-40 h-16 bg-[#F8F6F0]/95" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
