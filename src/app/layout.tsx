import { Suspense } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "KirayLink | Property Rentals in Addis Ababa",
    template: "%s | KirayLink",
  },
  description:
    "Browse verified homes and apartments for rent in Addis Ababa with clear lease terms.",
  icons: {
    icon: "/images/kiraylink-logo.png",
  },
};

const themeInitializationScript = `
  (function () {
    var theme;
    try {
      var savedTheme = window.localStorage.getItem("kiraylink-theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        theme = savedTheme;
      }
    } catch (error) {
      console.warn("Unable to read the saved theme preference.", error);
    }
    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-primary antialiased">
        <Script id="theme-initialization" strategy="beforeInteractive">
          {themeInitializationScript}
        </Script>
        <ThemeProvider>
          <Suspense fallback={<header className="sticky top-0 z-40 h-16 bg-background/95" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
