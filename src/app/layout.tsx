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
      <body className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#0F172A] antialiased selection:bg-[#C5A880]/30 selection:text-[#0F172A]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
