# KirayLink — Property Rental Platform

KirayLink is a full-stack real estate web application built as a student capstone project. It helps people find rental properties in Addis Ababa, Ethiopia, and connects tenants with verified landlords.

---

## 1. Project Overview & Vision

Finding a rental in Addis Ababa can involve informal brokers, unverified property details, and unclear prices. KirayLink helps by providing:
- **Verified Property Listings**: Apartments, penthouses, villas, and townhouses with details, amenities, and prices in Ethiopian Birr (ETB).
- **Role-Based Workspaces**: Dedicated portals for Tenants, Landlords, and Administrators with strict server-enforced access controls.
- **Direct Inquiries**: Built-in tour scheduling and inquiry lifecycle management between prospective tenants and property managers.
- **Transparent Terms**: Complete visibility into backup generators, water reservoirs, parking, and security protocols.

---

## 2. Technology Stack & Architectural Decisions

KirayLink is developed using modern, production-grade tools aligned with current industry standards:

- **Framework**: [Next.js 16.4.2](https://nextjs.org/) (App Router, Turbopack, Partial Prerendering with `cacheComponents`)
- **UI Library**: [React 19.3.0](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (Strict typing, zero `any` shortcuts)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom architectural design tokens
- **Authentication**: Neon Managed Auth, exposing the Better Auth API through `@neondatabase/auth`
- **Icons**: [Lucide React](https://lucide.dev/) (Strict visual consistency with zero emojis across code, UI, and documentation)
- **Data Layer**: Neon Postgres via Drizzle ORM for user profiles, listings, inquiries, and saved properties.

---

## 3. Accounts

Create tenant and landlord accounts through `/sign-up`. Authentication
credentials and sessions are managed by Neon Auth. The application stores
account roles separately; public registration cannot create administrator
accounts. See [AUTH.md](./AUTH.md) for setup and authorization details.

---

## 4. Local Setup & Installation

### Prerequisites
- Node.js version 18.17.0 or higher (Node.js 20+ LTS recommended)
- npm version 9 or higher

### Step 1: Clone Repository & Install Dependencies
```bash
git clone <repository-url>
cd kiray-link
npm install
```

### Step 2: Configure Neon Auth & Environment Variables
Create a `.env.local` file in the project root:
```bash
cp .env.example .env.local
```

Keep your database connection variables. Deploy the Neon configuration to an
eligible AWS project, confirm Auth is enabled, and provision the public-read
property image bucket declared in `neon.ts`:
```bash
neon deploy
neon neon-auth status
neon env pull
```

`neon env pull` supplies `NEON_AUTH_BASE_URL` for the selected branch. Set a
unique application cookie secret of at least 32 characters in `.env.local`:
```env
NEON_AUTH_COOKIE_SECRET="<generate-a-random-secret>"
```

The same environment pull supplies the branch-scoped S3 credentials needed for
property photo uploads. After provisioning, restart the development server so
it picks up those values. Add the Neon `AWS_*` variables to your hosting
provider's environment when deploying the app.

Set the same cookie secret in your production environment. See
[AUTH.md](./AUTH.md) for details.

### Step 3: Apply the Database Schema
```bash
npm run db:migrate
npm run db:seed
```

### Step 4: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Verification & Testing Commands

To run all automated checks required for grading:

```bash
# 1. TypeScript compilation check (Strict mode)
npx tsc --noEmit

# 2. ESLint code quality & style audit
npm run lint

# 3. Production Turbopack build & Partial Prerender verification
npm run build

# 4. Automated authentication, role, and ownership checks
node scripts/test-capstone-verification.mjs
```

---

## 6. Architecture & Directory Structure

```
kiray-link/
├── public/                 # Static assets and favicon
├── scripts/
│   └── test-capstone-verification.mjs  # Automated auth, role, and ownership checks
├── src/
│   ├── app/                # Next.js App Router routes & layouts
│   │   ├── admin/          # Admin console route (/admin/dashboard)
│   │   ├── api/auth/       # Better Auth proxy and application session routes
│   │   ├── landlord/       # Landlord portal route (/landlord/dashboard)
│   │   ├── listings/       # Public property search & filter catalog (/listings)
│   │   ├── properties/[id] # Dynamic property detail route (/properties/:id)
│   │   ├── sign-in/        # Authentication sign-in page (/sign-in)
│   │   ├── sign-up/        # User registration page (/sign-up)
│   │   ├── tenant/         # Tenant dashboard (/tenant/dashboard)
│   │   ├── globals.css     # Design tokens & Tailwind CSS v4 configuration
│   │   ├── layout.tsx      # Root HTML shell with Navbar, Main, and Footer
│   │   ├── not-found.tsx   # 404 error page
│   │   └── page.tsx        # Homepage (Hero, Search, Featured, Value props)
│   ├── components/         # Reusable presentation & client components
│   │   ├── admin/          # ListingManagement table & metrics
│   │   ├── auth/           # SignInForm & SignUpForm with validation
│   │   ├── home/           # Hero, FeaturedProperties, ValueProps
│   │   ├── landlord/       # MyListings, LandlordInquiries, AddListingModal
│   │   ├── layout/         # Navbar, Footer, Logo, DashboardSidebar
│   │   ├── properties/     # PropertyCard, ListingsClient, PropertyFilters, PropertyGallery, PropertyInquiryForm
│   │   ├── tenant/         # SavedProperties, TenantInquiries, TenantEmptyState
│   │   └── ui/             # Badge, Button, Input design system primitives
│   ├── data/               # Persistent JSON files and sample data
│   │   ├── custom-properties.json   # Landlord-created custom listings
│   │   ├── inquiries.json           # Tenant-submitted rental inquiries
│   │   ├── properties.ts            # Sample property listings
│   │   ├── property-overrides.json  # Status changes and deleted IDs
│   │   ├── saved-properties.json    # Tenant bookmarks
│   │   └── users.json               # Legacy JSON account data
│   ├── lib/                # Core business logic & server actions
│   │   ├── auth.ts         # Application session and role authorization
│   │   ├── dashboard-actions.ts # Server actions for tenant, landlord, and admin
│   │   ├── properties-store.ts  # Unified property resolver (merges base + custom + overrides)
│   │   └── utils.ts        # Currency formatting (ETB), number utilities
│   ├── proxy.ts            # Early authentication redirect for protected routes
│   └── types/              # TypeScript domain types & interfaces
│       ├── inquiry.ts      # Inquiry, InquiryStatus
│       ├── property.ts     # Property, PropertyType, PropertyStatus, Landlord
│       └── user.ts         # User, SessionUser, UserRole
├── AUTH.md                 # Security & Authentication Model Guide
├── DATA.md                 # Data Models & Persistence Architecture
├── PERF.md                 # Performance & Optimization Documentation
├── FUTURE.md               # Deferred Features & Future Roadmap
└── package.json
```

---

## 7. Capstone Evaluation Checklist

- [x] Phase 1: Planning, requirements audit, architecture selection
- [x] Phase 2: Design system foundation, tokens, responsive layout, wordmark
- [x] Phase 3: Public catalog, dynamic search, multi-faceted filtering, detail route, 404 handler
- [x] Phase 4: Neon Managed Better Auth, server-enforced roles, and protected routes
- [x] Phase 5: Role-based dashboards (Tenant, Landlord, Admin), Server Actions, ownership enforcement
- [x] Phase 6: Production build verification, automated testing suite, complete documentation
