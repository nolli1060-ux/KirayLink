import { loadEnvConfig } from "@next/env";
import { getDatabase } from "../src/lib/db";
import { properties, users } from "../src/lib/schema";

loadEnvConfig(process.cwd());

async function main() {
  const db = getDatabase();
  console.log("Verifying KirayLink PostgreSQL database tables...");

  const [existingUsers, existingProperties] = await Promise.all([
    db.select({ id: users.id }).from(users),
    db.select({ id: properties.id }).from(properties),
  ]);

  console.log(
    `Database verified and ready. Current active records: ${existingUsers.length} user accounts, ${existingProperties.length} property listings.`
  );
}

main().catch((error: unknown) => {
  console.error("Database setup check failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
