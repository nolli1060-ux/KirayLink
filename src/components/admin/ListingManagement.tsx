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
          message: `Listing "${title}" removed from KirayLink.`,
        });
      } else {
        setActionFeedback({
          type: "error",
          message: res.error || "Failed to delete listing.",
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
        <div className="bg-white border border-[#E6E0D5] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#8C6E43] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Listings
            </span>
            <Building2 className="w-5 h-5 text-[#8C6E43]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">
            {properties.length}
          </div>
          <p className="text-[11px] text-[#5B677A] mt-1">
            {properties.filter((p) => p.status === "available").length} active ·{" "}
            {properties.filter((p) => p.status === "rented").length} leased
          </p>
        </div>

        <div className="bg-white border border-[#E6E0D5] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#1B6348] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Active Leases
            </span>
            <ShieldCheck className="w-5 h-5 text-[#1B6348]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">
            {properties.filter((p) => p.status === "available").length}
          </div>
          <p className="text-[11px] text-[#5B677A] mt-1">
            Visible to potential tenants
          </p>
        </div>

        <div className="bg-white border border-[#E6E0D5] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#8C6E43] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Tenant Inquiries
            </span>
            <MessageSquare className="w-5 h-5 text-[#8C6E43]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">
            {stats.totalInquiries}
          </div>
          <p className="text-[11px] text-[#5B677A] mt-1">
            {stats.pendingInquiries} awaiting response
          </p>
        </div>

        <div className="bg-white border border-[#E6E0D5] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#0F172A] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Platform Users
            </span>
            <Users className="w-5 h-5 text-[#0F172A]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">
            {stats.totalUsers}
          </div>
          <p className="text-[11px] text-[#5B677A] mt-1">
            {stats.tenantCount} tenants · {stats.landlordCount} landlords
          </p>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 p-4 rounded-lg border text-xs ${
            actionFeedback.type === "success"
              ? "bg-[#EDF7F2] border-[#1B6348]/30 text-[#1B6348]"
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
      <div className="bg-white border border-[#E6E0D5] rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E6E0D5] bg-[#FDFBF7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">
              Property Listing Moderation
            </h2>
            <p className="text-xs text-[#5B677A] mt-0.5">
              Review, update availability status, or moderate residences across all platform landlords.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#5B677A]">Total verified listings:</span>
            <span className="font-bold text-[#0F172A]">{properties.length}</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-[#E6E0D5] flex flex-col sm:flex-row gap-3 bg-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#5B677A]" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by title, neighborhood, or landlord..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FDFBF7] border border-[#CBD5E1] rounded-md text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["all", "available", "pending", "rented"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-md text-xs font-semibold capitalize transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === status
                    ? "bg-[#0F172A] text-white"
                    : "bg-[#F7F3EC] text-[#5B677A] hover:text-[#0F172A]"
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
            <div className="w-10 h-10 rounded-full bg-[#F7F3EC] text-[#8C6E43] mx-auto flex items-center justify-center">
              <Filter className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              No listings match your criteria
            </h3>
            <p className="text-xs text-[#5B677A] max-w-sm mx-auto">
              Try adjusting your search terms or clearing the status filter.
            </p>
            <Button
              variant="outline"
              size="sm"
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
                <tr className="border-b border-[#E6E0D5] bg-[#F7F3EC] text-[11px] font-bold uppercase tracking-wider text-[#5B677A]">
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Landlord</th>
                  <th className="py-3 px-4">Monthly Rent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E0D5] text-xs">
                {filteredProperties.map((prop) => {
                  const isBusy = busyId === prop.id;

                  return (
                    <tr
                      key={prop.id}
                      className="hover:bg-[#FDFBF7] transition-colors"
                    >
                      {/* Property info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-11 shrink-0 rounded bg-slate-100 overflow-hidden">
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
                              className="font-bold text-[#0F172A] hover:text-[#8C6E43] transition-colors flex items-center gap-1 group truncate max-w-xs block"
                            >
                              <span className="truncate">{prop.title}</span>
                              <ExternalLink
                                className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                aria-hidden="true"
                              />
                            </Link>
                            <p className="text-[11px] text-[#5B677A] mt-0.5 truncate">
                              {prop.propertyType} · {prop.neighborhood}, {prop.city}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Landlord info */}
                      <td className="py-4 px-4">
                        <div className="text-[#0F172A] font-medium">
                          {prop.landlord.name}
                        </div>
                        <div className="text-[11px] text-[#5B677A] truncate">
                          {prop.landlord.email}
                        </div>
                        {prop.landlord.company && (
                          <div className="text-[10px] text-[#8C6E43] font-medium mt-0.5">
                            {prop.landlord.company}
                          </div>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-bold text-[#0F172A] whitespace-nowrap">
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
                          className={`text-xs font-semibold rounded px-2.5 py-1 border transition-colors cursor-pointer ${
                            prop.status === "available"
                              ? "bg-[#EDF7F2] text-[#1B6348] border-[#1B6348]/30"
                              : prop.status === "pending"
                              ? "bg-slate-100 text-[#0F172A] border-[#CBD5E1]"
                              : "bg-[#F7F3EC] text-[#5B677A] border-[#CBD5E1]"
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
                            className="p-1.5 rounded text-[#5B677A] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                            title="View Public Listing"
                            aria-label={`View ${prop.title} public page`}
                          >
                            <ExternalLink className="w-4 h-4" aria-hidden="true" />
                          </Link>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDelete(prop.id, prop.title)}
                            className="p-1.5 rounded text-[#A63228] hover:bg-[#FBEAE9] transition-colors cursor-pointer disabled:opacity-50"
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
