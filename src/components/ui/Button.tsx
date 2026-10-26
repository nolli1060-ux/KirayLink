import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type SharedProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  isLoading?: boolean;
};

type ButtonProps = SharedProps &
  (
    | (Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> & {
        href: string;
        onClick?: MouseEventHandler<HTMLAnchorElement>;
        type?: never;
        disabled?: never;
      })
    | (Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
        href?: undefined;
        isLoading?: boolean;
      })
  );

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#0F172A] text-white border-[#0F172A] hover:bg-[#1E293B] hover:border-[#1E293B]",
  secondary:
    "bg-[#C5A880] text-[#0F172A] border-[#C5A880] hover:bg-[#B8986C] hover:border-[#B8986C]",
  outline:
    "bg-white text-[#0F172A] border-[#E6E0D5] hover:bg-[#F7F3EC] hover:border-[#C5A880]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-xs",
  lg: "px-5 py-3 text-sm",
};

export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className = "",
    isLoading = false,
    children,
    ...rest
  } = props;

  const baseClasses =
    "inline-flex items-center justify-center rounded font-semibold tracking-wide transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A880] disabled:cursor-not-allowed disabled:opacity-60 border";
  const combined = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in rest && typeof rest.href === "string") {
    const { href, onClick, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
      onClick?: MouseEventHandler<HTMLAnchorElement>;
    };
    return (
      <Link href={href} onClick={onClick} className={combined} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      {...buttonProps}
      disabled={buttonProps.disabled || isLoading}
      className={combined}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
