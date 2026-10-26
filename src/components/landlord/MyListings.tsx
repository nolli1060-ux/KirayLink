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
      <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#E6E0D5] bg-[#FDFBF7] space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#F7F3EC] text-[#8C6E43] mx-auto flex items-center justify-center">
          <Building2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-[#0F172A]">
            No properties listed yet
          </h3>
          <p className="text-xs text-[#5B677A] leading-relaxed">
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
      <div className="flex items-center justify-between text-xs text-[#5B677A] pb-2 border-b border-[#E6E0D5]">
        <span>
          Showing <strong className="text-[#0F172A]">{properties.length}</strong> owned{" "}
          {properties.length === 1 ? "residence" : "residences"}
        </span>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="text-[#8C6E43] font-semibold hover:underline cursor-pointer"
        >
          + Add New Property
        </button>
      </div>

      <div className="space-y-4">
        {properties.map((property) => (
          <article
            key={property.id}
            className="bg-white rounded-lg border border-[#E6E0D5] p-5 shadow-sm hover:border-[#C5A880] transition-colors flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="relative w-24 h-20 rounded overflow-hidden bg-slate-100 shrink-0">
                <Image
                  src={property.imageUrl}
                  alt={property.title}
                  fill
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

                <h3 className="text-sm font-bold text-[#0F172A]">
                  {property.title}
                </h3>

                <p className="text-xs text-[#5B677A]">
                  {property.location}, {property.neighborhood}
                </p>

                <div className="flex items-center gap-3 text-xs text-[#5B677A] pt-1">
                  <span className="font-bold text-[#0F172A]">
                    {formatPrice(property.price)}
                  </span>
                  <span>•</span>
                  <span>{property.bedrooms} Beds</span>
                  <span>•</span>
                  <span>{property.bathrooms} Baths</span>
                  <span>•</span>
                  <span>{formatCare(property.care)} m²</span>
                </div>
              </div>
            </div>

            {/* Management Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[#F0ECE3]">
              {/* Status Switcher Dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <label
                  htmlFor={`status-select-${property.id}`}
                  className="text-[#5B677A] text-[11px]"
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
                  className="bg-[#FDFBF7] border border-[#E6E0D5] rounded px-2 py-1 text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                >
                  <option value="available">Available</option>
                  <option value="pending">Under Review / Pending</option>
                  <option value="rented">Leased / Rented</option>
                </select>
              </div>

              {/* View details */}
              <Link
                href={`/properties/${property.id}`}
                className="p-1.5 rounded border border-[#E6E0D5] text-[#5B677A] hover:text-[#0F172A] hover:bg-[#FDFBF7]"
                title="View live page"
              >
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDelete(property.id)}
                disabled={busyId === property.id}
                className="p-1.5 rounded border border-[#E6E0D5] text-[#5B677A] hover:text-[#9E2A2B] hover:border-[#9E2A2B]/40 hover:bg-[#FDF2F2] transition-colors cursor-pointer"
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
