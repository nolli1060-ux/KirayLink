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
    "bg-[#123B32] text-white border-[#123B32] hover:bg-[#174A3D] hover:border-[#174A3D]",
  secondary:
    "bg-[#C6A56B] text-[#123B32] border-[#C6A56B] hover:bg-[#D8BD8E] hover:border-[#D8BD8E]",
  outline:
    "bg-white text-[#123B32] border-[#EDE8DE] hover:bg-[#F8F6F0] hover:border-[#C6A56B]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-xs",
  lg: "px-6 py-3 text-sm",
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
    "inline-flex items-center justify-center rounded-full font-bold tracking-wider uppercase transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6A56B] disabled:cursor-not-allowed disabled:opacity-60 border shadow-xs cursor-pointer";
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

  const { type = "button", disabled, ...buttonProps } = rest as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={combined}
      {...buttonProps}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
