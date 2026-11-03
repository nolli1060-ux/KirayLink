"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, sql } from "drizzle-orm";
import { getSession, requireAuth, getUserRoles, findUserById } from "@/lib/auth";
import {
  getAllActiveProperties,
  getActivePropertyById,
  createPropertyRecord,
  updatePropertyRecord,
  setPropertyStatus,
  deletePropertyRecord,
} from "@/lib/properties-store";
import type { Property, PropertyStatus, PropertyType } from "@/types/property";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";
import { getDatabase } from "@/lib/db";
import {
  inquiries as inquiryRows,
  savedProperties as savedPropertyRows,
} from "@/lib/schema";

// ==========================================
// 1. TENANT DASHBOARD QUERIES & ACTIONS
// ==========================================

export async function getTenantDashboardData() {
  const session = await requireAuth("tenant", "/tenant/dashboard");
  const db = getDatabase();

  const savedRows = await db
    .select({
      propertyId: savedPropertyRows.propertyId,
      savedAt: savedPropertyRows.savedAt,
    })
    .from(savedPropertyRows)
    .where(eq(savedPropertyRows.tenantId, session.id))
    .orderBy(desc(savedPropertyRows.savedAt));

  const allProperties = await getAllActiveProperties();
  const savedPropsMap = new Map(allProperties.map((p) => [p.id, p]));

  const savedProps: Property[] = [];
  for (const row of savedRows) {
    const prop = savedPropsMap.get(row.propertyId);
    if (prop) {
      savedProps.push(prop);
    }
  }

  // Tenant inquiries
  const userInquiries = await db
    .select({ data: inquiryRows.data, status: inquiryRows.status })
    .from(inquiryRows)
    .where(eq(inquiryRows.tenantId, session.id))
    .orderBy(desc(inquiryRows.createdAt));

  const tenantInquiries = userInquiries.map((row) => ({
    ...row.data,
    status: row.status,
  }));

  // Fetch live user record
  const freshUser = (await findUserById(session.id)) || session;

  return {
    user: {
      ...session,
      name: freshUser.name,
      phone: freshUser.phone,
      company: freshUser.company,
    },
    savedProperties: savedProps,
    inquiries: tenantInquiries,
  };
}

