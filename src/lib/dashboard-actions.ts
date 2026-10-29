"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, sql } from "drizzle-orm";
import { getSession, requireAuth, getUserRoles } from "@/lib/auth";
import {
  getAllActiveProperties,
  getActivePropertyById,
  createPropertyRecord,
  setPropertyStatus,
  deletePropertyRecord,
} from "@/lib/properties-store";
import type { Property, PropertyStatus, PropertyType } from "@/types/property";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";
import { getDatabase } from "@/lib/db";
import {
  inquiries as inquiryRows,
  properties,
  savedProperties as savedPropertyRows,
} from "@/lib/schema";

export async function getInquiries(): Promise<Inquiry[]> {
  const rows = await getDatabase()
    .select({ data: inquiryRows.data })
    .from(inquiryRows)
    .orderBy(desc(inquiryRows.createdAt));
  return rows.map((row) => row.data);
}

// ==========================================
// 1. TENANT DASHBOARD QUERIES & ACTIONS
// ==========================================

export async function getTenantDashboardData() {
  const session = await requireAuth("tenant", "/tenant/dashboard");
  const database = getDatabase();
  const [savedRows, allInquiries] = await Promise.all([
    database
      .select({ data: properties.data, status: properties.status })
      .from(savedPropertyRows)
      .innerJoin(properties, eq(savedPropertyRows.propertyId, properties.id))
      .where(
        and(
          eq(savedPropertyRows.tenantId, session.id),
          eq(properties.isDeleted, false)
        )
      )
      .orderBy(desc(savedPropertyRows.savedAt)),
    getInquiries(),
  ]);
  const savedProperties: Property[] = savedRows.map((row) => ({
    ...row.data,
    status: row.status,
  }));
  const inquiries = allInquiries.filter((inq) => inq.tenantId === session.id);

  return {
    user: session,
    savedProperties,
    inquiries,
  };
}

export async function unsavePropertyAction(propertyId: string) {
  const session = await getSession();
  if (!session || session.role !== "tenant") {
    return { success: false, error: "Authentication required." };
  }

  await getDatabase()
    .delete(savedPropertyRows)
    .where(
      and(
        eq(savedPropertyRows.tenantId, session.id),
        eq(savedPropertyRows.propertyId, propertyId)
      )
    );
  revalidatePath("/tenant/dashboard");
  return { success: true };
}

export async function toggleSavePropertyAction(propertyId: string) {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: "Please sign in to save properties to your collection.",
    };
  }

  const database = getDatabase();
  const existing = await database
    .select({ propertyId: savedPropertyRows.propertyId })
    .from(savedPropertyRows)
    .where(
      and(
        eq(savedPropertyRows.tenantId, session.id),
        eq(savedPropertyRows.propertyId, propertyId)
      )
    )
    .limit(1);
  const isSavedNow = existing.length === 0;
  if (isSavedNow) {
    await database
      .insert(savedPropertyRows)
      .values({
        tenantId: session.id,
        propertyId,
        savedAt: new Date().toISOString(),
      })
      .onConflictDoNothing();
  } else {
    await database
      .delete(savedPropertyRows)
      .where(
        and(
          eq(savedPropertyRows.tenantId, session.id),
          eq(savedPropertyRows.propertyId, propertyId)
        )
      );
  }

  revalidatePath("/tenant/dashboard");
  revalidatePath("/listings");
  return { success: true, isSaved: isSavedNow };
}

// ==========================================
// 2. LANDLORD DASHBOARD QUERIES & ACTIONS
// ==========================================

export async function getLandlordDashboardData() {
  const session = await requireAuth("landlord", "/landlord/dashboard");
  const allProperties = await getAllActiveProperties();

  // Server-side ownership check: only return properties owned by this landlord
  const myProperties = allProperties.filter(
    (p) =>
      p.landlord.id === session.id ||
      p.landlord.email.toLowerCase() === session.email.toLowerCase()
  );

  const myPropertyIds = new Set(myProperties.map((p) => p.id));
  const allInquiries = await getInquiries();

  // Inquiries for this landlord's properties
  const inquiries = allInquiries.filter(
    (inq) => inq.landlordId === session.id || myPropertyIds.has(inq.propertyId)
  );

  return {
    user: session,
    myProperties,
    inquiries,
  };
}

