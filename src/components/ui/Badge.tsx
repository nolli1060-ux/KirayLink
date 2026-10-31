import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "gold" | "navy" | "success" | "neutral";
  size?: "sm" | "md";
};

const variants = {
  gold: "bg-gold-light text-gold-strong border-[#C5A880]/40",
  navy: "bg-[#0F172A] text-white border-[#1E293B]",
  success: "bg-success-bg text-success border-[#1B6348]/20",
  neutral: "bg-surface-subtle text-muted border-border",
};

const sizes = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export default function Badge({
  variant = "neutral",
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded border font-semibold uppercase tracking-wider ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
