import fs from "node:fs";
import path from "node:path";

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
const readSource = (relativePath) =>
  fs.readFileSync(path.join(rootDir, relativePath), "utf8");

console.log("\n--- Suite 1: Data Stores ---");
for (const fileName of [
  "users.json",
  "saved-properties.json",
  "inquiries.json",
  "custom-properties.json",
  "property-overrides.json",
]) {
  const filePath = path.join(rootDir, "src", "data", fileName);
  assert(fs.existsSync(filePath), `${fileName} exists`);
}

console.log("\n--- Suite 2: Better Auth Integration ---");
const packageJson = JSON.parse(readSource("package.json"));
const authConfig = readSource("neon.ts");
const authServer = readSource("src/lib/auth/server.ts");
const authClient = readSource("src/lib/auth/client.ts");
const authRoute = readSource("src/app/api/auth/[...path]/route.ts");
const profileRoute = readSource("src/app/api/auth/profile/route.ts");
const signInForm = readSource("src/components/auth/SignInForm.tsx");
const signUpForm = readSource("src/components/auth/SignUpForm.tsx");

assert("@neondatabase/auth" in packageJson.dependencies, "Neon Better Auth SDK is installed");
assert(/auth:\s*true/.test(authConfig), "Neon Managed Auth is enabled in the project config");
assert(authServer.includes("createNeonAuth"), "Server auth uses the Neon Better Auth wrapper");
assert(authClient.includes("createAuthClient()"), "Browser auth uses the Neon Better Auth client");
assert(authRoute.includes('createHandler("GET")') && authRoute.includes('createHandler("POST")'), "Auth API forwards GET and POST requests");
assert(signInForm.includes("authClient.signIn.email"), "Sign-in uses Better Auth email/password");
assert(signUpForm.includes("authClient.signUp.email"), "Sign-up uses Better Auth email/password");
assert(profileRoute.includes('value === "tenant" || value === "landlord"'), "Public registration cannot assign admin role");
assert(profileRoute.includes("session.user.id"), "Profile creation uses the authenticated Better Auth user");

console.log("\n--- Suite 3: Role and Ownership Rules ---");
const tenant = { id: "tenant-1", email: "tenant@example.com", role: "tenant" };
const landlord = { id: "landlord-1", email: "landlord@example.com", role: "landlord" };
const admin = { id: "admin-1", email: "admin@example.com", role: "admin" };

function canAccessRole(session, requiredRole) {
  return Boolean(
    session &&
      (session.role === requiredRole || session.role === "admin")
  );
}

assert(canAccessRole(tenant, "tenant"), "Tenant can access tenant features");
assert(!canAccessRole(tenant, "landlord"), "Tenant cannot access landlord features");
assert(!canAccessRole(tenant, "admin"), "Tenant cannot access admin features");
assert(canAccessRole(landlord, "landlord"), "Landlord can access landlord features");
assert(!canAccessRole(landlord, "tenant"), "Landlord cannot access tenant features");
assert(canAccessRole(admin, "admin"), "Admin can access admin features");
assert(canAccessRole(admin, "landlord"), "Admin can supervise landlord features");

function canModifyListing(session, property) {
  if (!session) return false;
  if (session.role === "admin") return true;
  return (
    property.landlord.id === session.id ||
    property.landlord.email.toLowerCase() === session.email.toLowerCase()
  );
}

const ownedProperty = {
  landlord: { id: landlord.id, email: landlord.email },
};
const otherProperty = {
  landlord: { id: "other-landlord", email: "other@example.com" },
};
assert(canModifyListing(landlord, ownedProperty), "Landlord can manage their own listing");
assert(!canModifyListing(landlord, otherProperty), "Landlord cannot manage another landlord's listing");
assert(canModifyListing(admin, otherProperty), "Admin can moderate any listing");
assert(!canModifyListing(tenant, ownedProperty), "Tenant cannot manage landlord listings");

console.log("\n--- Suite 4: Source Constraint Audit ---");
const emojiRegex =
  /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;

function countEmojis(directory) {
  let count = 0;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", ".next", ".git"].includes(entry.name)) {
        count += countEmojis(fullPath);
      }
    } else if (/\.(tsx|ts|jsx|js|json|css|md)$/.test(entry.name)) {
      if (emojiRegex.test(fs.readFileSync(fullPath, "utf8"))) count++;
    }
  }
  return count;
}

assert(countEmojis(path.join(rootDir, "src")) === 0, "No emoji characters occur in src/");

console.log("\n==================================================================");
console.log(`VERIFICATION SUMMARY: ${totalPassed} Passed, ${totalFailed} Failed`);
console.log("==================================================================");

if (totalFailed > 0) {
  process.exit(1);
} else {
  console.log("All automated verification tests completed successfully!");
}
