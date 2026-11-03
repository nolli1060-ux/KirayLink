"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import type { Property, PropertyStatus } from "@/types/property";
import Button from "@/components/ui/Button";
import {
  adminUpdatePropertyStatusAction,
  adminDeletePropertyAction,
} from "@/lib/dashboard-actions";
import { formatPrice } from "@/lib/utils";

interface AdminStats {
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  rentedProperties: number;
  totalInquiries: number;
  pendingInquiries: number;
  totalUsers: number;
  tenantCount: number;
  landlordCount: number;
}

interface ListingManagementProps {
  initialProperties: Property[];
  stats: AdminStats;
}

export default function ListingManagement({
  initialProperties,
  stats,
}: ListingManagementProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleStatusChange = async (
    propertyId: string,
    newStatus: PropertyStatus
  ) => {
    setBusyId(propertyId);
    setActionFeedback(null);
    try {
      const res = await adminUpdatePropertyStatusAction(propertyId, newStatus);
      if (res.success) {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === propertyId ? { ...p, status: newStatus } : p
          )
        );
        setActionFeedback({
          type: "success",
          message: `Property status updated to "${newStatus}".`,
        });
      } else {
        setActionFeedback({
          type: "error",
          message: res.error || "Failed to update property status.",
        });
      }
    } catch (err) {
      console.error(err);
      setActionFeedback({
        type: "error",
        message: "An unexpected error occurred while modifying listing status.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (propertyId: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently remove "${title}" as an administrator?`
      )
    ) {
      return;
    }
    setBusyId(propertyId);
    setActionFeedback(null);
    try {
      const res = await adminDeletePropertyAction(propertyId);
      if (res.success) {
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
        setActionFeedback({
          type: "success",
          message: `Property "${title}" permanently removed.`,
        });
      } else {
        setActionFeedback({
          type: "error",
          message: res.error || "Failed to remove listing.",
        });
      }
    } catch (err) {
      console.error(err);
      setActionFeedback({
        type: "error",
        message: "An unexpected error occurred while deleting listing.",
      });
    } finally {
      setBusyId(null);
    }
  };

  // Filter listings based on search and status tabs
  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.landlord.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.landlord.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : prop.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Platform Analytics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EDE8DE] rounded-2xl p-5 shadow-[0_4px_20px_-8px_rgba(18,59,50,0.06)]">
          <div className="flex items-center justify-between text-[#C6A56B] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Listings
            </span>
            <Building2 className="w-5 h-5 text-[#C6A56B]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#242622]">
            {properties.length}
          </div>
          <p className="text-[11px] text-[#77766F] mt-1">
            {properties.filter((p) => p.status === "available").length} active ·{" "}
            {properties.filter((p) => p.status === "rented").length} leased
          </p>
        </div>

        <div className="bg-white border border-[#EDE8DE] rounded-2xl p-5 shadow-[0_4px_20px_-8px_rgba(18,59,50,0.06)]">
          <div className="flex items-center justify-between text-[#174A3D] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Active Leases
            </span>
            <ShieldCheck className="w-5 h-5 text-[#174A3D]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#242622]">
            {properties.filter((p) => p.status === "available").length}
          </div>
          <p className="text-[11px] text-[#77766F] mt-1">
            Visible to potential tenants
          </p>
        </div>

        <div className="bg-white border border-[#EDE8DE] rounded-2xl p-5 shadow-[0_4px_20px_-8px_rgba(18,59,50,0.06)]">
          <div className="flex items-center justify-between text-[#C6A56B] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Tenant Inquiries
            </span>
            <MessageSquare className="w-5 h-5 text-[#C6A56B]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#242622]">
            {stats.totalInquiries}
          </div>
          <p className="text-[11px] text-[#77766F] mt-1">
            {stats.pendingInquiries} awaiting response
          </p>
        </div>

        <div className="bg-white border border-[#EDE8DE] rounded-2xl p-5 shadow-[0_4px_20px_-8px_rgba(18,59,50,0.06)]">
          <div className="flex items-center justify-between text-[#123B32] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Platform Users
            </span>
            <Users className="w-5 h-5 text-[#123B32]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#242622]">
            {stats.totalUsers}
          </div>
          <p className="text-[11px] text-[#77766F] mt-1">
            {stats.tenantCount} tenants · {stats.landlordCount} landlords
          </p>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 p-4 rounded-xl border text-xs ${
            actionFeedback.type === "success"
              ? "bg-[#EAF3F0] border-[#174A3D]/30 text-[#174A3D]"
              : "bg-[#FBEAE9] border-[#A63228]/30 text-[#A63228]"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-xs underline font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Management Table Controls */}
      <div className="bg-white border border-[#EDE8DE] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#EDE8DE] bg-[#F8F6F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#242622]">
              Property Listing Moderation
            </h2>
            <p className="text-xs text-[#77766F] mt-0.5">
              Review, update availability status, or moderate residences across all platform landlords.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#77766F]">Total verified listings:</span>
            <span className="font-bold text-[#242622]">{properties.length}</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-[#EDE8DE] flex flex-col sm:flex-row gap-3 bg-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#77766F]" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by title, neighborhood, or landlord..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#F8F6F0] border border-[#EDE8DE] rounded-full text-[#242622] focus:outline-none focus:ring-2 focus:ring-[#C6A56B] placeholder:text-[#77766F]/60"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["all", "available", "pending", "rented"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === status
                    ? "bg-[#123B32] text-white"
                    : "bg-[#F8F6F0] text-[#77766F] hover:text-[#123B32] border border-[#EDE8DE]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Listing Records Table */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F8F6F0] text-[#C6A56B] mx-auto flex items-center justify-center">
              <Filter className="w-6 h-6 text-[#C6A56B]" aria-hidden="true" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#242622]">
              No listings match your criteria
            </h3>
            <p className="text-xs text-[#77766F] max-w-sm mx-auto">
              Try adjusting your search terms or clearing the status filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDE8DE] bg-[#F8F6F0] text-[11px] font-bold uppercase tracking-wider text-[#77766F]">
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-4">Landlord</th>
                  <th className="py-3.5 px-4">Monthly Rent</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE8DE] text-xs">
                {filteredProperties.map((prop) => {
                  const isBusy = busyId === prop.id;

                  return (
                    <tr
                      key={prop.id}
                      className="hover:bg-[#F8F6F0]/60 transition-colors"
                    >
                      {/* Property info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-11 shrink-0 rounded-lg bg-[#F8F6F0] border border-[#EDE8DE] overflow-hidden">
                            <Image
                              src={prop.imageUrl}
                              alt={prop.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/properties/${prop.id}`}
                              className="font-serif font-semibold text-[#242622] hover:text-[#C6A56B] transition-colors flex items-center gap-1 group truncate max-w-xs block"
                            >
                              <span className="truncate">{prop.title}</span>
                              <ExternalLink
                                className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[#C6A56B]"
                                aria-hidden="true"
                              />
                            </Link>
                            <p className="text-[11px] text-[#77766F] mt-0.5 truncate font-sans">
                              {prop.propertyType} · {prop.neighborhood}, {prop.city}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Landlord info */}
                      <td className="py-4 px-4">
                        <div className="text-[#242622] font-semibold">
                          {prop.landlord.name}
                        </div>
                        <div className="text-[11px] text-[#77766F] truncate">
                          {prop.landlord.email}
                        </div>
                        {prop.landlord.company && (
                          <div className="text-[10px] text-[#C6A56B] font-semibold mt-0.5">
                            {prop.landlord.company}
                          </div>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-serif font-bold text-[#123B32] whitespace-nowrap">
                        {formatPrice(prop.price)}
                      </td>

                      {/* Status select */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <select
                          value={prop.status}
                          disabled={isBusy}
                          onChange={(e) =>
                            handleStatusChange(
                              prop.id,
                              e.target.value as PropertyStatus
                            )
                          }
                          aria-label={`Change status for ${prop.title}`}
                          className={`text-xs font-semibold rounded-full px-3 py-1 border transition-colors cursor-pointer ${
                            prop.status === "available"
                              ? "bg-[#EAF3F0] text-[#174A3D] border-[#174A3D]/30"
                              : prop.status === "pending"
                              ? "bg-[#F5EFE4] text-[#123B32] border-[#C6A56B]/40"
                              : "bg-[#F8F6F0] text-[#77766F] border-[#EDE8DE]"
                          }`}
                        >
                          <option value="available">available</option>
                          <option value="pending">pending</option>
                          <option value="rented">rented</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/properties/${prop.id}`}
                            className="p-1.5 rounded-full text-[#77766F] hover:text-[#123B32] hover:bg-[#F8F6F0] transition-colors"
                            title="View Public Listing"
                            aria-label={`View ${prop.title} public page`}
                          >
                            <ExternalLink className="w-4 h-4" aria-hidden="true" />
                          </Link>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDelete(prop.id, prop.title)}
                            className="p-1.5 rounded-full text-[#A63228] hover:bg-[#FBEAE9] transition-colors cursor-pointer disabled:opacity-50"
                            title="Permanently Delete Listing"
                            aria-label={`Delete ${prop.title}`}
                          >
                            {isBusy ? (
                              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
