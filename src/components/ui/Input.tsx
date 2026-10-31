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
        className="block text-xs font-semibold uppercase tracking-wider text-main"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gold-strong">
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
          className={`w-full rounded border border-border bg-surface px-3 py-2.5 text-sm text-main placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-[#C5A880] disabled:cursor-not-allowed disabled:bg-surface-subtle ${
            icon ? "pl-10" : ""
          } ${error ? "border-error" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-[11px] text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
