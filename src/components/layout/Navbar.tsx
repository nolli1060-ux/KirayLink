"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  KeyRound,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import type { SessionUser } from "@/types/user";
import { signOutAction } from "@/lib/auth";

export default function Navbar() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setUser(data.user);
        }
      } catch {
        // Unauthenticated or network error
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const getDashboardHref = () => {
    if (!user) return "/sign-in";
    if (user.role === "landlord") return "/landlord/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/tenant/dashboard";
  };

  const getDashboardLabel = () => {
    if (!user) return "Dashboard";
    if (user.role === "landlord") return "Landlord Desk";
    if (user.role === "admin") return "Admin Console";
    return "Tenant Dashboard";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E6E0D5] bg-[#FDFBF7]/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded bg-[#0F172A] text-[#C5A880]">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-[#0F172A]">
            Kiray<span className="text-[#8C6E43]">Link</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/listings"
            className="text-sm font-medium text-[#5B677A] transition-colors hover:text-[#8C6E43]"
          >
            Find a Home
          </Link>

          {!loading && user ? (
            <div className="flex items-center gap-3">
              <Link
                href={getDashboardHref()}
                className="inline-flex items-center gap-1.5 rounded border border-[#C5A880] bg-[#FDFBF7] px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition-colors hover:bg-[#C5A880] hover:text-[#0F172A]"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-[#8C6E43]" aria-hidden="true" />
                <span>{getDashboardLabel()}</span>
              </Link>

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5B677A] hover:text-[#A63228] transition-colors cursor-pointer px-2 py-1.5"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/sign-up?role=landlord"
                className="hidden text-sm font-medium text-[#5B677A] transition-colors hover:text-[#8C6E43] sm:inline"
              >
                List a Property
              </Link>

              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 rounded border border-[#E6E0D5] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] transition-colors hover:border-[#C5A880] sm:px-4"
              >
                <KeyRound className="h-3.5 w-3.5 text-[#8C6E43]" aria-hidden="true" />
                Sign In
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
