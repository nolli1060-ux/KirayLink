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
    <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border bg-ivory space-y-4">
      <div className="w-12 h-12 rounded-full bg-gold-light text-gold-strong mx-auto flex items-center justify-center">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="text-base font-bold text-main">{title}</h3>
        <p className="text-xs text-muted leading-relaxed">{description}</p>
      </div>
      {actionText && actionHref && (
        <div className="pt-2">
          <Button href={actionHref} variant="outline" size="sm">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
