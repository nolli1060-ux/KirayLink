"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import type { Property, PropertyStatus } from "@/types/property";
import EditListingModal from "@/components/landlord/EditListingModal";
import {
  updatePropertyStatusAction,
  deletePropertyAction,
} from "@/lib/dashboard-actions";
import { formatPrice, formatCare, getSafeImageUrl } from "@/lib/utils";

interface MyListingsProps {
  initialProperties: Property[];
  onOpenAddModal: () => void;
}

const statusLabels: Record<PropertyStatus, string> = {
  available: "Available",
  pending: "Pending",
  rented: "Rented",
};

export default function MyListings({
  initialProperties,
  onOpenAddModal,
}: MyListingsProps) {
  const router = useRouter();
  const [properties, setProperties] = useState(initialProperties);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusChange = async (
    propertyId: string,
    newStatus: PropertyStatus
  ) => {
    setBusyId(propertyId);
    setActionError(null);
    try {
      const result = await updatePropertyStatusAction(propertyId, newStatus);
      if (!result.success) {
        setActionError(result.error || "Could not update the listing status.");
        return;
      }
      setProperties((previous) =>
        previous.map((property) =>
          property.id === propertyId
            ? { ...property, status: newStatus }
            : property
        )
      );
    } catch {
      setActionError("An unexpected error occurred while updating the listing.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this listing from the platform?")) {
      return;
    }
    setBusyId(propertyId);
    setActionError(null);
    try {
      const result = await deletePropertyAction(propertyId);
      if (!result.success) {
        setActionError(result.error || "Could not delete the listing.");
        return;
      }
      setProperties((previous) =>
        previous.filter((property) => property.id !== propertyId)
      );
    } catch {
      setActionError("An unexpected error occurred while deleting the listing.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      {actionError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-status-danger/30 bg-status-danger-bg px-4 py-3 text-sm text-status-danger"
        >
          {actionError}
        </div>
      )}

      {properties.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-5 py-14 text-center shadow-card sm:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-text">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="mt-5 font-serif text-2xl font-medium text-primary">
            No properties listed yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">
            Add your first residence to share its details with prospective tenants.
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-button-primary px-5 text-sm font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <Plus className="h-4 w-4 text-accent" aria-hidden="true" />
            Add a residence
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 border-b border-border pb-3 text-sm text-secondary sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-semibold text-primary">{properties.length}</span>{" "}
              {properties.length === 1 ? "residence" : "residences"} in your listings
            </p>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex min-h-9 w-fit items-center gap-2 text-xs font-semibold text-accent-text transition-colors hover:text-primary"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add a residence
            </button>
          </div>

          <div className="space-y-3">
            {properties.map((property) => {
              const isBusy = busyId === property.id;
              const hasPendingAction = busyId !== null;
              const rawImage = property.imageUrl || property.images?.[0];
              const displayImage = rawImage ? getSafeImageUrl(rawImage) : null;

              return (
                <article
                  key={property.id}
                  className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-card transition-colors hover:border-accent/60"
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                    <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:aspect-square sm:w-32 lg:w-36">
                      {displayImage ? (
                        <Image
                          src={displayImage}
                          alt={property.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 144px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-accent-text">
                          <Building2 className="h-7 w-7" aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[10px] font-medium text-secondary">
                            {property.propertyType}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              property.status === "available"
                                ? "bg-status-success-bg text-status-success"
                                : "bg-accent-soft text-accent-text"
                            }`}
                          >
                            {property.status === "available" && (
                              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                            )}
                            {statusLabels[property.status]}
                          </span>
                        </div>
                        <h3 className="mt-2 truncate font-serif text-xl font-medium text-primary">
                          {property.title}
                        </h3>
                        <p className="mt-1 truncate text-sm text-secondary">
                          {property.location}, {property.neighborhood}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-primary">
                          {formatPrice(property.price, "ETB ", property.rentPeriod)}
                          <span className="ml-2 font-sans text-xs font-normal text-secondary">
                            · {property.bedrooms} bed · {property.bathrooms} bath ·{" "}
                            {formatCare(property.care)} m²
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <label className="flex items-center gap-2 text-xs text-secondary">
                          <span>Listing status</span>
                          <select
                            value={property.status}
                            disabled={hasPendingAction}
                            aria-label={`Listing status for ${property.title}`}
                            onChange={(event) =>
                              handleStatusChange(
                                property.id,
                                event.target.value as PropertyStatus
                              )
                            }
                            className="min-h-9 rounded-lg border border-input-border bg-input-bg px-3 text-xs font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60"
                          >
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          {isBusy && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-text" aria-label="Saving" />
                          )}
                        </label>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingProperty(property)}
                            disabled={hasPendingAction}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-semibold text-primary transition-colors hover:border-accent/60 hover:bg-surface-muted disabled:opacity-50"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-accent-text" aria-hidden="true" />
                            Edit
                          </button>
                          <Link
                            href={`/properties/${property.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-semibold text-primary transition-colors hover:border-accent/60 hover:bg-surface-muted"
                          >
                            View listing
                            <ArrowUpRight className="h-3.5 w-3.5 text-accent-text" aria-hidden="true" />
                          </Link>
                          <button
                            type="button"
                            disabled={hasPendingAction}
                            onClick={() => handleDelete(property.id)}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-status-danger/30 px-3 text-xs font-semibold text-status-danger transition-colors hover:bg-status-danger-bg disabled:opacity-50"
                            aria-label={`Delete ${property.title}`}
                          >
                            {isBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {editingProperty && (
        <EditListingModal
          property={editingProperty}
          isOpen
          onClose={() => setEditingProperty(null)}
          onSuccess={() => {
            setEditingProperty(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
