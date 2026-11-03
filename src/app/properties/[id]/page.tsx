import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Mail,
  Phone,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import PropertyGallery from "@/components/properties/PropertyGallery";
import PropertyInquiryForm from "@/components/properties/PropertyInquiryForm";
import SavePropertyButton from "@/components/properties/SavePropertyButton";
import { getActivePropertyById } from "@/lib/properties-store";
import { getSession } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { savedProperties as savedPropertyRows } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { formatPrice, formatCare } from "@/lib/utils";
import { connection } from "next/server";

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  await connection();
  const { id } = await params;
  const property = await getActivePropertyById(id);
  if (!property) {
    return {
      title: "Residence Not Found | KirayLink",
      description: "The requested property could not be found.",
    };
  }
  return {
    title: `${property.title} | KirayLink Luxury Residences`,
    description: property.tagline,
  };
}

async function PropertyDetailContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const property = await getActivePropertyById(id);

  if (!property) {
    notFound();
  }

  const session = await getSession();
  let isSaved = false;

  if (session) {
    const existing = await getDatabase()
      .select({ propertyId: savedPropertyRows.propertyId })
      .from(savedPropertyRows)
      .where(
        and(
          eq(savedPropertyRows.tenantId, session.id),
          eq(savedPropertyRows.propertyId, property.id)
        )
      )
      .limit(1);
    isSaved = existing.length > 0;
  }

  return (
    <div className="bg-[#F8F6F0] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/listings"
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#77766F] hover:text-[#123B32] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#C6A56B] transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            <span>Back to Portfolio</span>
          </Link>

          <div className="flex items-center gap-2">
            <Badge
              variant="navy"
              size="sm"
              className="rounded-full px-3 py-1 bg-[#123B32] text-white border border-[#C6A56B]/30 text-[10px] font-bold tracking-wider"
            >
              {property.propertyType}
            </Badge>
            <Badge
              variant={property.status === "available" ? "success" : "neutral"}
              size="sm"
              className={`rounded-full px-3 py-1 font-semibold text-[10px] tracking-wider ${
                property.status === "available"
                  ? "bg-[#EAF3F0] text-[#174A3D] border-[#174A3D]/25"
                  : "bg-white text-[#77766F] border-[#EDE8DE]"
              }`}
            >
              {property.status}
            </Badge>
          </div>
        </div>

        {/* Property Header */}
        <div className="bg-white border border-[#EDE8DE] rounded-2xl p-6 sm:p-10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#C6A56B]">
                {property.neighborhood}, {property.city}
              </span>
              {property.featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#F5EFE4] text-[#123B32] border border-[#C6A56B]/40">
                  <Sparkles className="w-3 h-3 text-[#C6A56B]" aria-hidden="true" />
                  <span>Featured Collection</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#123B32] font-serif tracking-tight leading-[1.12]">
              {property.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#77766F] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C6A56B] shrink-0" aria-hidden="true" />
              <span>{property.location}</span>
            </p>
          </div>

          <div className="flex flex-col md:items-end justify-between gap-4 shrink-0">
            <div>
              <span className="text-[11px] uppercase tracking-[0.16em] text-[#77766F] font-bold block md:text-right">
                Monthly Lease
              </span>
              <span className="text-2xl sm:text-4xl font-bold text-[#123B32] font-serif">
                {formatPrice(property.price, "ETB ", property.rentPeriod)}
              </span>
            </div>

            <SavePropertyButton propertyId={property.id} initialSaved={isSaved} />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column (2 Cols): Gallery, Details, Amenities */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <PropertyGallery
              images={
                property.images && property.images.length > 0
                  ? property.images
                  : property.imageUrl
                  ? [property.imageUrl]
                  : []
              }
              title={property.title}
            />

            {/* Quick Specs Overview */}
            <div className="bg-white border border-[#EDE8DE] rounded-2xl p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 shadow-xs">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#77766F] block">
                  Bedrooms
                </span>
                <div className="flex items-center gap-2 text-base font-bold text-[#123B32]">
                  <Bed className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />
                  <span>{property.bedrooms} Beds</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#77766F] block">
                  Bathrooms
                </span>
                <div className="flex items-center gap-2 text-base font-bold text-[#123B32]">
                  <Bath className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />
                  <span>{property.bathrooms} Baths</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#77766F] block">
                  Living Area
                </span>
                <div className="flex items-center gap-2 text-base font-bold text-[#123B32]">
                  <Maximize2 className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />
                  <span>{formatCare(property.care)} m²</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#77766F] block">
                  Furnishing
                </span>
                <div className="flex items-center gap-2 text-base font-bold text-[#123B32]">
                  <Building2 className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />
                  <span>{property.furnished ? "Furnished" : "Unfurnished"}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-[#EDE8DE] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-[#123B32] font-serif border-b border-[#EDE8DE] pb-4">
                Property Overview & Terms
              </h2>
              <p className="text-sm text-[#77766F] leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities Checklist */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white border border-[#EDE8DE] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-[#123B32] font-serif border-b border-[#EDE8DE] pb-4">
                  Verified Facilities & Amenities
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {property.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F8F6F0] border border-[#EDE8DE] text-xs text-[#242622]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#174A3D] shrink-0" aria-hidden="true" />
                      <span className="font-semibold">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (1 Col): Landlord Card and Inquiry Form */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Landlord Card */}
            <div className="bg-white border border-[#EDE8DE] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-[#EDE8DE]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3F0] text-[#174A3D]">
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.18em] text-[#C6A56B] block">
                    Verified Landlord
                  </span>
                  <h3 className="text-sm font-bold text-[#123B32]">
                    {property.landlord.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-[#77766F]">
                {property.landlord.company && (
                  <p className="text-xs text-[#123B32] font-bold">
                    {property.landlord.company}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
                  <span className="truncate">{property.landlord.email}</span>
                </div>
                {property.landlord.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
                    <span>{property.landlord.phone}</span>
                  </div>
                )}
                <div className="pt-2 text-[11px] text-[#77766F] border-t border-[#EDE8DE]">
                  Typical response time:{" "}
                  <strong className="text-[#123B32]">
                    {property.landlord.responseTime || "within 24 hours"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Direct Inquiry Form */}
            <div className="bg-white border border-[#EDE8DE] rounded-2xl p-6 sm:p-7 shadow-xs">
              <h2 className="text-lg font-bold text-[#123B32] font-serif mb-1">
                Inquire on this Residence
              </h2>
              <p className="text-xs text-[#77766F] mb-6 leading-relaxed">
                Connect directly with the landlord to schedule a private viewing or discuss lease terms.
              </p>

              <PropertyInquiryForm
                propertyId={property.id}
                propertyTitle={property.title}
                landlord={property.landlord}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetailPage({ params }: PropertyPageProps) {
  return (
    <Suspense
      fallback={
        <div className="py-24 max-w-7xl mx-auto px-4 text-center text-[#77766F]">
          Loading residence details...
        </div>
      }
    >
      <PropertyDetailContent paramsPromise={params} />
    </Suspense>
  );
}
