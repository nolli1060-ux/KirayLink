"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { users } from "@/lib/schema";
import type { SessionUser, UserRole } from "@/types/user";
import { getAuth } from "@/lib/auth/server";

export async function getUserRoles(): Promise<UserRole[]> {
  const rows = await getDatabase().select({ role: users.role }).from(users);
  return rows.map((row) => row.role);
}

export async function getSession(): Promise<SessionUser | null> {
  await cookies();
  const { data: session, error } = await getAuth().getSession();
  if (error) {
    throw new Error(`Could not read the authentication session: ${error.message}`);
  }

  const authUser = session?.user;
  if (!authUser) return null;

  const [profile] = await getDatabase()
    .select({ role: users.role, company: users.company })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!profile) return null;

  return {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    role: profile.role,
    company: profile.company ?? undefined,
  };
}

export async function requireAuth(
  requiredRole?: UserRole,
  currentPath?: string
): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    const returnParam = currentPath
      ? `?redirect=${encodeURIComponent(currentPath)}`
      : "";
    redirect(`/sign-in${returnParam}`);
  }

  if (requiredRole && session.role !== requiredRole && session.role !== "admin") {
    if (session.role === "tenant") redirect("/tenant/dashboard");
    if (session.role === "landlord") redirect("/landlord/dashboard");
    redirect("/");
  }

  return session;
}
