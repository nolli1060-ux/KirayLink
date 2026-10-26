import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
};

export default function Input({
  label,
  error,
  helperText,
  icon,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8C6E43]">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          className={`w-full rounded border border-[#E6E0D5] bg-white px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C5A880] disabled:cursor-not-allowed disabled:bg-slate-50 ${
            icon ? "pl-10" : ""
          } ${error ? "border-[#9E2A2B]" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-[#9E2A2B]">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-[11px] text-[#5B677A]">
          {helperText}
        </p>
      )}
    </div>
  );
}
