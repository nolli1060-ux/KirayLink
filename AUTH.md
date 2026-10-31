# Authentication and authorization

KirayLink uses Neon Managed Auth, which exposes Better Auth's email/password
methods through `@neondatabase/auth`. Neon stores credentials and sessions in
the branch's managed `neon_auth` schema. The application does not create its
own password hashes or authentication cookies.

## Setup

`neon.ts` enables Managed Auth. Deploy that configuration to an eligible Neon
AWS project that does not use IP Allow or Private Networking, then pull the
branch environment:

```bash
neon deploy
neon neon-auth status
neon env pull
```

Set `NEON_AUTH_COOKIE_SECRET` to a unique secret of at least 32 characters in
`.env.local` and in the production environment. For local generation:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

`NEON_AUTH_BASE_URL` is supplied by the Neon branch after Auth is enabled.
Keep `DATABASE_URL` configured for the KirayLink application data. Apply the
Drizzle migration before registering users so the role/profile table allows
managed auth accounts without storing a second password hash.

## Sign-up, sessions, and roles

- Sign-up and sign-in use the Managed Better Auth browser client.
- `src/app/api/auth/[...path]/route.ts` forwards Better Auth requests to Neon.
- `src/proxy.ts` provides an early redirect for protected dashboards. It is an
  optimistic check only; server pages and actions still enforce authorization.
- `kiraylink_users` stores application profile data and the tenant, landlord,
  or admin role. The profile endpoint only permits tenant and landlord roles
  during public registration. Admin roles must be assigned through a trusted
  administrative process.
- `getSession()` resolves the Better Auth user and the corresponding
  application profile. Server actions continue to use this session and enforce
  role and ownership checks before protected operations.
- Sign-out calls Managed Better Auth, and `/api/auth/session` provides the
  application session summary used by the navigation UI.

Existing credentials created by the former local password implementation are
not imported into Managed Auth. Existing application records retain their
legacy IDs, so a trusted migration must link those profiles to Managed Auth
accounts before affected users can use the app. Do not link profiles solely by
an unverified email address.
