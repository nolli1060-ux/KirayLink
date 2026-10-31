import { createNeonAuth } from "@neondatabase/auth/next/server";

let authInstance: ReturnType<typeof createNeonAuth> | undefined;

export function getAuth() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

  if (!baseUrl) {
    throw new Error("NEON_AUTH_BASE_URL is required to use authentication.");
  }
  if (!cookieSecret) {
    throw new Error("NEON_AUTH_COOKIE_SECRET is required to use authentication.");
  }

  authInstance ??= createNeonAuth({
    baseUrl,
    cookies: { secret: cookieSecret },
  });
  return authInstance;
}