export async function createPropertyAction(
  prevState: { success: boolean; error?: string; message?: string } | null,
  formData: FormData
): Promise<{ success: boolean; error?: string; message?: string }> {
  const session = await getSession();
  // Server-side permission check: never trust client role
  if (!session || session.role !== "landlord") {
    return {
      success: false,
      error: "Unauthorized: Only registered landlords may create listings.",
    };
  }

  const title = (formData.get("title") as string)?.trim() || "";
  const tagline = (formData.get("tagline") as string)?.trim() || "";
  const description = (formData.get("description") as string)?.trim() || "";
  const price = Number(formData.get("price"));
  const propertyType = (formData.get("propertyType") as PropertyType) || "Apartment";
  const bedrooms = Number(formData.get("bedrooms"));
  const bathrooms = Number(formData.get("bathrooms"));
  const areaSqM = Number(formData.get("areaSqM"));
  const location = (formData.get("location") as string)?.trim() || "";
  const neighborhood = (formData.get("neighborhood") as string)?.trim() || "";
  const city = (formData.get("city") as string)?.trim() || "Addis Ababa";
  const imageUrl =
    (formData.get("imageUrl") as string)?.trim() ||
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";
  const amenitiesRaw = (formData.get("amenities") as string)?.trim() || "";
  const furnished = formData.get("furnished") === "true";

  // Strict validation
  if (!title || title.length < 5) {
    return { success: false, error: "Title must be at least 5 characters." };
  }
  if (!tagline || tagline.length < 5) {
    return { success: false, error: "Please provide a short tagline." };
  }
  if (!description || description.length < 20) {
    return {
      success: false,
      error: "Description must be at least 20 characters long.",
    };
  }
  if (isNaN(price) || price <= 0) {
    return { success: false, error: "Please enter a valid monthly rental price." };
  }
  if (isNaN(bedrooms) || bedrooms < 0) {
    return { success: false, error: "Please specify number of bedrooms." };
  }
  if (isNaN(bathrooms) || bathrooms < 1) {
    return { success: false, error: "Please specify at least 1 bathroom." };
  }
  if (!Number.isFinite(areaSqM) || areaSqM <= 0) {
    return {
      success: false,
      error: "Please enter a valid living area in square meters.",
    };
  }
  if (!location) {
    return { success: false, error: "Please specify the street location." };
  }
  if (!neighborhood) {
    return { success: false, error: "Please specify the district/neighborhood." };
  }

  const amenitiesList = amenitiesRaw
    ? amenitiesRaw.split(",").map((a) => a.trim()).filter(Boolean)
    : [
        "24/7 Security",
        "Backup Power Generator",
        "Water Reservoir",
        "Dedicated Parking",
      ];

  const newProperty: Property = {
    id: `prop-custom-${Date.now()}`,
    title,
    tagline,
    description,
    price,
    rentPeriod: "month",
    location,
    neighborhood,
    city,
    propertyType,
    bedrooms,
    bathrooms,
    care: areaSqM,
    imageUrl,
    images: [imageUrl],
    amenities: amenitiesList,
    featured: false,
    status: "available",
    yearBuilt: new Date().getFullYear(),
    furnished,
    landlord: {
      id: session.id,
      name: session.name,
      email: session.email,
      phone: "+251 91 100 0000",
      company: session.company || "Independent Landlord",
      responseTime: "within 2 hours",
    },
    createdAt: new Date().toISOString(),
  };

  await createPropertyRecord(newProperty);

  revalidatePath("/landlord/dashboard");
  revalidatePath("/listings");
  revalidatePath("/");

  return { success: true, message: "Property listed successfully!" };
}

export async function updatePropertyStatusAction(
  propertyId: string,
  newStatus: PropertyStatus
) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }

  const property = await getActivePropertyById(propertyId);
  if (!property) {
    return { success: false, error: "Property not found." };
  }

  // Strict ownership check: only owner landlord or admin can change status
  const isOwner =
    property.landlord.id === session.id ||
    property.landlord.email.toLowerCase() === session.email.toLowerCase();
  const isAdmin = session.role === "admin";

  if (!isOwner && !isAdmin) {
    return {
      success: false,
      error: "Forbidden: You do not have permission to modify this listing.",
    };
  }

  await setPropertyStatus(propertyId, newStatus);
  revalidatePath("/landlord/dashboard");
  revalidatePath("/admin/dashboard");
  revalidatePath("/listings");
  revalidatePath(`/properties/${propertyId}`);

  return { success: true };
}

export async function deletePropertyAction(propertyId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }

  const property = await getActivePropertyById(propertyId);
  if (!property) {
    return { success: false, error: "Property not found." };
  }

  // Strict ownership check: only owner landlord or admin can delete
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

  await deletePropertyRecord(propertyId);

  revalidatePath("/landlord/dashboard");
  revalidatePath("/admin/dashboard");
  revalidatePath("/listings");

  return { success: true };
}

