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
    return "Tenant Dashboard";
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F8F6F0]/90 px-3 pt-3 backdrop-blur-md sm:px-6">
      <nav
        aria-label="Main navigation"
        className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 rounded-2xl bg-gradient-to-r from-[#123B32] via-[#144238] to-[#174A3D] px-4 py-3 text-white shadow-[0_12px_36px_-16px_rgba(18,59,50,0.55)] border border-[#C6A56B]/25 sm:px-6 lg:rounded-full lg:px-7"
      >
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C6A56B]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C6A56B] text-[#123B32] shadow-sm">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white font-serif">
            Kiray<span className="text-[#C6A56B]">Link</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium tracking-wide text-[#EDE8DE]/80 transition-colors hover:text-[#C6A56B]"
          >
            Home
          </Link>
          <Link
            href="/listings"
            className="text-sm font-medium tracking-wide text-[#EDE8DE]/80 transition-colors hover:text-[#C6A56B]"
          >
            Find a Home
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && user ? (
            <>
              <Link
                href={getDashboardHref()}
                className="inline-flex items-center gap-2 rounded-full border border-[#C6A56B]/30 bg-white/5 px-4 py-2 text-sm font-semibold text-[#EDE8DE] backdrop-blur-xs transition-colors hover:border-[#C6A56B] hover:text-[#C6A56B]"
              >
                <LayoutDashboard
                  className="h-4 w-4 text-[#C6A56B]"
                  aria-hidden="true"
                />
                <span>{getDashboardLabel()}</span>
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-[#C6A56B] px-5 py-2.5 text-sm font-bold text-[#123B32] shadow-sm transition-all hover:bg-[#D8BD8E] active:scale-98 cursor-pointer"
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
                className="rounded-full px-3 py-2 text-sm font-medium text-[#EDE8DE]/80 transition-colors hover:text-[#C6A56B]"
              >
                List a Property
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 rounded-full bg-[#C6A56B] px-5 py-2.5 text-sm font-bold text-[#123B32] shadow-sm transition-all hover:bg-[#D8BD8E] active:scale-98 cursor-pointer"
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-[#C6A56B] hover:text-[#C6A56B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6A56B] md:hidden"
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
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#EDE8DE]/90 hover:bg-white/10"
              >
                Home
              </Link>
              <Link
                href="/listings"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#EDE8DE]/90 hover:bg-white/10"
              >
                Browse Homes
              </Link>
              {!loading && user ? (
                <>
                  <Link
                    href={getDashboardHref()}
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#EDE8DE]/90 hover:bg-white/10"
                  >
                    {getDashboardLabel()}
                  </Link>
                  <form action={signOutAction} className="pt-1">
                    <button
                      type="submit"
                      className="w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-[#C6A56B] hover:bg-white/10"
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
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#EDE8DE]/90 hover:bg-white/10"
                  >
                    List a Property
                  </Link>
                  <Link
                    href="/sign-in"
                    onClick={closeMenu}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#C6A56B] px-5 py-2.5 text-sm font-bold text-[#123B32]"
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
