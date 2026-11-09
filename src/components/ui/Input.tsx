import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  endAdornment?: ReactNode;
};

export default function Input({
  label,
  error,
  helperText,
  icon,
  endAdornment,
  id,
  className = "",
  placeholder,
  type,
  required,
  ...props
}: InputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  const fieldLabel = label.replace(/\*/g, "").trim().toLowerCase();
  const defaultPlaceholder = (() => {
    if (type === "date") return undefined;
    if (type === "email" || fieldLabel.includes("email")) {
      return "Enter your email address";
    }
    if (type === "tel" || fieldLabel.includes("phone")) {
      return "Enter your phone number";
    }
    if (type === "password" || fieldLabel.includes("password")) {
      return "Enter your password";
    }
    if (fieldLabel.includes("full name") || fieldLabel === "name") {
      return "Enter your full name";
    }
    if (fieldLabel.includes("rent") || fieldLabel.includes("price")) {
      return "Enter monthly rent in ETB";
    }
    if (fieldLabel.includes("bedroom")) return "Enter number of bedrooms";
    if (fieldLabel.includes("bathroom")) return "Enter number of bathrooms";
    if (fieldLabel.includes("area") || fieldLabel.includes("size")) {
      return "Enter property size in m²";
    }
    if (fieldLabel.includes("title")) return "Enter property title";
    if (fieldLabel.includes("tagline")) return "Enter a short property summary";
    if (
      fieldLabel.includes("location") ||
      fieldLabel.includes("address") ||
      fieldLabel.includes("landmark")
    ) {
      return "Enter full address";
    }
    if (fieldLabel.includes("region")) return "Enter region or state";
    if (fieldLabel.includes("city")) return "Enter city";
    if (fieldLabel.includes("company") || fieldLabel.includes("agency")) {
      return "Enter company or agency name";
    }
    return `Enter ${fieldLabel}`;
  })();

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-xs font-bold uppercase tracking-[0.14em] text-primary"
      >
        {label}
        {required && !label.includes("*") && (
          <span className="text-status-danger" aria-hidden="true">
            {" "}*
          </span>
        )}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-accent-text">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          required={required}
          placeholder={placeholder ?? defaultPlaceholder}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          className={`w-full rounded-xl border border-input-border bg-input px-3.5 py-2.5 text-sm text-primary placeholder:text-secondary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25 transition-all disabled:cursor-not-allowed disabled:bg-surface-muted ${
            icon ? "pl-10" : ""
          } ${endAdornment ? "pr-12" : ""} ${
            error ? "border-status-danger focus:ring-status-danger/25" : ""
          } ${className}`}
          {...props}
        />
        {endAdornment && (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {endAdornment}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs font-medium text-status-danger">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-[11px] text-secondary">
          {helperText}
        </p>
      )}
    </div>
  );
}
