import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { eq, or } from "drizzle-orm";
import { getDatabase } from "../src/lib/db";
import { users, properties, inquiries, savedProperties } from "../src/lib/schema";
import {
  getAllActiveProperties,
  getActivePropertyById,
  createPropertyRecord,
  updatePropertyRecord,
  setPropertyStatus,
  deletePropertyRecord,
} from "../src/lib/properties-store";
import type { Property } from "../src/types/property";

loadEnvConfig(process.cwd());

console.log("==================================================================");
console.log("       KIRAYLINK REAL USER PLATFORM AUTOMATED VERIFICATION        ");
console.log("==================================================================");

let passed = 0;
let failed = 0;

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`  [PASS] ${description}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${description}`);
    failed++;
  }
}

const secretKey = new TextEncoder().encode(
  process.env.AUTH_SECRET || "kiraylink-luxury-rentals-dev-secret-key-2026-secure-32ch"
);

async function runTests() {
  const db = getDatabase();

  const testTenantEmail = `test_tenant_${Date.now()}@example.com`;
  const testLandlordEmail = `test_landlord_${Date.now()}@example.com`;
  const testPassword = "RealUserSecurePassword2026!";
  const passwordHash = bcrypt.hashSync(testPassword, 10);

  const testTenantId = `usr-tenant-${Date.now()}`;
  const testLandlordId = `usr-landlord-${Date.now()}`;
  const testPropertyId = `prop-test-${Date.now()}`;
  const testInquiryId = `inq-test-${Date.now()}`;

  console.log("\n--- Suite 1: Real User Registration & Cryptography ---");

  // 1. Register landlord in PostgreSQL
  await db.insert(users).values({
    id: testLandlordId,
    name: "Dawit Real Landlord",
    email: testLandlordEmail,
    emailNormalized: testLandlordEmail.toLowerCase().trim(),
    passwordHash,
    role: "landlord",
    phone: "+251911223344",
    company: "Addis Real Estate Group",
    createdAt: new Date().toISOString(),
  });

  const [registeredLandlord] = await db
    .select()
    .from(users)
    .where(eq(users.id, testLandlordId));

  assert(!!registeredLandlord, "Real landlord registered and retrieved from PostgreSQL");
  assert(
    bcrypt.compareSync(testPassword, registeredLandlord.passwordHash),
    "Password verified successfully against Bcrypt hash"
  );
  assert(
    !bcrypt.compareSync("WrongPassword123", registeredLandlord.passwordHash),
    "Incorrect password correctly rejected"
  );

  // 2. Register tenant in PostgreSQL
  await db.insert(users).values({
    id: testTenantId,
    name: "Selam Real Tenant",
    email: testTenantEmail,
    emailNormalized: testTenantEmail.toLowerCase().trim(),
    passwordHash,
    role: "tenant",
    phone: "+251922334455",
    createdAt: new Date().toISOString(),
  });

  const [registeredTenant] = await db
    .select()
    .from(users)
    .where(eq(users.id, testTenantId));
  assert(!!registeredTenant, "Real tenant registered and retrieved from PostgreSQL");

  // 3. Test Session JWT Lifecycle
  const token = await new SignJWT({
    id: registeredLandlord.id,
    name: registeredLandlord.name,
    email: registeredLandlord.email,
    role: registeredLandlord.role,
    phone: registeredLandlord.phone,
    company: registeredLandlord.company,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  assert(typeof token === "string" && token.split(".").length === 3, "Cryptographic session token generated with 3 components");

  const { payload } = await jwtVerify(token, secretKey);
  assert(payload.id === testLandlordId && payload.role === "landlord", "JWT token verified and claims extracted securely");

  console.log("\n--- Suite 2: Real Property Submission, Edit & Image Association ---");

  const newProperty: Property = {
    id: testPropertyId,
    title: "Brand New 2-Bedroom Condo in Bole",
    tagline: "Modern apartment with elevator and balcony",
    description: "Spacious brand new residence with dedicated parking, water tank, and 24/7 security.",
    price: 32000,
    rentPeriod: "month",
    region: "Addis Ababa",
    city: "Addis Ababa",
    location: "Near Atlas Hotel, Namibia Street",
    neighborhood: "Bole",
    propertyType: "Condominium",
    bedrooms: 2,
    bathrooms: 2,
    care: 85,
    imageUrl: "/images/properties/prop_1_cover.jpg",
    images: ["/images/properties/prop_1_cover.jpg", "/images/properties/prop_1_living.jpg"],
    amenities: ["24/7 Security", "Dedicated Water Reservoir", "Balcony"],
    featured: false,
    status: "available",
    yearBuilt: 2026,
    furnished: true,
    landlord: {
      id: testLandlordId,
      name: registeredLandlord.name,
      email: registeredLandlord.email,
      phone: registeredLandlord.phone || "+251911223344",
      company: registeredLandlord.company || "Independent Landlord",
      responseTime: "within 24 hours",
    },
    createdAt: new Date().toISOString(),
  };

  await createPropertyRecord(newProperty);

  const activeListings = await getAllActiveProperties();
  assert(
    activeListings.some((p) => p.id === testPropertyId),
    "Newly created property returned in active listings query"
  );

  const fetchedProperty = await getActivePropertyById(testPropertyId);
  assert(!!fetchedProperty, "Property created and retrieved from database");
  assert(fetchedProperty?.landlord.id === testLandlordId, "Property correctly associated with registered landlord");
  assert(fetchedProperty?.images.length === 2, "Multiple uploaded photograph references stored with property");
  assert(fetchedProperty?.imageUrl === "/images/properties/prop_1_cover.jpg", "Primary cover photograph preserved");

  // 4. Test Property Update / Edit
  const updatedProperty: Property = {
    ...newProperty,
    title: "Updated 2-Bedroom Luxury Condo in Bole",
    price: 35000,
  };
  const updateSuccess = await updatePropertyRecord(updatedProperty);
  assert(updateSuccess, "Property details edited and persisted to database");

  const reFetchedProp = await getActivePropertyById(testPropertyId);
  assert(reFetchedProp?.price === 35000 && reFetchedProp?.title.includes("Luxury"), "Updated price and title verified in database");

  // 5. Test Property Status Update
  await setPropertyStatus(testPropertyId, "rented");
  const rentedProp = await getActivePropertyById(testPropertyId);
  assert(rentedProp?.status === "rented", "Property status changed to 'rented'");

  console.log("\n--- Suite 3: Tenant Inquiry & Saved Residences ---");

  // 6. Save property by tenant
  await db.insert(savedProperties).values({
    tenantId: testTenantId,
    propertyId: testPropertyId,
    savedAt: new Date().toISOString(),
  });

  const [savedRow] = await db
    .select()
    .from(savedProperties)
    .where(eq(savedProperties.tenantId, testTenantId));
  assert(!!savedRow && savedRow.propertyId === testPropertyId, "Tenant saved property bookmark in database");

  // 7. Submit tenant inquiry
  const newInquiry = {
    id: testInquiryId,
    propertyId: testPropertyId,
    propertyTitle: updatedProperty.title,
    propertyLocation: updatedProperty.location,
    propertyPrice: updatedProperty.price,
    tenantId: testTenantId,
    tenantName: registeredTenant.name,
    tenantEmail: registeredTenant.email,
    tenantPhone: registeredTenant.phone || "+251922334455",
    landlordId: testLandlordId,
    message: "I am interested in scheduling a tour of this residence.",
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  };

  await db.insert(inquiries).values({
    id: newInquiry.id,
    propertyId: newInquiry.propertyId,
    tenantId: newInquiry.tenantId,
    landlordId: newInquiry.landlordId,
    status: newInquiry.status,
    data: newInquiry,
    createdAt: newInquiry.createdAt,
  });

  const [inquiryRow] = await db
    .select()
    .from(inquiries)
    .where(eq(inquiries.id, testInquiryId));
  assert(!!inquiryRow, "Tenant inquiry submitted and persisted in database");
  assert(inquiryRow.landlordId === testLandlordId, "Inquiry routed to landlord ID");

  console.log("\n--- Suite 4: Property Deletion & Cleanup ---");

  // 8. Soft-delete property
  const deleteSuccess = await deletePropertyRecord(testPropertyId);
  assert(deleteSuccess, "Property soft-deleted successfully");

  const deletedCheck = await getActivePropertyById(testPropertyId);
  assert(!deletedCheck, "Soft-deleted property no longer appears in active queries");

  // Cleanup test artifacts
  await db.delete(savedProperties).where(eq(savedProperties.tenantId, testTenantId));
  await db.delete(inquiries).where(eq(inquiries.id, testInquiryId));
  await db.delete(properties).where(eq(properties.id, testPropertyId));
  await db.delete(users).where(or(eq(users.id, testTenantId), eq(users.id, testLandlordId)));

  console.log("  [INFO] Test records cleaned up from database.");

  console.log("\n==================================================================");
  console.log(`VERIFICATION SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("All real user-based platform tests passed successfully!");
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
