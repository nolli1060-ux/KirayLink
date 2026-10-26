# KirayLink — Authentication & Security Architecture

This document provides a comprehensive technical overview of the security, authentication, and authorization model implemented in KirayLink for the student capstone evaluation.

---

## 1. Security Philosophy & Threat Model

In modern web development, relying on client-side security is an anti-pattern. KirayLink adheres strictly to the following principles:

1. **Zero Trust in Browser Input**: The server never trusts a user ID, role, or ownership flag provided by the browser. Every mutation verifies the caller's identity via cryptographic session inspection.
2. **No `localStorage` or `sessionStorage` Tokens**: Storing JWT tokens in client-accessible storage exposes them to Cross-Site Scripting (XSS) attacks. An injected script can access `localStorage.getItem("token")` and exfiltrate credentials. KirayLink transmits session tokens exclusively in **HTTP-only cookies** that browser JavaScript cannot read.
3. **No Homebrew Cryptography**: All hashing, signing, and verification procedures use battle-tested, maintained libraries: `bcryptjs` and `jose`.
4. **Defense in Depth**: Access control is enforced at two distinct boundaries:
   - **Edge Boundary**: Next.js Edge Middleware (`src/middleware.ts`) checks token presence and role authorization before rendering routes.
   - **Action Boundary**: Server Actions (`requireAuth()`, `getSession()`) re-verify authorization and ownership immediately prior to executing any mutation or querying protected data.

---

## 2. Cryptographic Implementation Details

### Password Hashing (`bcryptjs`)
- **Algorithm**: Blowfish-based adaptive hashing with configurable work factor.
- **Salt Rounds**: 10 rounds. Each password generation includes a unique, cryptographically random salt.
- **Timing Attack Resistance**: `bcrypt.compareSync()` performs comparisons in consistent time to prevent timing attacks.
- **Storage**: Plain-text passwords are never stored in memory or on disk. Only the resulting 60-character bcrypt hash is written to `users.json`.

```typescript
// Registration hashing:
const passwordHash = bcrypt.hashSync(password, 10);

// Authentication verification:
const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
```

### Session Token Signing (`jose`)
- **Standard**: RFC 7519 JSON Web Token (JWT).
- **Algorithm**: `HS256` (HMAC using SHA-256).
- **Signing Secret**: Resolved from the server environment variable `AUTH_SECRET` (minimum 32 characters).
- **Token Claims**:
  - `id`: Unique user identifier (e.g. `usr-tenant-1`).
  - `name`: User full name.
  - `email`: Authenticated email address.
  - `role`: Normalized role string (`tenant` | `landlord` | `admin`).
  - `company`: Optional property agency or company name.
  - `iat`: Issued-at timestamp.
  - `exp`: Expiration timestamp (strictly set to 7 days).

```typescript
// Token Generation (src/lib/auth.ts):
export async function createSessionToken(user: SessionUser): Promise<string> {
  const secretKey = getSecretKey();
  return await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}
```

---

## 3. Cookie Configuration

Session tokens are stored in an HTTP cookie named `kiraylink_session` with the following attributes:

| Cookie Attribute | Configuration | Security Justification |
| :--- | :--- | :--- |
| `httpOnly` | `true` | Prevents client-side scripts from reading or stealing the session token via XSS. |
| `secure` | `process.env.NODE_ENV === "production"` | Ensures the cookie is only transmitted over encrypted HTTPS connections in production. |
| `sameSite` | `"lax"` | Mitigates Cross-Site Request Forgery (CSRF) attacks by withholding the cookie on cross-site requests. |
| `path` | `"/"` | Scopes the session token across the entire application domain. |
| `maxAge` | `604,800` (7 days) | Enforces automatic session expiration on the client device. |

---

## 4. Role-Based Access Control (RBAC) Matrix

| Route | Minimum Role Required | Unauthenticated Behavior | Unauthorized Role Behavior |
| :--- | :--- | :--- | :--- |
| `/` | Public | Allowed | Allowed |
| `/listings` | Public | Allowed | Allowed |
| `/properties/:id` | Public | Allowed | Allowed |
| `/sign-in` | Public (Guest) | Allowed | Redirected to appropriate dashboard if already logged in |
| `/sign-up` | Public (Guest) | Allowed | Redirected to appropriate dashboard if already logged in |
| `/tenant/dashboard` | `tenant` | Redirected to `/sign-in?redirect=/tenant/dashboard` | Landlords and Admins redirected to their respective dashboards |
| `/landlord/dashboard`| `landlord` | Redirected to `/sign-in?redirect=/landlord/dashboard` | Tenants redirected to `/tenant/dashboard`; Admins granted supervisory access |
| `/admin/dashboard` | `admin` | Redirected to `/sign-in?redirect=/admin/dashboard` | Both Tenants and Landlords blocked and redirected to their own portals |

---

## 5. Server-Side Ownership Enforcement

Beyond role checks, listing management requires strict ownership enforcement. A landlord cannot edit or delete another landlord's listing simply by tampering with request payloads.

```typescript
// Excerpt from src/lib/dashboard-actions.ts:
export async function deletePropertyAction(propertyId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }

  const property = getActivePropertyById(propertyId);
  if (!property) {
    return { success: false, error: "Property not found." };
  }

  // Strict ownership check:
  const isOwner =
    property.landlord.id === session.id ||
    property.landlord.email.toLowerCase() === session.email.toLowerCase();
  const isAdmin = session.role === "admin";

  if (!isOwner && !isAdmin) {
    return {
      success: false,
      error: "Forbidden: You do not have permission to delete this listing.",
    };
  }

  // Proceed with deletion...
}
```

---

## 6. Open Redirect Protection

When a user attempts to access a protected route while unauthenticated, they are redirected to `/sign-in?redirect=<encoded-path>`.

To prevent attackers from crafting malicious URLs that redirect users to phishing sites (e.g., `/sign-in?redirect=https://evil-phishing.com`), the sign-in action validates that the destination strictly begins with a relative `/` before navigating:

```typescript
// Safe return path validation:
let destination = returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//") ? returnUrl : "";
if (!destination) {
  if (user.role === "landlord") destination = "/landlord/dashboard";
  else if (user.role === "admin") destination = "/admin/dashboard";
  else destination = "/tenant/dashboard";
}
```

---

## 7. Environment Variables & Secrets Management

The application requires an `AUTH_SECRET` environment variable for cryptographic token operations.

### Local Development (`.env.local`):
```env
AUTH_SECRET="kiraylink-luxury-rentals-dev-secret-key-2026-secure-32ch"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Production Deployment (e.g. Vercel, Node server):
- `AUTH_SECRET`: Generate a random 64-character hexadecimal or base64 string using `openssl rand -base64 32`.
- Never commit `.env.local` to version control. An example file `.env.example` is provided with dummy placeholders.
