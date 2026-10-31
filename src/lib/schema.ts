import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";
import type { Property, PropertyStatus } from "@/types/property";
import type { UserRole } from "@/types/user";

export const users = pgTable(
  "kiraylink_users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailNormalized: text("email_normalized").notNull(),
    passwordHash: text("password_hash"),
    role: text("role").$type<UserRole>().notNull(),
    phone: text("phone"),
    company: text("company"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("kiraylink_users_email_normalized_key").on(
      table.emailNormalized
    ),
    check(
      "kiraylink_users_role_check",
      sql`${table.role} IN ('tenant', 'landlord', 'admin')`
    ),
  ]
);

export const properties = pgTable(
  "kiraylink_properties",
  {
    id: text("id").primaryKey(),
    landlordId: text("landlord_id").notNull(),
    landlordEmail: text("landlord_email").notNull(),
    status: text("status").$type<PropertyStatus>().notNull(),
    isSeed: boolean("is_seed").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    data: jsonb("data").$type<Property>().notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("kiraylink_properties_status_idx")
      .on(table.status)
      .where(sql`${table.isDeleted} = false`),
    index("kiraylink_properties_owner_idx")
      .on(table.landlordId, table.landlordEmail)
      .where(sql`${table.isDeleted} = false`),
    check(
      "kiraylink_properties_status_check",
      sql`${table.status} IN ('available', 'pending', 'rented')`
    ),
  ]
);

export const savedProperties = pgTable(
  "kiraylink_saved_properties",
  {
    tenantId: text("tenant_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propertyId: text("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    savedAt: text("saved_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.tenantId, table.propertyId] })]
);

export const inquiries = pgTable(
  "kiraylink_inquiries",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id").notNull(),
    tenantId: text("tenant_id").notNull(),
    landlordId: text("landlord_id").notNull(),
    status: text("status").$type<InquiryStatus>().notNull(),
    data: jsonb("data").$type<Inquiry>().notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("kiraylink_inquiries_tenant_idx").on(
      table.tenantId,
      table.createdAt.desc()
    ),
    index("kiraylink_inquiries_landlord_idx").on(
      table.landlordId,
      table.createdAt.desc()
    ),
    check(
      "kiraylink_inquiries_status_check",
      sql`${table.status} IN ('pending', 'reviewed', 'responded')`
    ),
  ]
);