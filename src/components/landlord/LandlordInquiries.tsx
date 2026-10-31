"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Clock,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";
import Badge from "@/components/ui/Badge";
import { updateInquiryStatusAction } from "@/lib/dashboard-actions";
import { formatPrice } from "@/lib/utils";

interface LandlordInquiriesProps {
  initialInquiries: Inquiry[];
}

export default function LandlordInquiries({
  initialInquiries,
}: LandlordInquiriesProps) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = async (
    inquiryId: string,
    newStatus: InquiryStatus
  ) => {
    setUpdatingId(inquiryId);
    try {
      const res = await updateInquiryStatusAction(inquiryId, newStatus);
      if (res.success) {
        setInquiries((prev) =>
          prev.map((i) =>
            i.id === inquiryId ? { ...i, status: newStatus } : i
          )
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border bg-ivory space-y-4">
        <div className="w-12 h-12 rounded-full bg-gold-light text-gold-strong mx-auto flex items-center justify-center">
          <MessageSquare className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-main">
            No tenant inquiries received
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            When verified tenants inquire on your listed residences, their
            direct contact details and messages will be organized here.
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case "responded":
        return <Badge variant="success" size="sm">Responded</Badge>;
      case "reviewed":
        return <Badge variant="navy" size="sm">Under Review</Badge>;
      default:
        return <Badge variant="gold" size="sm">Pending Review</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted pb-2 border-b border-border">
        <span>
          Showing <strong className="text-main">{inquiries.length}</strong> incoming{" "}
          {inquiries.length === 1 ? "inquiry" : "inquiries"}
        </span>
      </div>

      <div className="space-y-4">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className="bg-surface border border-border rounded-lg p-5 space-y-4 shadow-sm hover:border-[#C5A880] transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold-strong">
                  Prospective Tenant
                </span>
                <h3 className="text-base font-bold text-main">
                  {inq.tenantName}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted mt-1">
                  <a
                    href={`mailto:${inq.tenantEmail}`}
                    className="flex items-center gap-1 hover:text-main"
                  >
                    <Mail className="w-3.5 h-3.5 text-gold-strong" aria-hidden="true" />
                    <span>{inq.tenantEmail}</span>
                  </a>
                  <a
                    href={`tel:${inq.tenantPhone}`}
                    className="flex items-center gap-1 hover:text-main"
                  >
                    <Phone className="w-3.5 h-3.5 text-gold-strong" aria-hidden="true" />
                    <span>{inq.tenantPhone}</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(inq.status)}
              </div>
            </div>

            {/* Inquired Property Reference */}
            <div className="flex items-center justify-between bg-ivory p-2.5 rounded border border-border text-xs">
              <div>
                <span className="text-[10px] uppercase text-gold-strong font-semibold">
                  Property Inquired:
                </span>{" "}
                <strong className="text-main">{inq.propertyTitle}</strong>{" "}
                {inq.propertyPrice && (
                  <span className="text-muted">
                    ({formatPrice(inq.propertyPrice)})
                  </span>
                )}
              </div>
              <Link
                href={`/properties/${inq.propertyId}`}
                className="text-xs font-semibold text-gold-strong hover:text-main flex items-center gap-0.5"
              >
                <span>View</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Message Body */}
            <div className="text-xs text-main leading-relaxed bg-surface border border-border p-3 rounded">
              <span className="text-[10px] font-bold uppercase text-gold-strong block mb-1">
                Message Content
              </span>
              {inq.message}
            </div>

            {/* Footer with Timestamp & Status Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-border-subtle">
              <div className="flex items-center gap-4 text-[11px] text-muted">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gold-strong" aria-hidden="true" />
                  Received {new Date(inq.createdAt).toLocaleDateString()}
                </span>
                {inq.moveInDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gold-strong" aria-hidden="true" />
                    Target Move-in: {inq.moveInDate}
                  </span>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2">
                {inq.status !== "reviewed" && inq.status !== "responded" && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(inq.id, "reviewed")}
                    disabled={updatingId === inq.id}
                    className="px-2.5 py-1 text-xs rounded border border-border bg-ivory hover:bg-gold-light text-main font-medium cursor-pointer"
                  >
                    Mark Reviewed
                  </button>
                )}

                {inq.status !== "responded" && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(inq.id, "responded")}
                    disabled={updatingId === inq.id}
                    className="px-2.5 py-1 text-xs rounded border border-[#1B6348]/30 bg-success-bg hover:bg-success-bg text-success font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                    <span>Mark Responded</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
