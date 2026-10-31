"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import type { SessionUser } from "@/types/user";
import { authClient } from "@/lib/auth/client";

type Theme = "light" | "dark";

function subscribeToTheme(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const savedPreference = savedTheme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = savedPreference;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        setLoading(true);
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          throw new Error("Could not check your sign-in status.");
        }

        const data = await res.json();
        if (isMounted) {
          setUser(data.user ?? null);
          setAuthError("");
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
          setAuthError(
            error instanceof Error
              ? error.message
              : "Could not check your sign-in status."
          );
        }
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
  const handleSignOut = async () => {
    setAuthError("");
    try {
      const { error } = await authClient.signOut();
      if (error) {
        setAuthError(error.message || "Could not sign out. Please try again.");
        return;
      }

      setUser(null);
      router.push("/");
      router.refresh();
    } catch {
      setAuthError("Could not sign out. Please try again.");
    }
  };
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("theme", nextTheme);
  };
  const lightNavbar = theme === "light";

  return (
    <header
      className={
        isHomePage
          ? "absolute inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6"
          : "sticky top-0 z-40 px-3 pt-3 sm:px-6"
      }
    >
      <nav
        aria-label="Main navigation"
        className={`relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 rounded-2xl px-4 py-3 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.65)] backdrop-blur-sm sm:px-6 lg:rounded-full lg:px-7 ${
          lightNavbar
            ? "bg-white/80 text-[#17191F]"
            : "bg-[#17191F]/70 text-white"
        }`}
      >
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8C6E43]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C5A880] text-[#0F172A]">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className={`text-lg font-bold tracking-tight ${lightNavbar ? "text-[#17191F]" : "text-white"}`}>
            Kiray<span className="text-gold-accent">Link</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={`nav-link text-sm font-medium transition-colors ${
              lightNavbar
                ? "text-[#17191F]/75 hover:text-[#17191F]"
                : "text-white/75 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href="/listings"
            aria-current={pathname === "/listings" ? "page" : undefined}
            className={`nav-link text-sm font-medium transition-colors ${
              lightNavbar
                ? "text-[#17191F]/75 hover:text-[#17191F]"
                : "text-white/75 hover:text-white"
            }`}
          >
            Find a Home
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6E43] ${
              lightNavbar
                ? "border-[#17191F]/20 text-[#17191F] hover:bg-black/5"
                : "border-white/20 text-white hover:bg-white/10"
            }`}
            aria-label={`Switch to ${lightNavbar ? "dark" : "light"} mode`}
            title={`Switch to ${lightNavbar ? "dark" : "light"} mode`}
          >
            {lightNavbar ? (
              <Moon className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Sun className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          {!loading && user ? (
            <>
              <Link
                href={getDashboardHref()}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  lightNavbar
                    ? "border-[#17191F]/20 text-[#17191F] hover:border-[#D9B149] hover:text-[#A87900]"
                    : "border-white/20 text-white hover:border-[#F3B41B]/70 hover:text-[#F3B41B]"
                }`}
              >
                <LayoutDashboard
                  className="h-4 w-4 text-[#F3B41B]"
                  aria-hidden="true"
                />
                <span>{getDashboardLabel()}</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-full bg-[#F3B41B] px-5 py-2.5 text-sm font-bold text-[#17191F] transition-colors hover:bg-[#FFC72C]"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-up?role=landlord"
                className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  lightNavbar
                    ? "text-[#17191F]/75 hover:text-[#17191F]"
                    : "text-white/75 hover:text-white"
                }`}
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
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-[#C5A880] hover:text-[#8C6E43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6E43] md:hidden ${
            lightNavbar
              ? "border-[#17191F]/20 text-[#17191F]"
              : "border-white/20 text-white"
          }`}
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
          <div className={`w-full border-t pt-3 md:hidden ${lightNavbar ? "border-black/15" : "border-white/15"}`}>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                  lightNavbar
                    ? "text-[#17191F]/85 hover:bg-black/5"
                    : "text-white/85 hover:bg-white/10"
                }`}
                aria-label={`Switch to ${lightNavbar ? "dark" : "light"} mode`}
              >
                {lightNavbar ? (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                )}
                Switch to {lightNavbar ? "dark" : "light"} mode
              </button>
              <Link
                href="/"
                onClick={closeMenu}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  lightNavbar
                    ? "text-[#17191F]/85 hover:bg-black/5"
                    : "text-white/85 hover:bg-white/10"
                }`}
              >
                Home
              </Link>
              <Link
                href="/listings"
                onClick={closeMenu}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  lightNavbar
                    ? "text-[#17191F]/85 hover:bg-black/5"
                    : "text-white/85 hover:bg-white/10"
                }`}
              >
                Browse Homes
              </Link>
              {!loading && user ? (
                <>
                  <Link
                    href={getDashboardHref()}
                    onClick={closeMenu}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                      lightNavbar
                        ? "text-[#17191F]/85 hover:bg-black/5"
                        : "text-white/85 hover:bg-white/10"
                    }`}
                  >
                    {getDashboardLabel()}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      void handleSignOut();
                    }}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                      lightNavbar
                        ? "text-[#17191F]/85 hover:bg-black/5"
                        : "text-white/85 hover:bg-white/10"
                    }`}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-up?role=landlord"
                    onClick={closeMenu}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                      lightNavbar
                        ? "text-[#17191F]/85 hover:bg-black/5"
                        : "text-white/85 hover:bg-white/10"
                    }`}
                  >
                    List a Property
                  </Link>
                  <Link
                    href="/sign-in"
                    onClick={closeMenu}
                    className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#F3B41B] px-5 py-3 text-sm font-bold text-[#17191F] transition-colors hover:bg-[#FFC72C]"
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
      {authError && (
        <p
          role="alert"
          className="mx-auto mt-2 max-w-7xl rounded-lg bg-error-bg px-4 py-2 text-sm text-error"
        >
          {authError}
        </p>
      )}
    </header>
  );
}
