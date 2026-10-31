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
import { properties } from "@/data/properties";
import { formatPrice, formatCare } from "@/lib/utils";
import { connection } from "next/server";

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return properties.map((p) => ({
    id: p.id,
  }));
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
    title: `${property.title} | KirayLink`,
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

  return (
    <div className="bg-ivory min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/listings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-main transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Listings</span>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="navy" size="sm">
              {property.propertyType}
            </Badge>
            <Badge
              variant={property.status === "available" ? "success" : "neutral"}
              size="sm"
            >
              {property.status}
            </Badge>
          </div>
        </div>

        {/* Property Header */}
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-gold-strong">
                {property.neighborhood}, {property.city}
              </span>
              {property.featured && (
                <Badge variant="gold" size="sm" className="inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-gold-accent" aria-hidden="true" />
                  <span>Featured Collection</span>
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-main tracking-tight">
              {property.title}
            </h1>

            <p className="text-xs sm:text-sm text-muted flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gold-accent shrink-0" aria-hidden="true" />
              <span>{property.location}</span>
            </p>
          </div>

          <div className="flex flex-col md:items-end justify-between gap-3 shrink-0">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted block md:text-right">
                Monthly Lease
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-main">
                {formatPrice(property.price)}
              </span>
              <span className="text-xs text-muted ml-1">/ month</span>
            </div>

            <SavePropertyButton propertyId={property.id} />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column (2 Cols): Gallery, Details, Amenities */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <PropertyGallery
              images={property.images && property.images.length > 0 ? property.images : [property.imageUrl]}
              title={property.title}
            />

            {/* Quick Specs Overview */}
            <div className="bg-surface border border-border rounded-xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-xs">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted">
                  Bedrooms
                </span>
                <div className="flex items-center gap-1.5 text-base font-bold text-main">
                  <Bed className="w-4 h-4 text-gold-strong" aria-hidden="true" />
                  <span>{property.bedrooms} Suites</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted">
                  Bathrooms
                </span>
                <div className="flex items-center gap-1.5 text-base font-bold text-main">
                  <Bath className="w-4 h-4 text-gold-strong" aria-hidden="true" />
                  <span>{property.bathrooms} Baths</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted">
                  Living Area
                </span>
                <div className="flex items-center gap-1.5 text-base font-bold text-main">
                  <Maximize2 className="w-4 h-4 text-gold-strong" aria-hidden="true" />
                  <span>{formatCare(property.care)} m²</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted">
                  Furnishing
                </span>
                <div className="flex items-center gap-1.5 text-base font-bold text-main">
                  <Building2 className="w-4 h-4 text-gold-strong" aria-hidden="true" />
                  <span>{property.furnished ? "Furnished" : "Unfurnished"}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-main border-b border-border-subtle pb-3">
                Architectural Highlights & Terms
              </h2>
              <p className="text-xs sm:text-sm text-muted leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities Checklist */}
            <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-main border-b border-border-subtle pb-3">
                Verified Amenities & Utilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-lg bg-ivory border border-border-subtle text-xs text-main"
                  >
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                    <span className="font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Landlord Card and Inquiry Form */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Landlord Card */}
            <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
                <ShieldCheck className="w-5 h-5 text-success" aria-hidden="true" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gold-strong block">
                    Verified Landlord
                  </span>
                  <h3 className="text-sm font-bold text-main">
                    {property.landlord.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted">
                {property.landlord.company && (
                  <p className="text-xs text-main font-semibold">
                    {property.landlord.company}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gold-strong" aria-hidden="true" />
                  <span>{property.landlord.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gold-strong" aria-hidden="true" />
                  <span>{property.landlord.phone}</span>
                </div>
                <div className="pt-2 text-[11px] text-muted">
                  Typical response time: <strong className="text-main">{property.landlord.responseTime}</strong>
                </div>
              </div>
            </div>

            {/* Direct Inquiry Form */}
            <div className="bg-surface border border-border rounded-xl p-6 shadow-xs">
              <h2 className="text-base font-bold text-main mb-1">
                Request a Private Tour
              </h2>
              <p className="text-xs text-muted mb-5">
                Inquire directly with the property manager to verify availability and lease agreements.
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
        <div className="py-24 max-w-7xl mx-auto px-4 text-center text-muted">
          Loading residence details...
        </div>
      }
    >
      <PropertyDetailContent paramsPromise={params} />
    </Suspense>
  );
}
