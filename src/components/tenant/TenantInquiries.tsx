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
        return <Badge variant="success" size="sm">Landlord Responded</Badge>;
      case "reviewed":
        return <Badge variant="navy" size="sm">Under Landlord Review</Badge>;
      default:
        return <Badge variant="gold" size="sm">Pending Landlord Review</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted pb-2 border-b border-border">
        <span>
          Showing <strong className="text-main">{inquiries.length}</strong> sent{" "}
          {inquiries.length === 1 ? "inquiry" : "inquiries"}
        </span>
      </div>

      <div className="space-y-4">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className="bg-surface border border-border rounded-lg p-5 space-y-3 shadow-sm hover:border-[#C5A880] transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-main">
                    {inq.propertyTitle}
                  </h3>
                  {inq.propertyPrice && (
                    <span className="text-xs font-semibold text-gold-strong">
                      ({formatPrice(inq.propertyPrice)})
                    </span>
                  )}
                </div>
                {inq.propertyLocation && (
                  <p className="text-xs text-muted mt-0.5">
                    {inq.propertyLocation}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(inq.status)}
                <Link
                  href={`/properties/${inq.propertyId}`}
                  className="inline-flex items-center text-xs font-semibold text-gold-strong hover:text-main"
                >
                  <span>View</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="bg-ivory border border-border rounded p-3 text-xs text-main leading-relaxed">
              <span className="text-[10px] font-bold uppercase text-gold-strong block mb-1">
                Your Message
              </span>
              {inq.message}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted pt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold-strong" aria-hidden="true" />
                Sent on {new Date(inq.createdAt).toLocaleDateString()}
              </span>

              {inq.moveInDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-strong" aria-hidden="true" />
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
