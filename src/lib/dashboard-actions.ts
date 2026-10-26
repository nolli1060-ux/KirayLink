"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { getSession, requireAuth, getUsers } from "@/lib/auth";
import {
  getAllActiveProperties,
  getActivePropertyById,
  getCustomProperties,
  saveCustomProperties,
  setPropertyStatusOverride,
  markPropertyDeleted,
} from "@/lib/properties-store";
import type { Property, PropertyStatus, PropertyType } from "@/types/property";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";

const savedPropertiesPath = path.join(
  process.cwd(),
  "src",
  "data",
  "saved-properties.json"
);

const inquiriesPath = path.join(
  process.cwd(),
  "src",
  "data",
  "inquiries.json"
);

interface SavedPropertyRecord {
  tenantId: string;
  propertyId: string;
  savedAt: string;
}

// Helpers for reading/writing saved properties
function getSavedRecords(): SavedPropertyRecord[] {
  try {
    if (fs.existsSync(savedPropertiesPath)) {
      return JSON.parse(fs.readFileSync(savedPropertiesPath, "utf8"));
    }
  } catch (err) {
    console.error("Failed to read saved properties:", err);
  }
  return [];
}

function saveSavedRecords(records: SavedPropertyRecord[]): void {
  try {
    fs.writeFileSync(
      savedPropertiesPath,
      JSON.stringify(records, null, 2),
      "utf8"
    );
  } catch (err) {
    console.error("Failed to save saved properties:", err);
  }
}

// Helpers for reading/writing inquiries
export async function getInquiries(): Promise<Inquiry[]> {
  try {
    if (fs.existsSync(inquiriesPath)) {
      return JSON.parse(fs.readFileSync(inquiriesPath, "utf8"));
    }
  } catch (err) {
    console.error("Failed to read inquiries:", err);
  }
  return [];
}

function saveInquiries(inquiries: Inquiry[]): void {
  try {
    fs.writeFileSync(inquiriesPath, JSON.stringify(inquiries, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save inquiries:", err);
  }
}

// ==========================================
// 1. TENANT DASHBOARD QUERIES & ACTIONS
// ==========================================

export async function getTenantDashboardData() {
  const session = await requireAuth("tenant", "/tenant/dashboard");
  const records = getSavedRecords().filter((r) => r.tenantId === session.id);
  const allProperties = getAllActiveProperties();

  const savedProperties: Property[] = records
    .map((r) => allProperties.find((p) => p.id === r.propertyId))
    .filter((p): p is Property => p !== undefined);

  const allInquiries = await getInquiries();
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

  const records = getSavedRecords().filter(
    (r) => !(r.tenantId === session.id && r.propertyId === propertyId)
  );
  saveSavedRecords(records);
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

  const records = getSavedRecords();
  const exists = records.some(
    (r) => r.tenantId === session.id && r.propertyId === propertyId
  );

  let isSavedNow = false;
  if (exists) {
    saveSavedRecords(
      records.filter(
        (r) => !(r.tenantId === session.id && r.propertyId === propertyId)
      )
    );
    isSavedNow = false;
  } else {
    records.push({
      tenantId: session.id,
      propertyId,
      savedAt: new Date().toISOString(),
    });
    saveSavedRecords(records);
    isSavedNow = true;
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
  const allProperties = getAllActiveProperties();

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

  const customList = getCustomProperties();
  customList.unshift(newProperty);
  saveCustomProperties(customList);

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

  const property = getActivePropertyById(propertyId);
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

  setPropertyStatusOverride(propertyId, newStatus);
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

  const property = getActivePropertyById(propertyId);
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

  // If custom property, remove from custom list
  const customList = getCustomProperties();
  const filteredCustom = customList.filter((p) => p.id !== propertyId);
  if (filteredCustom.length !== customList.length) {
    saveCustomProperties(filteredCustom);
  }

  // Record deletion
  markPropertyDeleted(propertyId);

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
  const inqIndex = inquiries.findIndex((i) => i.id === inquiryId);
  if (inqIndex === -1) {
    return { success: false, error: "Inquiry not found." };
  }

  const inq = inquiries[inqIndex];
  // Verify that current user is the landlord for this inquiry or an admin
  if (inq.landlordId !== session.id && session.role !== "admin") {
    return {
      success: false,
      error: "Forbidden: You do not have access to manage this inquiry.",
    };
  }

  inquiries[inqIndex].status = newStatus;
  saveInquiries(inquiries);

  revalidatePath("/landlord/dashboard");
  revalidatePath("/tenant/dashboard");

  return { success: true };
}

// ==========================================
// 3. ADMIN DASHBOARD QUERIES & ACTIONS
// ==========================================

export async function getAdminDashboardData() {
  const session = await requireAuth("admin", "/admin/dashboard");
  const allProperties = getAllActiveProperties();
  const allInquiries = await getInquiries();
  const allUsers = await getUsers();

  const stats = {
    totalProperties: allProperties.length,
    activeProperties: allProperties.filter((p) => p.status === "available").length,
    pendingProperties: allProperties.filter((p) => p.status === "pending").length,
    rentedProperties: allProperties.filter((p) => p.status === "rented").length,
    totalInquiries: allInquiries.length,
    pendingInquiries: allInquiries.filter((i) => i.status === "pending").length,
    totalUsers: allUsers.length,
    tenantCount: allUsers.filter((u) => u.role === "tenant").length,
    landlordCount: allUsers.filter((u) => u.role === "landlord").length,
  };

  return {
    user: session,
    allProperties,
    allInquiries,
    allUsers,
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

  setPropertyStatusOverride(propertyId, newStatus);
  revalidatePath("/admin/dashboard");
  revalidatePath("/listings");
  return { success: true };
}

export async function adminDeletePropertyAction(propertyId: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { success: false, error: "Administrator authorization required." };
  }

  markPropertyDeleted(propertyId);
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

  const property = getActivePropertyById(propertyId);
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

  const inquiries = await getInquiries();
  inquiries.unshift(newInquiry);
  saveInquiries(inquiries);

  revalidatePath("/tenant/dashboard");
  revalidatePath("/landlord/dashboard");
  revalidatePath("/admin/dashboard");

  return { success: true };
}
