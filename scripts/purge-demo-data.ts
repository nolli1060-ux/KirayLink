import { loadEnvConfig } from "@next/env";
import { eq, or, inArray } from "drizzle-orm";
import { getDatabase } from "../src/lib/db";
import { properties, inquiries, savedProperties } from "../src/lib/schema";

loadEnvConfig(process.cwd());

async function main() {
  const db = getDatabase();
  console.log("Purging all demo/seed properties and fake inquiries...");

  // 1. Delete saved properties pointing to seed properties
  const seedIds = ["1", "2", "3", "4", "5", "6", "7", "8"];
  try {
    await db.delete(savedProperties).where(inArray(savedProperties.propertyId, seedIds));
  } catch (err) {
    console.warn("Saved properties cleanup note:", err);
  }

  // 2. Delete inquiries for seed properties or demo IDs
  try {
    await db
      .delete(inquiries)
      .where(
        or(
          inArray(inquiries.propertyId, seedIds),
          eq(inquiries.id, "inq-1793179305368"),
          eq(inquiries.id, "inq-1792937630006")
        )
      );
  } catch (err) {
    console.warn("Inquiries cleanup note:", err);
  }

  // 3. Delete seed properties
  try {
    const deletedProps = await db
      .delete(properties)
      .where(or(eq(properties.isSeed, true), inArray(properties.id, seedIds)))
      .returning({ id: properties.id });
    console.log(`Successfully removed ${deletedProps.length} demo properties from database.`);
  } catch (err) {
    console.error("Error deleting seed properties:", err);
    throw err;
  }

  console.log("Demo data purge completed successfully.");
}

main().catch((err) => {
  console.error("Purge script failed:", err);
  process.exit(1);
});
