import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "gold" | "navy" | "success" | "neutral";
  size?: "sm" | "md";
};

const variants = {
  gold: "bg-[#F5EFE4] text-[#123B32] border-[#C6A56B]/40 font-bold",
  navy: "bg-[#123B32] text-white border-[#C6A56B]/30",
  success: "bg-[#EAF3F0] text-[#174A3D] border-[#174A3D]/25",
  neutral: "bg-[#EDE8DE] text-[#77766F] border-[#EDE8DE]",
};

const sizes = {
  sm: "px-2.5 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
};

export default function Badge({
  variant = "neutral",
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold uppercase tracking-wider ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
