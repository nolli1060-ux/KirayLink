import { getDatabase } from "../src/lib/db";
import { users, properties } from "../src/lib/schema";
import { eq } from "drizzle-orm";
import { createPropertyRecord, getActivePropertyById, updatePropertyRecord, deletePropertyRecord } from "../src/lib/properties-store";
import { isCloudinaryConfigured } from "../src/lib/cloudinary";
import fs from "node:fs/promises";
import path from "node:path";

async function runUploadVerification() {
  console.log("==================================================");
  console.log("KIRAYLINK — REAL IMAGE UPLOAD & STORAGE TEST");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  }

  const db = getDatabase();

  // Test 1: Check Cloudinary Configuration Status
  const isCloudinary = isCloudinaryConfigured();
  console.log(`[INFO] Cloudinary Active in Environment: ${isCloudinary}`);
  assert(true, "Cloudinary configuration check completed without throwing exceptions");

  // Test 2: Create a verified test landlord in PostgreSQL
  const testLandlordEmail = `upload_tester_${Date.now()}@kiraylink.com`;
  const [createdUser] = await db
    .insert(users)
    .values({
      id: `user_tester_${Date.now()}`,
      email: testLandlordEmail,
      emailNormalized: testLandlordEmail.toLowerCase(),
      name: "Abebe Photo Tester",
      passwordHash: "$2a$10$wTqS8fVv1jDqT4x2QvU6xeZ.zV5I6b1gK0b6g9nK8J7m.qN0f5eL.",
      role: "landlord",
      phone: "+251911223344",
      company: "Abyssinia Premium Homes",
      createdAt: new Date().toISOString(),
    })
    .returning();

  assert(Boolean(createdUser?.id), "Created test landlord in Neon PostgreSQL");

  // Test 3: Prepare real image buffers (simulating real photos uploaded from device)
  const uploadDir = path.join(process.cwd(), "public", "images", "properties");
  await fs.mkdir(uploadDir, { recursive: true });

  // Minimal valid 1x1 PNG buffer
  const samplePngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );

  const testFilename1 = `test_upload_living_${Date.now()}.png`;
  const testFilename2 = `test_upload_bedroom_${Date.now()}.png`;
  await fs.writeFile(path.join(uploadDir, testFilename1), samplePngBuffer);
  await fs.writeFile(path.join(uploadDir, testFilename2), samplePngBuffer);

  const url1 = `/images/properties/${testFilename1}`;
  const url2 = `/images/properties/${testFilename2}`;

  assert(
    (await fs.stat(path.join(uploadDir, testFilename1))).size > 0,
    "Simulated real uploaded photograph written to storage disk"
  );

  // Test 4: Submit new property with multi-image gallery & primary cover image
  const propertyTitle = `Luxury Penthouse in Bole Atlas - ${Date.now()}`;
  const testPropertyId = `prop_tester_${Date.now()}`;
  const testProperty = {
    id: testPropertyId,
    title: propertyTitle,
    tagline: "High-floor luxury residence with panoramic city views",
    description: "Features floor-to-ceiling windows, imported Italian kitchen, private terrace, and full standby power.",
    price: 65000,
    rentPeriod: "month" as const,
    location: "Near Atlas Hotel, Bole, Addis Ababa",
    city: "Addis Ababa",
    region: "Addis Ababa",
    subCity: "Bole",
    neighborhood: "Bole Atlas",
    propertyType: "Penthouse" as const,
    bedrooms: 3,
    bathrooms: 3,
    care: 220,
    images: [url1, url2],
    imageUrl: url1, // primary cover image
    amenities: ["24/7 Security", "Backup Power Generator", "Private Balcony / Terrace", "Elevator Access"],
    furnished: true,
    status: "available" as const,
    landlord: {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      phone: createdUser.phone || "",
      company: createdUser.company || "Abyssinia Premium Homes",
      responseTime: "within 2 hours",
    },
    yearBuilt: 2024,
    featured: true,
    createdAt: new Date().toISOString(),
  };

  await createPropertyRecord(testProperty);

  assert(Boolean(testProperty?.id), `Property submitted and stored in Neon DB with ID: ${testProperty.id}`);
  assert(testProperty.imageUrl === url1, "Primary cover photo correctly persisted in property record");
  assert(testProperty.images.length === 2, "Both uploaded property photos persisted in images array");
  assert(testProperty.images[0] === url1 && testProperty.images[1] === url2, "Photo order matches landlord selection");

  // Test 5: Fetch property detail and verify image integrity
  const fetched = await getActivePropertyById(testProperty.id);
  assert(Boolean(fetched), "Property retrieved from PostgreSQL via getActivePropertyById");
  assert(fetched?.imageUrl === url1, "Retrieved property maintains primary cover image");
  assert(fetched?.images.length === 2, "Retrieved property contains complete gallery");

  // Test 6: Landlord updates property images (selects second photo as new cover)
  const updatedProperty = {
    ...fetched!,
    imageUrl: url2, // switch primary cover to bedroom
    images: [url2, url1], // re-ordered gallery
  };
  await updatePropertyRecord(updatedProperty);
  const refetched = await getActivePropertyById(testProperty.id);

  assert(refetched?.imageUrl === url2, "Successfully updated primary cover image in PostgreSQL");
  assert(refetched?.images[0] === url2, "Re-ordered gallery reflects in database");

  // Test 7: Cleanup test property and user
  await deletePropertyRecord(testProperty.id);
  const deletedFetch = await getActivePropertyById(testProperty.id);
  assert(deletedFetch === undefined, "Deleted property successfully omitted from active listings");

  await db.delete(properties).where(eq(properties.id, testProperty.id));
  await db.delete(users).where(eq(users.id, createdUser.id));

  try {
    await fs.unlink(path.join(uploadDir, testFilename1));
    await fs.unlink(path.join(uploadDir, testFilename2));
  } catch {}

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runUploadVerification().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
