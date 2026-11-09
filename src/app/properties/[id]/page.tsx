import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Bath,
  Bed,
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Maximize2,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import PropertyGallery from "@/components/properties/PropertyGallery";
import PropertyInquiryForm from "@/components/properties/PropertyInquiryForm";
import SavePropertyButton from "@/components/properties/SavePropertyButton";
import PropertyCard from "@/components/properties/PropertyCard";
import {
  getActivePropertyById,
  getAllActiveProperties,
  getSavedPropertyIds,
} from "@/lib/properties-store";
import { getSession } from "@/lib/auth";
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

  if (!property) notFound();

  const [session, allProperties] = await Promise.all([
    getSession(),
    getAllActiveProperties(),
  ]);
  const savedPropertyIds =
    session?.role === "tenant" ? await getSavedPropertyIds(session.id) : [];
  const isSaved = savedPropertyIds.includes(property.id);

  const similarProperties = allProperties
    .filter(
      (candidate) =>
        candidate.id !== property.id &&
        candidate.status === "available" &&
        (candidate.propertyType === property.propertyType ||
          candidate.neighborhood === property.neighborhood)
    )
    .slice(0, 3);

  const detailItems = [
    { label: "Bedrooms", value: `${property.bedrooms} Beds`, icon: Bed },
    { label: "Bathrooms", value: `${property.bathrooms} Baths`, icon: Bath },
    {
      label: "Living area",
      value: `${formatCare(property.care)} m²`,
      icon: Maximize2,
    },
    {
      label: "Furnishing",
      value: property.furnished ? "Furnished" : "Unfurnished",
      icon: Building2,
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8 text-primary sm:py-12">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/listings"
            className="group inline-flex min-h-10 items-center gap-2 text-sm font-medium text-secondary transition-colors hover:text-accent-text"
          >
            <ArrowLeft
              className="h-4 w-4 text-accent-text transition-transform group-hover:-translate-x-1"
              aria-hidden="true"
            />
            Back to properties
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium text-primary">
              {property.propertyType}
            </span>
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${
                property.status === "available"
                  ? "border-status-success/25 bg-status-success-bg text-status-success"
                  : "border-border bg-surface text-secondary"
              }`}
            >
              {property.status}
            </span>
            {property.featured && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent-soft px-3 py-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5 text-accent-text" aria-hidden="true" />
                Featured
              </span>
            )}
          </div>
        </div>

        <header className="flex flex-col gap-6 rounded-3xl border border-card-border bg-card p-5 shadow-card sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-text">
              {property.neighborhood}, {property.city}
            </p>
            <h1 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-primary sm:text-4xl lg:text-5xl">
              {property.title}
            </h1>
            <p className="mt-4 flex items-center gap-2 text-sm text-secondary">
              <MapPin className="h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
              {property.location}
            </p>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4 lg:justify-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
                {property.rentPeriod === "month" ? "Monthly rent" : "Annual rent"}
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold text-primary sm:text-3xl">
                {formatPrice(property.price, "ETB ", property.rentPeriod)}
              </p>
            </div>
            <SavePropertyButton propertyId={property.id} initialSaved={isSaved} />
          </div>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.8fr)]">
          <div className="min-w-0 space-y-7">
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

            <section
              aria-label="Property specifications"
              className="grid grid-cols-2 gap-3 rounded-3xl border border-card-border bg-card p-4 shadow-card sm:grid-cols-4 sm:p-6"
            >
              {detailItems.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border bg-surface-muted p-4"
                >
                  <Icon className="h-4 w-4 text-accent-text" aria-hidden="true" />
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-primary">{value}</p>
                </div>
              ))}
            </section>

            <section className="space-y-4 rounded-3xl border border-card-border bg-card p-5 shadow-card sm:p-7">
              <div className="border-b border-border pb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-text">
                  The residence
                </p>
                <h2 className="mt-2 font-serif text-2xl font-medium text-primary">
                  About this property
                </h2>
              </div>
              <p className="whitespace-pre-line text-sm leading-7 text-secondary">
                {property.description}
              </p>
              {property.tagline && (
                <p className="border-l-2 border-accent pl-4 font-serif text-lg italic text-primary">
                  {property.tagline}
                </p>
              )}
              <div className="flex flex-wrap gap-2 border-t border-border pt-4 text-xs text-secondary">
                <span className="rounded-full border border-border bg-surface-muted px-3 py-1.5">
                  {property.furnished ? "Furnished" : "Unfurnished"}
                </span>
                {property.yearBuilt > 0 && (
                  <span className="rounded-full border border-border bg-surface-muted px-3 py-1.5">
                    Built {property.yearBuilt}
                  </span>
                )}
              </div>
            </section>

            {property.amenities && property.amenities.length > 0 && (
              <section className="space-y-5 rounded-3xl border border-card-border bg-card p-5 shadow-card sm:p-7">
                <div className="border-b border-border pb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-text">
                    Added comforts
                  </p>
                  <h2 className="mt-2 font-serif text-2xl font-medium text-primary">
                    Amenities
                  </h2>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {property.amenities.map((amenity) => (
                    <li
                      key={amenity}
                      className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted p-3.5 text-sm text-primary"
                    >
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-status-success"
                        aria-hidden="true"
                      />
                      {amenity}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="rounded-3xl border border-card-border bg-card p-5 shadow-card sm:p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-text">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-text">
                    Location
                  </p>
                  <h2 className="mt-1 font-serif text-xl font-medium text-primary">
                    {property.neighborhood}, {property.city}
                  </h2>
                  <p className="mt-1 text-sm text-secondary">{property.location}</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <section className="rounded-3xl border border-card-border bg-card p-5 shadow-card sm:p-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-text">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-text">
                    Property contact
                  </p>
                  <h2 className="font-semibold text-primary">
                    {property.landlord.name}
                  </h2>
                </div>
              </div>
              <div className="space-y-3 pt-4 text-sm">
                {property.landlord.company && (
                  <p className="font-medium text-primary">{property.landlord.company}</p>
                )}
                <a
                  href={`mailto:${property.landlord.email}`}
                  className="flex min-w-0 items-center gap-2 text-secondary transition-colors hover:text-accent-text"
                >
                  <Mail className="h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
                  <span className="truncate">{property.landlord.email}</span>
                </a>
                {property.landlord.phone && (
                  <a
                    href={`tel:${property.landlord.phone}`}
                    className="flex items-center gap-2 text-secondary transition-colors hover:text-accent-text"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-accent-text" aria-hidden="true" />
                    {property.landlord.phone}
                  </a>
                )}
                <p className="border-t border-border pt-3 text-xs leading-5 text-secondary">
                  Typical response:{" "}
                  <span className="font-medium text-primary">
                    {property.landlord.responseTime || "within 24 hours"}
                  </span>
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-card-border bg-card p-5 shadow-card sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-text">
                Direct from the landlord
              </p>
              <h2 className="mt-2 font-serif text-2xl font-medium text-primary">
                Arrange a viewing.
              </h2>
              <p className="mb-6 mt-2 text-sm leading-6 text-secondary">
                Ask a question or share when you are hoping to move.
              </p>
              <PropertyInquiryForm
                propertyId={property.id}
                propertyTitle={property.title}
                landlord={property.landlord}
              />
            </section>
          </aside>
        </div>

        {similarProperties.length > 0 && (
          <section className="border-t border-border pt-8 sm:pt-12">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-text">
                  Keep exploring
                </p>
                <h2 className="mt-2 font-serif text-2xl font-medium text-primary sm:text-3xl">
                  Similar residences
                </h2>
              </div>
              <Link
                href="/listings"
                className="text-sm font-semibold text-accent-text transition-colors hover:text-primary"
              >
                View all properties
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {similarProperties.map((similarProperty) => (
                <PropertyCard
                  key={similarProperty.id}
                  property={similarProperty}
                  initialSaved={savedPropertyIds.includes(similarProperty.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function PropertyDetailPage({ params }: PropertyPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-24 text-center text-sm text-secondary">
          Loading residence details...
        </div>
      }
    >
      <PropertyDetailContent paramsPromise={params} />
    </Suspense>
  );
}
