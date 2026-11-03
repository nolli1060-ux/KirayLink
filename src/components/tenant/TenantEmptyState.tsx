import type { ElementType } from "react";
import Button from "@/components/ui/Button";

interface TenantEmptyStateProps {
  icon: ElementType;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export default function TenantEmptyState({
  icon: Icon,
  title,
  description,
  actionText = "Browse Properties",
  actionHref = "/listings",
}: TenantEmptyStateProps) {
  return (
    <div className="text-center py-14 px-4 rounded-2xl border border-dashed border-[#EDE8DE] bg-[#F8F6F0] space-y-4">
      <div className="w-14 h-14 rounded-full bg-white text-[#C6A56B] mx-auto flex items-center justify-center shadow-xs">
        <Icon className="w-7 h-7 text-[#C6A56B]" aria-hidden="true" />
      </div>
      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className="text-lg font-serif font-bold text-[#242622]">{title}</h3>
        <p className="text-xs text-[#77766F] leading-relaxed font-sans">{description}</p>
      </div>
      {actionText && actionHref && (
        <div className="pt-2">
          <Button href={actionHref} variant="outline" size="sm" className="rounded-full">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
