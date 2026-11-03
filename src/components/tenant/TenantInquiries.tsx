import Link from "next/link";
import { MessageSquare, Calendar, Clock, ArrowUpRight } from "lucide-react";
import type { Inquiry } from "@/types/inquiry";
import Badge from "@/components/ui/Badge";
import TenantEmptyState from "@/components/tenant/TenantEmptyState";
import { formatPrice } from "@/lib/utils";

interface TenantInquiriesProps {
  inquiries: Inquiry[];
}

export default function TenantInquiries({ inquiries }: TenantInquiriesProps) {
  if (inquiries.length === 0) {
    return (
      <TenantEmptyState
        icon={MessageSquare}
        title="No rental inquiries sent"
        description="When you find a residence that fits your requirements, send a direct inquiry to contact the property manager."
        actionText="Browse Available Residences"
        actionHref="/listings"
      />
    );
  }

  const getStatusBadge = (status: Inquiry["status"]) => {
    switch (status) {
      case "responded":
        return <Badge variant="success" size="sm" className="rounded-full px-2.5">Landlord Responded</Badge>;
      case "reviewed":
        return <Badge variant="navy" size="sm" className="rounded-full px-2.5">Under Landlord Review</Badge>;
      default:
        return <Badge variant="gold" size="sm" className="rounded-full px-2.5">Pending Landlord Review</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[#77766F] pb-2 border-b border-[#EDE8DE]">
        <span>
          Showing <strong className="text-[#242622]">{inquiries.length}</strong> sent{" "}
          {inquiries.length === 1 ? "inquiry" : "inquiries"}
        </span>
      </div>

      <div className="space-y-4">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className="bg-white border border-[#EDE8DE] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs hover:border-[#C6A56B] transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDE8DE] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-serif font-bold text-[#242622]">
                    {inq.propertyTitle}
                  </h3>
                  {inq.propertyPrice && (
                    <span className="text-xs font-serif font-semibold text-[#123B32]">
                      ({formatPrice(inq.propertyPrice)})
                    </span>
                  )}
                </div>
                {inq.propertyLocation && (
                  <p className="text-xs text-[#77766F] mt-0.5 font-sans">
                    {inq.propertyLocation}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(inq.status)}
                <Link
                  href={`/properties/${inq.propertyId}`}
                  className="inline-flex items-center text-xs font-semibold text-[#123B32] hover:text-[#C6A56B] transition-colors"
                >
                  <span>View</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 text-[#C6A56B]" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="bg-[#F8F6F0] border border-[#EDE8DE] rounded-xl p-3.5 text-xs text-[#242622] leading-relaxed">
              <span className="text-[10px] font-bold uppercase text-[#C6A56B] block mb-1">
                Your Message
              </span>
              {inq.message}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#77766F] pt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
                Sent on {new Date(inq.createdAt).toLocaleDateString()}
              </span>

              {inq.moveInDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C6A56B]" aria-hidden="true" />
                  Target Move-in: {inq.moveInDate}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
