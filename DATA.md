# KirayLink — Data Architecture & Schema Documentation

This document describes the data architecture, entity models, schema definitions, and persistence mechanisms implemented in KirayLink for the student capstone evaluation.

---

## 1. PostgreSQL Persistence

KirayLink uses Neon PostgreSQL for runtime account, property, saved-property, and inquiry data. The Neon HTTP driver is initialized in `src/lib/db.ts`; server-side data access is implemented in `src/lib/auth.ts`, `src/lib/properties-store.ts`, and `src/lib/dashboard-actions.ts`.

The relational schema is defined in `src/lib/schema.ts`, with versioned SQL migrations in `drizzle/`. Property attributes remain in a typed JSONB document so the current `Property` interface and listing UI stay aligned, while owner, status, and deletion state are stored in indexed columns. Accounts, bookmarks, and inquiries use dedicated tables.

The JSON files in `src/data/` are retained as seed/import sources, not as the live runtime store. `npm run db:setup` applies pending migrations and imports the current bundled properties and JSON records. Inserts are idempotent and do not overwrite records already present in PostgreSQL.

### Local setup

1. Put a rotated Neon pooled connection string in the root `.env.local` as `DATABASE_URL=...`. Keep it server-only; do not use a `NEXT_PUBLIC_` prefix.
2. Run `npm run db:setup` to apply migrations and import the initial data.
3. Run `npm run dev` as usual.

Use the pooled URL for application requests and the direct/unpooled URL for migrations. To change the schema, edit `src/lib/schema.ts`, run `npm run db:generate`, review and commit the generated migration, then use `npm run db:migrate` to apply it.

---

## 2. Entity Relationship Model

```
       +------------------+
       |       USER       |
       |------------------|
       | id (PK)          |
       | email (Unique)   |
       | role (Enum)      |
       +--------+---------+
                |
                | 1:N (owns)
                v
       +------------------+           1:N (receives)
       |     PROPERTY     |<----------------------------+
       |------------------|                             |
       | id (PK)          |                             |
       | landlord.id (FK) |                             |
       | status (Enum)    |                             |
       +--------+---------+                             |
                |                                       |
                | 1:N (bookmarked by)                   |
                v                                       v
       +------------------+                   +-------------------+
       |  SAVED_PROPERTY  |                   |      INQUIRY      |
       |------------------|                   |-------------------|
       | tenantId (FK)    |                   | id (PK)           |
       | propertyId (FK)  |                   | propertyId (FK)   |
       | savedAt          |                   | tenantId (FK)     |
       +------------------+                   | landlordId (FK)   |
                                              | status (Enum)     |
                                              +-------------------+
```

---

## 3. Schema Definitions

### 3.1 User Entity (`src/types/user.ts`)

```typescript
export type UserRole = "tenant" | "landlord" | "admin";

export interface User {
  id: string;               // e.g. "usr-tenant-1", "usr-landlord-1"
  name: string;             // Full name
  email: string;            // Unique email address
  passwordHash: string;     // Irreversible bcrypt hash (salt rounds: 10)
  role: UserRole;           // "tenant" | "landlord" | "admin"
  company?: string;         // Optional agency name (for landlords)
  phone?: string;           // Direct phone contact
  createdAt: string;        // ISO 8601 timestamp
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
}
```

### 3.2 Property Entity (`src/types/property.ts`)

```typescript
export type PropertyType = "Apartment" | "Penthouse" | "Townhouse" | "Villa" | "Studio";
export type PropertyStatus = "available" | "pending" | "rented";

export interface PropertyLandlord {
  id: string;               // References User.id
  name: string;
  phone: string;
  email: string;
  company?: string;
  responseTime: string;     // e.g. "within 2 hours"
}

export interface Property {
  id: string;               // e.g. "prop-1", "prop-custom-1718901234"
  title: string;            // Architectural title
  tagline: string;          // Marketing headline
  description: string;      // Detailed description
  price: number;            // Monthly rent in ETB
  rentPeriod: "month" | "year";
  location: string;         // Street address / landmark
  neighborhood: string;     // Bole, Old Airport, Kazanchis, etc.
  city: string;             // Addis Ababa
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  imageUrl: string;         // Primary preview photo
  images: string[];         // High-res gallery photo URLs
  amenities: string[];      // Verified utility and security features
  featured: boolean;        // Highlighted on homepage
  status: PropertyStatus;   // "available" | "pending" | "rented"
  yearBuilt: number;
  furnished: boolean;
  landlord: PropertyLandlord;
  createdAt: string;        // ISO 8601 timestamp
}
```

### 3.3 Inquiry Entity (`src/types/inquiry.ts`)

```typescript
export type InquiryStatus = "pending" | "reviewed" | "responded";

export interface Inquiry {
  id: string;               // e.g. "inq-1718901234"
  propertyId: string;       // References Property.id
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice?: number;
  tenantId: string;         // References User.id
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  landlordId: string;       // References Landlord User.id
  message: string;
  moveInDate?: string;      // Optional requested lease commencement
  status: InquiryStatus;    // "pending" -> "reviewed" -> "responded"
  createdAt: string;        // ISO 8601 timestamp
}
```

### 3.4 Saved Property Record (`src/data/saved-properties.json`)

```typescript
interface SavedPropertyRecord {
  tenantId: string;         // User.id
  propertyId: string;       // Property.id
  savedAt: string;          // ISO 8601 timestamp
}
```

### 3.5 Property Overrides Record (`src/data/property-overrides.json`)

```typescript
interface OverridesData {
  statusOverrides: Record<string, PropertyStatus>; // propertyId -> "available"|"pending"|"rented"
  deletedIds: string[];                            // array of permanently removed property IDs
}
```

---

## 4. Property Import and Lifecycle

`scripts/setup-database.ts` imports the sample properties in `src/data/properties.ts`, landlord-created records in `src/data/custom-properties.json`, and applies legacy values from `src/data/property-overrides.json`. It also imports account, saved-property, and inquiry JSON data. Existing database records are left unchanged on re-run.

At runtime, `src/lib/properties-store.ts` reads listings from `kiraylink_properties`. Status changes update both the indexed status column and the JSONB object's `status`; deletes are soft deletes so saved-property references remain valid. New landlord listings are inserted directly into PostgreSQL.

---

## 5. Seed Data

The current sample listing catalog is defined in `src/data/properties.ts`. To change which sample listings are initially imported, update that source file before running the setup command. Do not edit `.env.local` into source control or expose the connection string in browser code.
