"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { SessionUser } from "@/types/user";
import { signOutAction } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        setLoading(true);
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setUser(data.user ?? null);
          }
        } else if (isMounted) {
          setUser(null);
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const getDashboardHref = () => {
    if (!user) return "/sign-in";
    if (user.role === "landlord") return "/landlord/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/tenant/dashboard";
  };

  const getDashboardLabel = () => {
    if (user?.role === "landlord") return "Landlord Desk";
    if (user?.role === "admin") return "Admin Console";
    return "Profile";
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 px-3 pt-3 backdrop-blur sm:px-6">
      <nav
        aria-label="Main navigation"
        className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 rounded-2xl bg-[#17191F] px-4 py-3 text-white shadow-[0_8px_24px_-16px_rgba(0,0,0,0.65)] sm:px-6 lg:rounded-full lg:px-7"
      >
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F3B41B]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3B41B] text-[#17191F]">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Kiray<span className="text-[#F3B41B]">Link</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-white/75 transition-colors hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/listings"
            className="text-sm font-medium text-white/75 transition-colors hover:text-white"
          >
            Find a Home
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && user ? (
            <>
              <Link
                href={getDashboardHref()}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#F3B41B]/70 hover:text-[#F3B41B]"
              >
                <LayoutDashboard
                  className="h-4 w-4 text-[#F3B41B]"
                  aria-hidden="true"
                />
                <span>{getDashboardLabel()}</span>
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-[#F3B41B] px-5 py-2.5 text-sm font-bold text-[#17191F] transition-colors hover:bg-[#FFC72C]"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/sign-up?role=landlord"
                className="rounded-full px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:text-white"
              >
                List a Property
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 rounded-full bg-[#F3B41B] px-5 py-2.5 text-sm font-bold text-[#17191F] transition-colors hover:bg-[#FFC72C]"
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                Sign In
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-[#F3B41B] hover:text-[#F3B41B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3B41B] md:hidden"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        {isMenuOpen && (
          <div className="w-full border-t border-white/15 pt-3 md:hidden">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
              >
                Home
              </Link>
              <Link
                href="/listings"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
              >
                Browse Homes
              </Link>
              {!loading && user ? (
                <>
                  <Link
                    href={getDashboardHref()}
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
                  >
                    {getDashboardLabel()}
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      onClick={closeMenu}
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/85 hover:bg-white/10"
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-up?role=landlord"
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
                  >
                    List a Property
                  </Link>
                  <Link
                    href="/sign-in"
                    onClick={closeMenu}
                    className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#F3B41B] px-5 py-3 text-sm font-bold text-[#17191F] hover:bg-[#FFC72C]"
                  >
                    <KeyRound className="h-4 w-4" aria-hidden="true" />
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
