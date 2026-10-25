import { verifySession } from "@/lib/dal";

export default async function DashboardSession() {
  await verifySession();
  return null;
}