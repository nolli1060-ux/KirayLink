"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Trash2, ArrowUpRight, Edit3, PlusCircle } from "lucide-react";
import type { Property, PropertyStatus } from "@/types/property";
import Badge from "@/components/ui/Badge";
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

export default function MyListings({
  initialProperties,
  onOpenAddModal,
}: MyListingsProps) {
  const router = useRouter();
  const [properties, setProperties] = useState(initialProperties);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

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
      <div className="text-center py-14 px-4 rounded-2xl border border-dashed border-[#EDE8DE] bg-[#F8F6F0] space-y-4">
        <div className="w-14 h-14 rounded-full bg-white text-[#C6A56B] mx-auto flex items-center justify-center shadow-xs">
          <Building2 className="w-7 h-7 text-[#C6A56B]" aria-hidden="true" />
        </div>
        <div className="space-y-1.5 max-w-sm mx-auto">
          <h3 className="text-lg font-serif font-bold text-[#242622]">
            No properties listed yet
          </h3>
          <p className="text-xs text-[#77766F] leading-relaxed">
            Upload photographs and add details to publish your first rental residence.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 rounded-full bg-[#C6A56B] px-6 py-2.5 text-xs font-semibold text-[#123B32] hover:bg-[#d4b57e] transition-colors shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#123B32]" aria-hidden="true" />
            <span>Add New Residence</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#77766F] pb-2 border-b border-[#EDE8DE]">
          <span>
            Showing <strong className="text-[#242622]">{properties.length}</strong> listed{" "}
            {properties.length === 1 ? "residence" : "residences"}
          </span>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 text-[#C6A56B] font-semibold hover:underline cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
            <span>Add New Residence</span>
          </button>
        </div>

        <div className="space-y-4">
          {properties.map((prop) => {
            const isBusy = busyId === prop.id;
            const rawImage = prop.imageUrl || prop.images?.[0];
            const displayImage = rawImage ? getSafeImageUrl(rawImage) : null;

            return (
              <div
                key={prop.id}
                className="bg-white border border-[#EDE8DE] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs hover:border-[#C6A56B] transition-colors"
              >
                {/* Property Media & Basic Details */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-[#F8F6F0] border border-[#EDE8DE]">
                    {displayImage ? (
                      <Image
                        src={displayImage}
                        alt={prop.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#C6A56B]">
                        <Building2 className="w-6 h-6 text-[#C6A56B]" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="navy" size="sm" className="rounded-full px-2.5">
                        {prop.propertyType}
                      </Badge>
                      <Badge
                        variant={prop.status === "available" ? "success" : "neutral"}
                        size="sm"
                        className="rounded-full px-2.5"
                      >
                        {prop.status}
                      </Badge>
                    </div>

                    <h3 className="text-sm font-semibold text-[#242622] truncate">
                      {prop.title}
                    </h3>

                    <p className="text-xs text-[#77766F] truncate">
                      {prop.location}, {prop.neighborhood}
                    </p>

                    <div className="text-xs font-serif font-bold text-[#123B32]">
                      {formatPrice(prop.price, "ETB ", prop.rentPeriod)}
                      <span className="text-[11px] font-sans font-normal text-[#77766F] ml-2">
                        · {prop.bedrooms} Bed · {prop.bathrooms} Bath · {formatCare(prop.care)} m²
                      </span>
                    </div>
                  </div>
                </div>

                {/* Listing Action Controls */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[#EDE8DE]">
                  {/* Status toggle selector */}
                  <select
                    value={prop.status}
                    disabled={isBusy}
                    onChange={(e) =>
                      handleStatusChange(prop.id, e.target.value as PropertyStatus)
                    }
                    className="h-8 text-xs font-semibold bg-[#F8F6F0] border border-[#EDE8DE] rounded-full px-3 text-[#242622] focus:outline-none focus:ring-2 focus:ring-[#C6A56B] cursor-pointer"
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="rented">Rented</option>
                  </select>

                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() => setEditingProperty(prop)}
                    className="inline-flex items-center gap-1 rounded-full border border-[#EDE8DE] bg-[#F8F6F0] px-3 py-1.5 text-xs font-semibold text-[#242622] hover:bg-white hover:border-[#C6A56B] transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
                    <span>Edit</span>
                  </button>

                  {/* Public Link */}
                  <Link
                    href={`/properties/${prop.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-full border border-[#EDE8DE] bg-[#F8F6F0] px-3 py-1.5 text-xs font-semibold text-[#242622] hover:bg-white hover:border-[#C6A56B] transition-colors"
                  >
                    <span>View</span>
                    <ArrowUpRight className="w-3 h-3 text-[#C6A56B]" aria-hidden="true" />
                  </Link>

                  {/* Delete button */}
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleDelete(prop.id)}
                    className="p-1.5 rounded-full text-[#77766F] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete property"
                    aria-label="Delete property"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Listing Modal */}
      {editingProperty && (
        <EditListingModal
          property={editingProperty}
          isOpen={Boolean(editingProperty)}
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
