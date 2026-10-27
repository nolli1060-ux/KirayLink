# KirayLink Authentication

## 1. Authentication

KirayLink uses Better Auth for sign-up, sign-in, and session management. Authentication is configured in `lib/auth.ts` using Drizzle and the project's database.

Users can register as tenants or landlords. Admin access is separate and must not be granted through public sign-up.

## 2. Protected Routes

- `/dashboard/*` — requires a valid session.
- `/admin/*` — requires a valid session and admin role.

## 3. Security

| File | Purpose |
|---|---|
| `lib/auth.ts` | Configures authentication |
| `proxy.ts` | Checks for an authentication cookie |
| `lib/dal.ts` | Verifies sessions and admin access |
| `lib/safe-next.ts` | Prevents unsafe redirect paths |

The proxy provides an initial check. Server-side code must still verify the session and check permissions before sensitive actions.

## 4. Security Testing

| Test | Expected result |
|---|---|
| Open the dashboard while signed out | Redirect to sign-in |
| Open an admin page as a normal user | Access denied |
| Submit a sensitive action while signed out | Request rejected |
| Edit another user's property | Request rejected |
| Use an unsafe redirect URL | Redirect to `/dashboard` |

The dashboard redirect has been tested locally. The other tests must be verified before they are reported as passed.

## 5. Admin Account

No admin account is created by this branch. An administrator must be provisioned through a trusted process, not through public sign-up.
