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
- **Authentication**: Standard maintained cryptography via [bcryptjs](https://www.npmjs.com/package/bcryptjs) and [jose](https://www.npmjs.com/package/jose)
- **Icons**: [Lucide React](https://lucide.dev/) (Strict visual consistency with zero emojis across code, UI, and documentation)
- **Data Layer**: Structured, persistent JSON file-based repository supporting atomic read/write operations without external database overhead for evaluation portability.

---

## 3. Pre-Configured Demo Accounts

For oral evaluations and examiner walkthroughs, the system includes three pre-seeded accounts representing each user role:

| Role | Email Address | Password | Permissions & Portal |
| :--- | :--- | :--- | :--- |
| **Tenant** | `tenant@kiraylink.com` | `TenantPass123!` | Save residences, dispatch rental inquiries, view personal inquiry history. Route: `/tenant/dashboard` |
| **Landlord** | `landlord@kiraylink.com` | `LandlordPass123!` | Create residences, update listing status, review incoming tenant inquiries. Route: `/landlord/dashboard` |
| **Admin** | `admin@kiraylink.com` | `AdminPass123!` | Super-admin access: moderate all listings, platform metrics, force status changes or deletions. Route: `/admin/dashboard` |

*Note: You can also register fresh tenant or landlord accounts via the `/sign-up` interface. New accounts display realistic empty states without fabricated data.*

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

### Step 2: Configure Environment Variables
Create a `.env.local` file in the project root:
```bash
cp .env.example .env.local
```
Inside `.env.local`, specify your local authentication secret:
```env
AUTH_SECRET="kiraylink-luxury-rentals-dev-secret-key-2026-secure-32ch"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Run the Development Server
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

# 4. Automated capstone verification test suite (33 assertions)
node scripts/test-capstone-verification.mjs
```

---

## 6. Architecture & Directory Structure

```
kiray-link/
├── public/                 # Static assets and favicon
├── scripts/
│   └── test-capstone-verification.mjs  # Automated 33-point capstone test suite
├── src/
│   ├── app/                # Next.js App Router routes & layouts
│   │   ├── admin/          # Admin console route (/admin/dashboard)
│   │   ├── api/auth/       # Auth session API route (/api/auth/session)
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
│   │   └── users.json               # Registered accounts with bcrypt password hashes
│   ├── lib/                # Core business logic & server actions
│   │   ├── auth.ts         # Session management, bcrypt verification, JWT signing
│   │   ├── dashboard-actions.ts # Server actions for tenant, landlord, and admin
│   │   ├── properties-store.ts  # Unified property resolver (merges base + custom + overrides)
│   │   └── utils.ts        # Currency formatting (ETB), number utilities
│   ├── middleware.ts       # Edge route protection & RBAC redirect gatekeeper
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
- [x] Phase 4: Maintained auth with `jose` & `bcryptjs`, HTTP-only session cookies, RBAC route protection
- [x] Phase 5: Role-based dashboards (Tenant, Landlord, Admin), Server Actions, ownership enforcement
- [x] Phase 6: Production build verification, automated testing suite, complete documentation
