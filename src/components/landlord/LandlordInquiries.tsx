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
      <div className="text-center py-14 px-4 rounded-2xl border border-dashed border-[#EDE8DE] bg-[#F8F6F0] space-y-4">
        <div className="w-14 h-14 rounded-full bg-white text-[#C6A56B] mx-auto flex items-center justify-center shadow-xs">
          <MessageSquare className="w-7 h-7 text-[#C6A56B]" aria-hidden="true" />
        </div>
        <div className="space-y-1.5 max-w-sm mx-auto">
          <h3 className="text-lg font-serif font-bold text-[#242622]">
            No tenant inquiries received
          </h3>
          <p className="text-xs text-[#77766F] leading-relaxed">
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
        return <Badge variant="success" size="sm" className="rounded-full px-2.5">Responded</Badge>;
      case "reviewed":
        return <Badge variant="navy" size="sm" className="rounded-full px-2.5">Under Review</Badge>;
      default:
        return <Badge variant="gold" size="sm" className="rounded-full px-2.5">Pending Review</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[#77766F] pb-2 border-b border-[#EDE8DE]">
        <span>
          Showing <strong className="text-[#242622]">{inquiries.length}</strong> incoming{" "}
          {inquiries.length === 1 ? "inquiry" : "inquiries"}
        </span>
      </div>

      <div className="space-y-4">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className="bg-white border border-[#EDE8DE] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs hover:border-[#C6A56B] transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDE8DE] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C6A56B]">
                  Prospective Tenant
                </span>
                <h3 className="text-base font-serif font-bold text-[#242622]">
                  {inq.tenantName}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#77766F] mt-1">
                  <a
                    href={`mailto:${inq.tenantEmail}`}
                    className="flex items-center gap-1 hover:text-[#123B32] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
                    <span>{inq.tenantEmail}</span>
                  </a>
                  <a
                    href={`tel:${inq.tenantPhone}`}
                    className="flex items-center gap-1 hover:text-[#123B32] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
                    <span>{inq.tenantPhone}</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(inq.status)}
              </div>
            </div>

            {/* Inquired Property Reference */}
            <div className="flex items-center justify-between bg-[#F8F6F0] p-3 rounded-lg border border-[#EDE8DE] text-xs">
              <div>
                <span className="text-[10px] uppercase text-[#C6A56B] font-semibold">
                  Property Inquired:
                </span>{" "}
                <strong className="text-[#242622] font-semibold">{inq.propertyTitle}</strong>{" "}
                {inq.propertyPrice && (
                  <span className="text-[#77766F] font-serif">
                    ({formatPrice(inq.propertyPrice)})
                  </span>
                )}
              </div>
              <Link
                href={`/properties/${inq.propertyId}`}
                className="text-xs font-semibold text-[#123B32] hover:text-[#C6A56B] flex items-center gap-0.5 transition-colors"
              >
                <span>View</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Message Body */}
            <div className="text-xs text-[#242622] leading-relaxed bg-white border border-[#EDE8DE] p-3.5 rounded-lg">
              <span className="text-[10px] font-bold uppercase text-[#C6A56B] block mb-1">
                Message Content
              </span>
              {inq.message}
            </div>

            {/* Footer with Timestamp & Status Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-[#EDE8DE]">
              <div className="flex items-center gap-4 text-[11px] text-[#77766F]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
                  Received {new Date(inq.createdAt).toLocaleDateString()}
                </span>
                {inq.moveInDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
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
                    className="px-3 py-1 text-xs rounded-full border border-[#EDE8DE] bg-[#F8F6F0] hover:bg-white hover:border-[#C6A56B] text-[#242622] font-medium cursor-pointer transition-colors"
                  >
                    Mark Reviewed
                  </button>
                )}

                {inq.status !== "responded" && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(inq.id, "responded")}
                    disabled={updatingId === inq.id}
                    className="px-3 py-1 text-xs rounded-full border border-[#174A3D]/30 bg-[#EAF3F0] hover:bg-[#d8ebe4] text-[#174A3D] font-medium flex items-center gap-1 cursor-pointer transition-colors"
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
