import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth/server";
import { getDatabase } from "@/lib/db";
import { users } from "@/lib/schema";
import type { UserRole } from "@/types/user";

function isSignupRole(value: unknown): value is Exclude<UserRole, "admin"> {
  return value === "tenant" || value === "landlord";
}

export async function POST(request: Request) {
  const { data: session, error } = await getAuth().getSession();
  if (error) {
    throw new Error(`Could not read the authentication session: ${error.message}`);
  }
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("role" in body) ||
    !isSignupRole(body.role)
  ) {
    return NextResponse.json({ error: "Please select a valid account role." }, { status: 400 });
  }

  const phone =
    "phone" in body && typeof body.phone === "string" && body.phone.trim()
      ? body.phone.trim()
      : undefined;
  const role: UserRole = body.role;
  const database = getDatabase();

  const [existingProfile] = await database
    .select({ id: users.id, role: users.role, company: users.company })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (existingProfile) {
    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: existingProfile.role,
        company: existingProfile.company ?? undefined,
      },
    });
  }

  const [profile] = await database
    .insert(users)
    .values({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      emailNormalized: session.user.email.toLowerCase().trim(),
      passwordHash: null,
      role,
      phone,
      createdAt: new Date().toISOString(),
    })
    .onConflictDoNothing()
    .returning({ id: users.id, role: users.role, company: users.company });

  if (!profile) {
    return NextResponse.json(
      { error: "An account with this email already exists. Contact support to link it." },
      { status: 409 }
    );
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: profile.role,
      company: profile.company ?? undefined,
    },
  });
}
