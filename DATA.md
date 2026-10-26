# KirayLink — Data Architecture & Schema Documentation

This document describes the data architecture, entity models, schema definitions, and persistence mechanisms implemented in KirayLink for the student capstone evaluation.

---

## 1. Architectural Strategy: Structured File-Based Persistence

For a student capstone project evaluated in diverse testing and oral walkthrough environments, requiring a live PostgreSQL instance, Docker daemon, or paid cloud database introduces evaluation friction and network dependencies.

KirayLink implements a **Structured File-Based Repository Pattern**:
- **Zero External Dependencies**: Evaluators can clone the repo and run it instantly on any operating system without provisioning database instances.
- **Inspectability**: Evaluators can directly inspect `src/data/*.json` to observe state changes, password hashing, and record updates in real time.
- **Atomic File Operations**: Updates use synchronous, blocking file system writes (`fs.writeFileSync`) to prevent race conditions during capstone walkthroughs.
- **Modular Abstraction**: All database calls are contained inside `src/lib/dashboard-actions.ts`, `src/lib/properties-store.ts`, and `src/lib/auth.ts`, allowing an effortless transition to Prisma/PostgreSQL in future production phases.

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

## 4. The Unified Property Resolver

A key architectural design in KirayLink is the **Unified Property Store** (`src/lib/properties-store.ts`).

When querying properties:
1. It loads the 8 sample properties from `src/data/properties.ts`.
2. It loads all landlord-created properties from `src/data/custom-properties.json`.
3. It filters out any IDs listed in `overrides.deletedIds`.
4. It applies any status changes from `overrides.statusOverrides` (e.g. changing an `available` property to `rented`).
5. It returns the merged, deduplicated, authoritative list.

This allows demo listings to remain robust while supporting full dynamic CRUD operations (Create, Read, Update Status, Delete) without mutating static source code.

---

## 5. Sample Listings (Addis Ababa)

The platform includes 8 sample properties in different Addis Ababa neighborhoods:

1. **The Grand Villa** (Old Airport, Addis Ababa)
   - Rent: 450,000 ETB / month | 5 Beds | 6 Baths | 6,500 sq ft | Villa
   - Landlord: Dawit Bekele (`landlord@kiraylink.com`)
2. **Atlas Skyview Penthouse** (Bole Atlas, Addis Ababa)
   - Rent: 280,000 ETB / month | 4 Beds | 4 Baths | 3,800 sq ft | Penthouse
3. **Kazanchis Suite** (Kazanchis, Addis Ababa)
   - Rent: 140,000 ETB / month | 2 Beds | 2 Baths | 1,650 sq ft | Apartment
4. **Sarbet Heritage Residence** (Sarbet, Addis Ababa)
   - Rent: 320,000 ETB / month | 4 Beds | 4 Baths | 4,200 sq ft | Townhouse
   - Landlord: Dawit Bekele (`landlord@kiraylink.com`)
5. **Bole Rwanda Contemporary Villa** (Bole Rwanda, Addis Ababa)
   - Rent: 380,000 ETB / month | 4 Beds | 5 Baths | 5,100 sq ft | Villa
6. **Bole Medhanialem Apartment** (Bole, Addis Ababa)
   - Rent: 115,000 ETB / month | 2 Beds | 2 Baths | 1,450 sq ft | Apartment
7. **CMC Townhouse** (CMC, Addis Ababa)
   - Rent: 210,000 ETB / month | 3 Beds | 3 Baths | 2,900 sq ft | Townhouse
   - Landlord: Dawit Bekele (`landlord@kiraylink.com`)
8. **Summit Villa** (Summit, Addis Ababa)
   - Rent: 290,000 ETB / month | 4 Beds | 4 Baths | 4,000 sq ft | Villa
