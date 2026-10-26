import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "kiraylink_session";

function getSecretKey(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ||
    "kiraylink-luxury-rentals-dev-secret-key-2026-secure-32ch";
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(COOKIE_NAME);

  // If no session cookie exists on protected routes, redirect to sign-in
  if (!sessionCookie || !sessionCookie.value) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(sessionCookie.value, secretKey);
    const role = payload.role as string;

    // Enforce role-based access control
    if (pathname.startsWith("/admin") && role !== "admin") {
      const redirectTarget =
        role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";
      return NextResponse.redirect(new URL(redirectTarget, request.url));
    }

    if (pathname.startsWith("/landlord") && role !== "landlord" && role !== "admin") {
      return NextResponse.redirect(new URL("/tenant/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    // If token verification fails (tampered, expired, or invalid), redirect to sign-in
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: [
    "/tenant/:path*",
    "/landlord/:path*",
    "/admin/:path*",
  ],
};
