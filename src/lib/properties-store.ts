import type { Property, PropertyStatus } from "@/types/property";
import { getDatabase } from "@/lib/db";
import { properties } from "@/lib/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export async function getAllActiveProperties(): Promise<Property[]> {
  const rows = await getDatabase()
    .select({ data: properties.data, status: properties.status })
    .from(properties)
    .where(eq(properties.isDeleted, false))
    .orderBy(desc(properties.createdAt));
  return rows.map((row) => ({
    ...row.data,
    status: row.status,
  }));
}

export async function getActivePropertyById(
  id: string
): Promise<Property | undefined> {
  const rows = await getDatabase()
    .select({ data: properties.data, status: properties.status })
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.isDeleted, false)))
    .limit(1);
  if (!rows[0]) return undefined;
  return {
    ...rows[0].data,
    status: rows[0].status,
  };
}

export async function createPropertyRecord(property: Property): Promise<void> {
  await getDatabase().insert(properties).values({
      id: property.id,
      landlordId: property.landlord.id,
      landlordEmail: property.landlord.email.toLowerCase(),
      status: property.status,
      data: property,
      createdAt: property.createdAt,
    });
}

export async function setPropertyStatus(
  id: string,
  status: PropertyStatus
): Promise<boolean> {
  const rows = await getDatabase()
    .update(properties)
    .set({
      status,
      data: sql<Property>`jsonb_set(${properties.data}, '{status}', to_jsonb(${status}::text), true)`,
    })
    .where(and(eq(properties.id, id), eq(properties.isDeleted, false)))
    .returning({ id: properties.id });
  return rows.length > 0;
}

export async function deletePropertyRecord(id: string): Promise<boolean> {
  const rows = await getDatabase()
    .update(properties)
    .set({ isDeleted: true })
    .where(and(eq(properties.id, id), eq(properties.isDeleted, false)))
    .returning({ id: properties.id });
  return rows.length > 0;
}
