import { loadEnvConfig } from "@next/env";
import fs from "node:fs";
import path from "node:path";
import { properties as baseProperties } from "../src/data/properties";
import type { Inquiry } from "../src/types/inquiry";
import type { Property, PropertyStatus } from "../src/types/property";
import type { User } from "../src/types/user";
import { getDatabase } from "../src/lib/db";
import {
  inquiries as inquiryTable,
  properties as propertyTable,
  savedProperties as savedPropertyTable,
  users as userTable,
} from "../src/lib/schema";

loadEnvConfig(process.cwd());

function readJson<T>(fileName: string, fallback: T): T {
  const filePath = path.join(process.cwd(), "src", "data", fileName);
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

async function main() {
  const database = getDatabase();
  const users = readJson<User[]>("users.json", []);
  const customProperties = readJson<Property[]>("custom-properties.json", []);
  const inquiries = readJson<Inquiry[]>("inquiries.json", []);
  const savedRecords = readJson<
    { tenantId: string; propertyId: string; savedAt: string }[]
  >("saved-properties.json", []);
  const overrides = readJson<{
    statusOverrides?: Record<string, PropertyStatus>;
    deletedIds?: string[];
  }>("property-overrides.json", {});
  const deletedIds = new Set(overrides.deletedIds ?? []);
  const propertyRows = [
    ...baseProperties.map((property) => ({ property, isSeed: true })),
    ...customProperties.map((property) => ({ property, isSeed: false })),
  ];

  for (const user of users) {
    await database
      .insert(userTable)
      .values({
        id: user.id,
        name: user.name,
        email: user.email,
        emailNormalized: user.email.toLowerCase().trim(),
        passwordHash: null,
        role: user.role,
        phone: user.phone,
        company: user.company,
        createdAt: user.createdAt,
      })
      .onConflictDoNothing();
  }

  for (const { property, isSeed } of propertyRows) {
    const status = overrides.statusOverrides?.[property.id] ?? property.status;
    const data = { ...property, status };
    await database
      .insert(propertyTable)
      .values({
        id: property.id,
        landlordId: property.landlord.id,
        landlordEmail: property.landlord.email.toLowerCase(),
        status,
        isSeed,
        isDeleted: deletedIds.has(property.id),
        data,
        createdAt: property.createdAt,
      })
      .onConflictDoNothing();
  }

  const userIds = new Set(users.map((user) => user.id));
  const propertyIds = new Set(propertyRows.map(({ property }) => property.id));
  let skippedSavedRecords = 0;
  for (const record of savedRecords) {
    if (!userIds.has(record.tenantId) || !propertyIds.has(record.propertyId)) {
      skippedSavedRecords++;
      continue;
    }
    await database
      .insert(savedPropertyTable)
      .values({
        tenantId: record.tenantId,
        propertyId: record.propertyId,
        savedAt: record.savedAt,
      })
      .onConflictDoNothing();
  }

  for (const inquiry of inquiries) {
    await database
      .insert(inquiryTable)
      .values({
        id: inquiry.id,
        propertyId: inquiry.propertyId,
        tenantId: inquiry.tenantId,
        landlordId: inquiry.landlordId,
        status: inquiry.status,
        data: inquiry,
        createdAt: inquiry.createdAt,
      })
      .onConflictDoNothing();
  }

  console.log(
    `Database ready. Imported ${users.length} accounts, ${propertyRows.length} properties, ${savedRecords.length - skippedSavedRecords} saved properties, and ${inquiries.length} inquiries.`
  );
  if (skippedSavedRecords > 0) {
    console.warn(`Skipped ${skippedSavedRecords} saved records with missing account or property references.`);
  }
}

main().catch((error: unknown) => {
  console.error("Database setup failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});