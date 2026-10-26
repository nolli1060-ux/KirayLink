export type UserRole = "tenant" | "landlord" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  company?: string;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
}
