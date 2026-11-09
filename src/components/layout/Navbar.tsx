"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { SessionUser } from "@/types/user";
import { signOutAction } from "@/lib/auth";
import BrandLogo from "@/components/layout/BrandLogo";
import ThemeToggle from "@/components/layout/ThemeToggle";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "Explore properties", href: "/listings" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

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

  const dashboardHref = () => {
    if (!user) return "/sign-in";
    if (user.role === "landlord") return "/landlord/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/tenant/dashboard";
  };

  const dashboardLabel = () => {
    if (user?.role === "landlord") return "Landlord dashboard";
    if (user?.role === "admin") return "Admin console";
    return "Tenant dashboard";
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-6">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-5 lg:px-2"
      >
        <BrandLogo
          href="/"
          showWordmark
          onClick={closeMenu}
          className="shrink-0"
        />

        <div className="hidden items-center gap-7 lg:flex">
          {navigationLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-medium text-secondary transition-colors hover:text-accent-text"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
          <ThemeToggle />
          {!loading && user ? (
            <>
              <Link
                href={dashboardHref()}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent-text"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                <span>{dashboardLabel()}</span>
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-button-primary px-4 text-sm font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </form>
            </>
          ) : !loading ? (
            <>
              <Link
                href="/sign-in"
                className="rounded-full px-3 py-2 text-sm font-medium text-primary transition-colors hover:text-accent-text"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-button-primary px-5 text-sm font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover"
              >
                Create account
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </>
          ) : null}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-primary transition-colors hover:border-accent hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus lg:hidden"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        {isMenuOpen && (
          <div
            id="mobile-navigation"
            className="absolute inset-x-3 top-[calc(100%+0.5rem)] max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl border border-border bg-surface p-3 shadow-popover lg:hidden"
          >
            <div className="flex items-center justify-between rounded-xl px-3 py-2">
              <span className="text-sm font-medium text-secondary">Appearance</span>
              <ThemeToggle />
            </div>
            <div className="my-2 border-t border-border" />
            <div className="flex flex-col">
              {navigationLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-primary transition-colors hover:bg-surface-muted hover:text-accent-text"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="my-2 border-t border-border" />
            {!loading && user ? (
              <>
                <Link
                  href={dashboardHref()}
                  onClick={closeMenu}
                  className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-primary hover:bg-surface-muted"
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  {dashboardLabel()}
                </Link>
                <form action={signOutAction} className="mt-1">
                  <button
                    type="submit"
                    className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-primary hover:bg-surface-muted"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                  </button>
                </form>
              </>
            ) : !loading ? (
              <div className="grid grid-cols-2 gap-2 p-1">
                <Link
                  href="/sign-in"
                  onClick={closeMenu}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-border text-sm font-medium text-primary"
                >
                  Log in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={closeMenu}
                  className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full bg-button-primary px-3 text-sm font-semibold text-button-primary-text"
                >
                  Create account
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </nav>
    </header>
  );
}
