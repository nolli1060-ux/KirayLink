"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import type { User, SessionUser, UserRole } from "@/types/user";

const COOKIE_NAME = "kiraylink_session";
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Resolve secret key for HMAC-SHA256 signing
function getSecretKey(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ||
    "kiraylink-luxury-rentals-dev-secret-key-2026-secure-32ch";
  return new TextEncoder().encode(secret);
}

// User file storage path
const usersFilePath = path.join(process.cwd(), "src", "data", "users.json");

// Read all users from persistent JSON file
export async function getUsers(): Promise<User[]> {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, "utf8");
      return JSON.parse(data) as User[];
    }
  } catch (err) {
    console.error("Failed to read users file:", err);
  }
  return [];
}

// Save users to persistent JSON file
async function saveUsers(users: User[]): Promise<void> {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save users file:", err);
    throw new Error("Unable to save user data.");
  }
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
}

// Create and sign a secure session JWT using jose (maintained standard)
export async function createSessionToken(user: SessionUser): Promise<string> {
  const secretKey = getSecretKey();
  return await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

// Set session in secure HTTP-only cookie
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

// Retrieve and verify current session from HTTP-only cookie
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(sessionCookie.value, secretKey);

    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      company: payload.company as string | undefined,
    };
  } catch {
    // Token is expired, invalid, or tampered with
    return null;
  }
}

// Server Action: Sign In
export async function signInAction(
  prevState: { success: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success: boolean; error?: string; redirectUrl?: string }> {
  const email = (formData.get("email") as string)?.trim() || "";
  const password = (formData.get("password") as string) || "";
  const returnUrl = (formData.get("returnUrl") as string) || "";

  if (!email || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, error: "Invalid email or password." };
  }

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company,
  };

  const token = await createSessionToken(sessionUser);
  await setSessionCookie(token);

  // Safe redirect destination
  let destination = returnUrl && returnUrl.startsWith("/") ? returnUrl : "";
  if (!destination) {
    if (user.role === "landlord") destination = "/landlord/dashboard";
    else if (user.role === "admin") destination = "/admin/dashboard";
    else destination = "/tenant/dashboard";
  }

  return { success: true, redirectUrl: destination };
}

// Server Action: Sign Up
export async function signUpAction(
  prevState: { success: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success: boolean; error?: string; redirectUrl?: string }> {
  const name = (formData.get("name") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim() || "";
  const password = (formData.get("password") as string) || "";
  const role = (formData.get("role") as UserRole) || "tenant";
  const company = (formData.get("company") as string)?.trim() || undefined;
  const phone = (formData.get("phone") as string)?.trim() || undefined;

  // Validation
  if (!name || name.length < 2) {
    return { success: false, error: "Name must be at least 2 characters long." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }
  if (role !== "tenant" && role !== "landlord") {
    return { success: false, error: "Please select a valid account role." };
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return {
      success: false,
      error: "An account with this email address already exists.",
    };
  }

  // Hash password using maintained bcryptjs library (10 rounds)
  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser: User = {
    id: `usr-${role}-${Date.now()}`,
    name,
    email,
    passwordHash,
    role,
    company,
    phone,
    createdAt: new Date().toISOString(),
  };

  const users = await getUsers();
  users.push(newUser);
  await saveUsers(users);

  // Create session and log in immediately
  const sessionUser: SessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    company: newUser.company,
  };

  const token = await createSessionToken(sessionUser);
  await setSessionCookie(token);

  const destination =
    role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";

  return { success: true, redirectUrl: destination };
}

// Server Action: Sign Out
export async function signOutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/sign-in");
}

// Server-side Route Guard for Protected Pages
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

  // Role authorization check
  if (requiredRole && session.role !== requiredRole && session.role !== "admin") {
    // If user lacks required role, route to their authorized dashboard
    if (session.role === "tenant") redirect("/tenant/dashboard");
    if (session.role === "landlord") redirect("/landlord/dashboard");
    redirect("/");
  }

  return session;
}