export async function unsavePropertyAction(propertyId: string) {
  const session = await getSession();
  if (!session) {
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
  revalidatePath("/listings");
  return { success: true };
}

export async function toggleSavePropertyAction(propertyId: string) {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: "Please sign in as a tenant to save properties to your collection.",
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

  // Server-side ownership check
  const myProperties = allProperties.filter(
    (p) =>
      p.landlord.id === session.id ||
      p.landlord.email.toLowerCase() === session.email.toLowerCase()
  );

  const myPropertyIds = new Set(myProperties.map((p) => p.id));

  // Inquiries for this landlord
  const inqRows = await getDatabase()
    .select({ data: inquiryRows.data, status: inquiryRows.status })
    .from(inquiryRows)
    .orderBy(desc(inquiryRows.createdAt));

  const allInquiries = inqRows.map((r) => ({
    ...r.data,
    status: r.status,
  }));

  const inquiries = allInquiries.filter(
    (inq) => inq.landlordId === session.id || myPropertyIds.has(inq.propertyId)
  );

  const freshUser = (await findUserById(session.id)) || session;

  const stats = {
    totalProperties: myProperties.length,
    activeListings: myProperties.filter((p) => p.status === "available").length,
    unavailableListings: myProperties.filter((p) => p.status !== "available").length,
    totalInquiries: inquiries.length,
    pendingInquiries: inquiries.filter((i) => i.status === "pending").length,
  };

  return {
    user: {
      ...session,
      name: freshUser.name,
      phone: freshUser.phone,
      company: freshUser.company,
    },
    myProperties,
    inquiries,
    stats,
  };
}

export async function createPropertyAction(
  prevState: { success: boolean; error?: string; message?: string } | null,
  formData: FormData
): Promise<{ success: boolean; error?: string; message?: string }> {
  const session = await getSession();
  if (!session || (session.role !== "landlord" && session.role !== "admin")) {
    return {
      success: false,
      error: "Unauthorized: Only registered landlords may create listings.",
    };
  }

  const landlordUser = await findUserById(session.id);
  const landlordPhone =
    landlordUser?.phone || session.phone || "+251 91 100 0000";

  const title = (formData.get("title") as string)?.trim() || "";
  const tagline = (formData.get("tagline") as string)?.trim() || "";
  const description = (formData.get("description") as string)?.trim() || "";
  const price = Number(formData.get("price"));
  const propertyType =
    (formData.get("propertyType") as PropertyType) || "Apartment";
  const bedrooms = Number(formData.get("bedrooms"));
  const bathrooms = Number(formData.get("bathrooms"));
  const areaSqM = Number(formData.get("areaSqM"));
  const region = (formData.get("region") as string)?.trim() || "Addis Ababa";
  const city = (formData.get("city") as string)?.trim() || "Addis Ababa";
  const location = (formData.get("location") as string)?.trim() || "";
  const neighborhood = (formData.get("neighborhood") as string)?.trim() || "";
  const status =
    (formData.get("status") as PropertyStatus) || "available";

  const imagesRaw = (formData.get("images") as string)?.trim() || "";
  let images: string[] = [];
  try {
    images = imagesRaw ? JSON.parse(imagesRaw) : [];
  } catch {
    images = imagesRaw.split(",").map((s) => s.trim()).filter(Boolean);
  }

  const primaryImage =
    (formData.get("primaryImage") as string)?.trim() || images[0] || "";

  const amenitiesRaw = (formData.get("amenities") as string)?.trim() || "";
  const furnished = formData.get("furnished") === "true";

  // Strict validation
  if (!title || title.length < 5) {
    return { success: false, error: "Title must be at least 5 characters long." };
  }
  if (!description || description.length < 20) {
    return {
      success: false,
      error: "Please enter a detailed description of at least 20 characters.",
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
    return { success: false, error: "Please provide a specific street location or address." };
  }
  if (!neighborhood) {
    return { success: false, error: "Please specify the district / sub-city." };
  }
  if (images.length === 0) {
    return {
      success: false,
      error: "Please upload at least one photograph of the property.",
    };
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
    id: `prop-${Date.now()}`,
    title,
    tagline: tagline || `${bedrooms} Bed ${propertyType} in ${neighborhood}`,
    description,
    price,
    rentPeriod: "month",
    region,
    city,
    location,
    neighborhood,
    propertyType,
    bedrooms,
    bathrooms,
    care: areaSqM,
    imageUrl: primaryImage || images[0],
    images,
    amenities: amenitiesList,
    featured: false,
    status,
    yearBuilt: new Date().getFullYear(),
    furnished,
    landlord: {
      id: session.id,
      name: session.name,
      email: session.email,
      phone: landlordPhone,
      company: landlordUser?.company || session.company || "Independent Landlord",
      responseTime: "within 24 hours",
    },
    createdAt: new Date().toISOString(),
  };

  await createPropertyRecord(newProperty);

  revalidatePath("/landlord/dashboard");
  revalidatePath("/listings");
  revalidatePath("/");

  return { success: true, message: "Property listed successfully!" };
}

export async function updatePropertyAction(
  prevState: { success: boolean; error?: string; message?: string } | null,
  formData: FormData
): Promise<{ success: boolean; error?: string; message?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }

  const propertyId = (formData.get("propertyId") as string)?.trim() || "";
  const existingProp = await getActivePropertyById(propertyId);

  if (!existingProp) {
    return { success: false, error: "Property not found." };
  }

  // Ownership verification
  const isOwner =
    existingProp.landlord.id === session.id ||
    existingProp.landlord.email.toLowerCase() === session.email.toLowerCase();
  const isAdmin = session.role === "admin";

  if (!isOwner && !isAdmin) {
    return {
      success: false,
      error: "Forbidden: You do not have permission to edit this property.",
    };
  }

  const title = (formData.get("title") as string)?.trim() || "";
  const tagline = (formData.get("tagline") as string)?.trim() || "";
  const description = (formData.get("description") as string)?.trim() || "";
  const price = Number(formData.get("price"));
  const propertyType =
    (formData.get("propertyType") as PropertyType) || existingProp.propertyType;
  const bedrooms = Number(formData.get("bedrooms"));
  const bathrooms = Number(formData.get("bathrooms"));
  const areaSqM = Number(formData.get("areaSqM"));
  const region = (formData.get("region") as string)?.trim() || existingProp.region || "Addis Ababa";
  const city = (formData.get("city") as string)?.trim() || "Addis Ababa";
  const location = (formData.get("location") as string)?.trim() || "";
  const neighborhood = (formData.get("neighborhood") as string)?.trim() || "";
  const status =
    (formData.get("status") as PropertyStatus) || existingProp.status;

  const imagesRaw = (formData.get("images") as string)?.trim() || "";
  let images: string[] = existingProp.images;
  if (imagesRaw) {
    try {
      images = JSON.parse(imagesRaw);
    } catch {
      images = imagesRaw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  const primaryImage =
    (formData.get("primaryImage") as string)?.trim() ||
    images[0] ||
    existingProp.imageUrl;

  const amenitiesRaw = (formData.get("amenities") as string)?.trim() || "";
  const furnished = formData.get("furnished") === "true";

  if (!title || title.length < 5) {
    return { success: false, error: "Title must be at least 5 characters long." };
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
  if (images.length === 0) {
    return { success: false, error: "Please provide at least one property photograph." };
  }

  const amenitiesList = amenitiesRaw
    ? amenitiesRaw.split(",").map((a) => a.trim()).filter(Boolean)
    : existingProp.amenities;

  const updatedProperty: Property = {
    ...existingProp,
    title,
    tagline: tagline || existingProp.tagline,
    description,
    price,
    propertyType,
    bedrooms,
    bathrooms,
    care: areaSqM,
    region,
    city,
    location,
    neighborhood,
    imageUrl: primaryImage,
    images,
    amenities: amenitiesList,
    status,
    furnished,
  };

  await updatePropertyRecord(updatedProperty);

  revalidatePath("/landlord/dashboard");
  revalidatePath("/listings");
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/");

  return { success: true, message: "Property updated successfully!" };
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

  const isOwner =
    property.landlord.id === session.id ||
    property.landlord.email.toLowerCase() === session.email.toLowerCase();
  const isAdmin = session.role === "admin";

  if (!isOwner && !isAdmin) {
    return {
      success: false,
      error: "Forbidden: You do not have permission to manage this listing.",
    };
  }

  await setPropertyStatus(propertyId, newStatus);

  revalidatePath("/landlord/dashboard");
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
  revalidatePath("/");
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

  const inqRows = await getDatabase()
    .select({ data: inquiryRows.data, landlordId: inquiryRows.landlordId })
    .from(inquiryRows)
    .where(eq(inquiryRows.id, inquiryId))
    .limit(1);

  const inquiry = inqRows[0];
  if (!inquiry) {
    return { success: false, error: "Inquiry not found." };
  }

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

export async function submitInquiryAction(formData: FormData) {
  const propertyId = (formData.get("propertyId") as string)?.trim() || "";
  const name = (formData.get("name") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim() || "";
  const phone = (formData.get("phone") as string)?.trim() || "";
  const moveInDate = (formData.get("moveInDate") as string)?.trim() || "";
  const message = (formData.get("message") as string)?.trim() || "";

  if (!propertyId) return { success: false, error: "Property reference missing." };
  if (!name) return { success: false, error: "Full name is required." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Valid email address is required." };
  }
  if (!phone) return { success: false, error: "Phone number is required." };
  if (!message) return { success: false, error: "Please write a message." };

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

// ==========================================
// 3. ADMIN DASHBOARD QUERIES & ACTIONS
// ==========================================

export async function getAdminDashboardData() {
  const session = await requireAuth("admin", "/admin/dashboard");
  const allProperties = await getAllActiveProperties();

  const inqRows = await getDatabase()
    .select({ data: inquiryRows.data, status: inquiryRows.status })
    .from(inquiryRows)
    .orderBy(desc(inquiryRows.createdAt));

  const allInquiries = inqRows.map((r) => ({
    ...r.data,
    status: r.status,
  }));

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
