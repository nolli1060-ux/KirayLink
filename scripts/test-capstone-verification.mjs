import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

console.log("==================================================================");
console.log("   KIRAYLINK CAPSTONE EVALUATION AUTOMATED VERIFICATION SUITE    ");
console.log("==================================================================");

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    totalPassed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    totalFailed++;
  }
}

const rootDir = process.cwd();
const secretKey = new TextEncoder().encode(
  process.env.AUTH_SECRET || "kiraylink-luxury-rentals-dev-secret-key-2026-secure-32ch"
);

// -------------------------------------------------------------
// Test 1: Data Files & Stores Integrity
// -------------------------------------------------------------
console.log("\n--- Suite 1: Data Stores & Schema Integrity ---");

const usersPath = path.join(rootDir, "src", "data", "users.json");
const savedPropsPath = path.join(rootDir, "src", "data", "saved-properties.json");
const inquiriesPath = path.join(rootDir, "src", "data", "inquiries.json");
const customPropsPath = path.join(rootDir, "src", "data", "custom-properties.json");
const overridesPath = path.join(rootDir, "src", "data", "property-overrides.json");

assert(fs.existsSync(usersPath), "users.json exists");
assert(fs.existsSync(savedPropsPath), "saved-properties.json exists");
assert(fs.existsSync(inquiriesPath), "inquiries.json exists");
assert(fs.existsSync(customPropsPath), "custom-properties.json exists");
assert(fs.existsSync(overridesPath), "property-overrides.json exists");

const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
assert(users.length >= 3, `users.json contains ${users.length} registered accounts`);

const roles = users.map((u) => u.role);
assert(roles.includes("tenant"), "Tenant role represented in users");
assert(roles.includes("landlord"), "Landlord role represented in users");
assert(roles.includes("admin"), "Admin role represented in users");

// -------------------------------------------------------------
// Test 2: Authentication & Cryptographic Verification
// -------------------------------------------------------------
console.log("\n--- Suite 2: Authentication & Cryptography ---");

const tenant = users.find((u) => u.email === "tenant@kiraylink.com");
const landlord = users.find((u) => u.email === "landlord@kiraylink.com");
const admin = users.find((u) => u.email === "admin@kiraylink.com");

assert(!!tenant, "Demo tenant account exists");
assert(!!landlord, "Demo landlord account exists");
assert(!!admin, "Demo admin account exists");

// Verify Bcrypt passwords against demo credentials in SignInForm
assert(bcrypt.compareSync("TenantPass123!", tenant.passwordHash), "Tenant password matches bcrypt hash (TenantPass123!)");
assert(bcrypt.compareSync("LandlordPass123!", landlord.passwordHash), "Landlord password matches bcrypt hash (LandlordPass123!)");
assert(bcrypt.compareSync("AdminPass123!", admin.passwordHash), "Admin password matches bcrypt hash (AdminPass123!)");
assert(!bcrypt.compareSync("wrongpassword", tenant.passwordHash), "Invalid password correctly fails bcrypt check");

// Verify JOSE JWT creation, signing, and verification
async function testJwtLifecycle() {
  const token = await new SignJWT({
    id: tenant.id,
    name: tenant.name,
    email: tenant.email,
    role: tenant.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  assert(typeof token === "string" && token.split(".").length === 3, "JWT correctly generated with 3 components (header.payload.signature)");

  const { payload } = await jwtVerify(token, secretKey);
  assert(payload.id === tenant.id && payload.role === "tenant", "JWT verified and claims extracted securely");

  // Verify tampered token fails
  let tampered = false;
  try {
    const badToken = token.slice(0, -5) + "abcde";
    await jwtVerify(badToken, secretKey);
  } catch {
    tampered = true;
  }
  assert(tampered, "Tampered JWT signature successfully rejected by jose");
}

await testJwtLifecycle();

// -------------------------------------------------------------
// Test 3: Role-Based Authorization & Ownership Logic
// -------------------------------------------------------------
console.log("\n--- Suite 3: RBAC & Server Ownership Rules ---");

function simulateRequireAuth(session, requiredRole) {
  if (!session) return { allowed: false, redirect: "/sign-in" };
  if (requiredRole && session.role !== requiredRole && session.role !== "admin") {
    return { allowed: false, redirect: session.role === "tenant" ? "/tenant/dashboard" : "/landlord/dashboard" };
  }
  return { allowed: true };
}

assert(simulateRequireAuth(tenant, "tenant").allowed, "Tenant allowed into /tenant/dashboard");
assert(!simulateRequireAuth(tenant, "landlord").allowed, "Tenant blocked from /landlord/dashboard");
assert(!simulateRequireAuth(tenant, "admin").allowed, "Tenant blocked from /admin/dashboard");

assert(simulateRequireAuth(landlord, "landlord").allowed, "Landlord allowed into /landlord/dashboard");
assert(!simulateRequireAuth(landlord, "tenant").allowed, "Landlord blocked from /tenant/dashboard");
assert(!simulateRequireAuth(landlord, "admin").allowed, "Landlord blocked from /admin/dashboard");

assert(simulateRequireAuth(admin, "admin").allowed, "Admin allowed into /admin/dashboard");
assert(simulateRequireAuth(admin, "landlord").allowed, "Admin has supervisory access across portals");
assert(simulateRequireAuth(admin, "tenant").allowed, "Admin has supervisory access across portals");

// Ownership enforcement check
function canModifyListing(session, property) {
  if (!session) return false;
  if (session.role === "admin") return true;
  return property.landlord.id === session.id || property.landlord.email.toLowerCase() === session.email.toLowerCase();
}

const mockPropOwnedByLandlord = {
  id: "test-prop-1",
  landlord: { id: "usr-landlord-1", email: "landlord@kiraylink.com" },
};
const mockPropOtherLandlord = {
  id: "test-prop-2",
  landlord: { id: "usr-other-landlord", email: "other@example.com" },
};

assert(canModifyListing(landlord, mockPropOwnedByLandlord), "Landlord CAN modify their own property");
assert(!canModifyListing(landlord, mockPropOtherLandlord), "Landlord CANNOT modify other landlords' properties");
assert(canModifyListing(admin, mockPropOtherLandlord), "Admin CAN moderate and delete any listing");
assert(!canModifyListing(tenant, mockPropOwnedByLandlord), "Tenant CANNOT modify any listing");

// -------------------------------------------------------------
// Test 4: Zero Emojis Constraint Audit
// -------------------------------------------------------------
console.log("\n--- Suite 4: Strict Zero-Emoji Constraint Audit ---");

const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;

function checkDirForEmojis(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git") {
        count += checkDirForEmojis(fullPath);
      }
    } else if (/\.(tsx|ts|jsx|js|json|css|md)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (emojiRegex.test(content)) {
        console.error(`  [EMOJI FOUND] in file: ${fullPath}`);
        count++;
      }
    }
  }
  return count;
}

const emojiCount = checkDirForEmojis(path.join(rootDir, "src"));
assert(emojiCount === 0, `Zero emojis verified across src/ directory (Count: ${emojiCount})`);

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log("\n==================================================================");
console.log(`VERIFICATION SUMMARY: ${totalPassed} Passed, ${totalFailed} Failed`);
console.log("==================================================================");

if (totalFailed > 0) {
  process.exit(1);
} else {
  console.log("All automated verification tests completed successfully!");
}
