"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, Trash2, ArrowUpRight } from "lucide-react";
import type { Property, PropertyStatus } from "@/types/property";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  updatePropertyStatusAction,
  deletePropertyAction,
} from "@/lib/dashboard-actions";
import { formatPrice, formatCare } from "@/lib/utils";

interface MyListingsProps {
  initialProperties: Property[];
  onOpenAddModal: () => void;
}

export default function MyListings({
  initialProperties,
  onOpenAddModal,
}: MyListingsProps) {
  const [properties, setProperties] = useState(initialProperties);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleStatusChange = async (
    propertyId: string,
    newStatus: PropertyStatus
  ) => {
    setBusyId(propertyId);
    try {
      const res = await updatePropertyStatusAction(propertyId, newStatus);
      if (res.success) {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === propertyId ? { ...p, status: newStatus } : p
          )
        );
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this listing from the platform?")) {
      return;
    }
    setBusyId(propertyId);
    try {
      const res = await deletePropertyAction(propertyId);
      if (res.success) {
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      }
    } finally {
      setBusyId(null);
    }
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border bg-ivory space-y-4">
        <div className="w-12 h-12 rounded-full bg-gold-light text-gold-strong mx-auto flex items-center justify-center">
          <Building2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-main">
            No properties listed yet
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Add a property listing so people looking for a rental can find it.
          </p>
        </div>
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onOpenAddModal}>
            Create First Listing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted pb-2 border-b border-border">
        <span>
          Showing <strong className="text-main">{properties.length}</strong> owned{" "}
          {properties.length === 1 ? "residence" : "residences"}
        </span>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="text-gold-strong font-semibold hover:underline cursor-pointer"
        >
          + Add New Property
        </button>
      </div>

      <div className="space-y-4">
        {properties.map((property) => (
          <article
            key={property.id}
            className="bg-surface rounded-lg border border-border p-5 shadow-sm hover:border-[#C5A880] transition-colors flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="relative w-24 h-20 rounded overflow-hidden bg-surface-subtle shrink-0">
                <Image
                  src={property.imageUrl}
                  alt={property.title}
                  fill
                  unoptimized
                  sizes="100px"
                  className="object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="navy" size="sm">
                    {property.propertyType}
                  </Badge>
                  <Badge
                    variant={
                      property.status === "available"
                        ? "success"
                        : property.status === "pending"
                        ? "gold"
                        : "neutral"
                    }
                    size="sm"
                  >
                    {property.status}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-main">
                  {property.title}
                </h3>

                <p className="text-xs text-muted">
                  {property.location}, {property.neighborhood}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted pt-1">
                  <span className="font-bold text-main">
                    {formatPrice(property.price)}
                  </span>
                  <span>Ã¢â‚¬Â¢</span>
                  <span>{property.bedrooms} Beds</span>
                  <span>Ã¢â‚¬Â¢</span>
                  <span>{property.bathrooms} Baths</span>
                  <span>Ã¢â‚¬Â¢</span>
                  <span>{formatCare(property.care)} mÃ‚Â²</span>
                </div>
              </div>
            </div>

            {/* Management Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-border-subtle">
              {/* Status Switcher Dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <label
                  htmlFor={`status-select-${property.id}`}
                  className="text-muted text-[11px]"
                >
                  Status:
                </label>
                <select
                  id={`status-select-${property.id}`}
                  value={property.status}
                  disabled={busyId === property.id}
                  onChange={(e) =>
                    handleStatusChange(
                      property.id,
                      e.target.value as PropertyStatus
                    )
                  }
                  className="bg-ivory border border-border rounded px-2 py-1 text-xs font-medium text-main focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                >
                  <option value="available">Available</option>
                  <option value="pending">Under Review / Pending</option>
                  <option value="rented">Leased / Rented</option>
                </select>
              </div>

              {/* View details */}
              <Link
                href={`/properties/${property.id}`}
                className="p-1.5 rounded border border-border text-muted hover:text-main hover:bg-ivory"
                title="View live page"
              >
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDelete(property.id)}
                disabled={busyId === property.id}
                className="p-1.5 rounded border border-border text-muted hover:text-error hover:border-[#9E2A2B]/40 hover:bg-error-bg transition-colors cursor-pointer"
                title="Delete listing"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
