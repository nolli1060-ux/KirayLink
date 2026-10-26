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
      <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#E6E0D5] bg-[#FDFBF7] space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#F7F3EC] text-[#8C6E43] mx-auto flex items-center justify-center">
          <MessageSquare className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-[#0F172A]">
            No tenant inquiries received
          </h3>
          <p className="text-xs text-[#5B677A] leading-relaxed">
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
      <div className="flex items-center justify-between text-xs text-[#5B677A] pb-2 border-b border-[#E6E0D5]">
        <span>
          Showing <strong className="text-[#0F172A]">{inquiries.length}</strong> incoming{" "}
          {inquiries.length === 1 ? "inquiry" : "inquiries"}
        </span>
      </div>

      <div className="space-y-4">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className="bg-white border border-[#E6E0D5] rounded-lg p-5 space-y-4 shadow-sm hover:border-[#C5A880] transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0ECE3] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C6E43]">
                  Prospective Tenant
                </span>
                <h3 className="text-base font-bold text-[#0F172A]">
                  {inq.tenantName}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#5B677A] mt-1">
                  <a
                    href={`mailto:${inq.tenantEmail}`}
                    className="flex items-center gap-1 hover:text-[#0F172A]"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#8C6E43]" aria-hidden="true" />
                    <span>{inq.tenantEmail}</span>
                  </a>
                  <a
                    href={`tel:${inq.tenantPhone}`}
                    className="flex items-center gap-1 hover:text-[#0F172A]"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#8C6E43]" aria-hidden="true" />
                    <span>{inq.tenantPhone}</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(inq.status)}
              </div>
            </div>

            {/* Inquired Property Reference */}
            <div className="flex items-center justify-between bg-[#FDFBF7] p-2.5 rounded border border-[#E6E0D5] text-xs">
              <div>
                <span className="text-[10px] uppercase text-[#8C6E43] font-semibold">
                  Property Inquired:
                </span>{" "}
                <strong className="text-[#0F172A]">{inq.propertyTitle}</strong>{" "}
                {inq.propertyPrice && (
                  <span className="text-[#5B677A]">
                    ({formatPrice(inq.propertyPrice)})
                  </span>
                )}
              </div>
              <Link
                href={`/properties/${inq.propertyId}`}
                className="text-xs font-semibold text-[#8C6E43] hover:text-[#0F172A] flex items-center gap-0.5"
              >
                <span>View</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Message Body */}
            <div className="text-xs text-[#0F172A] leading-relaxed bg-white border border-[#E6E0D5] p-3 rounded">
              <span className="text-[10px] font-bold uppercase text-[#8C6E43] block mb-1">
                Message Content
              </span>
              {inq.message}
            </div>

            {/* Footer with Timestamp & Status Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-[#F0ECE3]">
              <div className="flex items-center gap-4 text-[11px] text-[#5B677A]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#8C6E43]" aria-hidden="true" />
                  Received {new Date(inq.createdAt).toLocaleDateString()}
                </span>
                {inq.moveInDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#8C6E43]" aria-hidden="true" />
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
                    className="px-2.5 py-1 text-xs rounded border border-[#E6E0D5] bg-[#FDFBF7] hover:bg-[#F5F1E8] text-[#0F172A] font-medium cursor-pointer"
                  >
                    Mark Reviewed
                  </button>
                )}

                {inq.status !== "responded" && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(inq.id, "responded")}
                    disabled={updatingId === inq.id}
                    className="px-2.5 py-1 text-xs rounded border border-[#1B6348]/30 bg-[#EDF7F2] hover:bg-[#E2F2E9] text-[#1B6348] font-medium flex items-center gap-1 cursor-pointer"
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
