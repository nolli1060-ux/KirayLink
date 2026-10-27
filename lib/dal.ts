import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { notFound,redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const verifySession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return session;
});


export const verifyAdminSession = cache(async () => {
  const session = await verifySession();

  if (session.user.role !== "admin") {
    notFound();
  }

  return session;
});