export async function updateInquiryStatusAction(
  inquiryId: string,
  newStatus: InquiryStatus
) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }

  const inquiries = await getInquiries();
  const inquiry = inquiries.find((item) => item.id === inquiryId);
  if (!inquiry) {
    return { success: false, error: "Inquiry not found." };
  }

  // Verify that current user is the landlord for this inquiry or an admin
  if (inquiry.landlordId !== session.id && session.role !== "admin") {
    return {
      success: false,
      error: "Forbidden: You do not have access to manage this inquiry.",
    };
  }

  await getDatabase()
    .update(inquiryRows)
    .set({
      status: newStatus,
      data: sql<Inquiry>`jsonb_set(${inquiryRows.data}, '{status}', to_jsonb(${newStatus}::text), true)`,
    })
    .where(eq(inquiryRows.id, inquiryId));

  revalidatePath("/landlord/dashboard");
  revalidatePath("/tenant/dashboard");

  return { success: true };
}

// ==========================================
// 3. ADMIN DASHBOARD QUERIES & ACTIONS
// ==========================================

export async function getAdminDashboardData() {
  const session = await requireAuth("admin", "/admin/dashboard");
  const allProperties = await getAllActiveProperties();
  const allInquiries = await getInquiries();
  const userRoles = await getUserRoles();

  const stats = {
    totalProperties: allProperties.length,
    activeProperties: allProperties.filter((p) => p.status === "available").length,
    pendingProperties: allProperties.filter((p) => p.status === "pending").length,
    rentedProperties: allProperties.filter((p) => p.status === "rented").length,
    totalInquiries: allInquiries.length,
    pendingInquiries: allInquiries.filter((i) => i.status === "pending").length,
    totalUsers: userRoles.length,
    tenantCount: userRoles.filter((role) => role === "tenant").length,
    landlordCount: userRoles.filter((role) => role === "landlord").length,
  };

  return {
    user: session,
    allProperties,
    allInquiries,
    stats,
  };
}

export async function adminUpdatePropertyStatusAction(
  propertyId: string,
  newStatus: PropertyStatus
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { success: false, error: "Administrator authorization required." };
  }

  await setPropertyStatus(propertyId, newStatus);
  revalidatePath("/admin/dashboard");
  revalidatePath("/listings");
  return { success: true };
}

export async function adminDeletePropertyAction(propertyId: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { success: false, error: "Administrator authorization required." };
  }

  await deletePropertyRecord(propertyId);
  revalidatePath("/admin/dashboard");
  revalidatePath("/listings");
  return { success: true };
}

// ==========================================
// 4. PUBLIC / TENANT INQUIRY SUBMISSION
// ==========================================

export async function submitInquiryAction(formData: FormData) {
  const propertyId = (formData.get("propertyId") as string)?.trim() || "";
  const name = (formData.get("name") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim() || "";
  const phone = (formData.get("phone") as string)?.trim() || "";
  const moveInDate = (formData.get("moveInDate") as string)?.trim() || "";
  const message = (formData.get("message") as string)?.trim() || "";

  if (!propertyId) return { success: false, error: "Property reference missing." };
  if (!name) return { success: false, error: "Name is required." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Valid email is required." };
  }
  if (!phone) return { success: false, error: "Phone number is required." };
  if (!message) return { success: false, error: "Message is required." };

  const property = await getActivePropertyById(propertyId);
  if (!property) return { success: false, error: "Property not found." };

  const session = await getSession();

  const newInquiry: Inquiry = {
    id: `inq-${Date.now()}`,
    propertyId: property.id,
    propertyTitle: property.title,
    propertyLocation: property.location,
    propertyPrice: property.price,
    tenantId: session?.id || `guest-${Date.now()}`,
    tenantName: name,
    tenantEmail: email,
    tenantPhone: phone,
    landlordId: property.landlord.id,
    message,
    moveInDate: moveInDate || undefined,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  await getDatabase().insert(inquiryRows).values({
      id: newInquiry.id,
      propertyId: newInquiry.propertyId,
      tenantId: newInquiry.tenantId,
      landlordId: newInquiry.landlordId,
      status: newInquiry.status,
      data: newInquiry,
      createdAt: newInquiry.createdAt,
    });

  revalidatePath("/tenant/dashboard");
  revalidatePath("/landlord/dashboard");
  revalidatePath("/admin/dashboard");

  return { success: true };
}
