import Link from "next/link";
import { ArrowRight, Building2, PlusCircle } from "lucide-react";
import PropertyCard from "@/components/properties/PropertyCard";
import { getAllActiveProperties } from "@/lib/properties-store";

export default async function AvailableProperties() {
  const allProps = await getAllActiveProperties();
  const availableProperties = allProps
    .filter((property) => property.status === "available")
    .slice(0, 3);

  return (
    <section className="bg-[#F8F6F0] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C6A56B]">
              Selected Portfolio
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#242622] font-serif">
              Curated residences.
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-[#77766F]">
              Handpicked residential homes, luxury apartments, and penthouses listed directly by verified landlords in Addis Ababa.
            </p>
          </div>
          {availableProperties.length > 0 && (
            <Link
              href="/listings"
              className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#123B32] hover:text-[#C6A56B] transition-colors"
            >
              <span>View full collection</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          )}
        </div>

        {availableProperties.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {availableProperties.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#EDE8DE] bg-white p-12 sm:p-16 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F6F0] text-[#123B32] border border-[#C6A56B]/30 shadow-xs">
              <Building2 className="h-7 w-7 text-[#C6A56B]" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-[#242622] font-serif">
              No active listings yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#77766F]">
              Be the first to list a verified property or check back soon as new residences are added to the portfolio.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/sign-up?role=landlord"
                className="inline-flex items-center gap-2 rounded-full bg-[#123B32] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#174A3D]"
              >
                <PlusCircle className="h-4 w-4 text-[#C6A56B]" aria-hidden="true" />
                List Your Property
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 rounded-full border border-[#EDE8DE] bg-white px-6 py-2.5 text-xs font-bold text-[#242622] transition-colors hover:border-[#C6A56B] hover:text-[#123B32]"
              >
                Browse All
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
