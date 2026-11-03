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
        className="block text-xs font-bold uppercase tracking-[0.14em] text-[#242622]"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C6A56B]">
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
          className={`w-full rounded-xl border border-[#EDE8DE] bg-[#F8F6F0] px-3.5 py-2.5 text-sm text-[#242622] placeholder:text-[#77766F] focus:outline-none focus:border-[#C6A56B] focus:ring-2 focus:ring-[#C6A56B]/25 transition-all disabled:cursor-not-allowed disabled:bg-slate-50 ${
            icon ? "pl-10" : ""
          } ${error ? "border-[#8B2627] focus:ring-[#8B2627]/25" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-[#8B2627] font-medium">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-[11px] text-[#77766F]">
          {helperText}
        </p>
      )}
    </div>
  );
}
