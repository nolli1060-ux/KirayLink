import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";

type BrandLogoSize = "navbar" | "footer" | "auth" | "feature";

interface BrandLogoProps {
  size?: BrandLogoSize;
  href?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

const imageSizes: Record<BrandLogoSize, string> = {
  navbar: "h-10 w-11 rounded-xl p-1",
  footer: "h-10 w-11 rounded-xl p-1",
  auth: "h-11 w-12 rounded-2xl p-1",
  feature: "h-24 w-26 rounded-[2rem] p-2",
};

export default function BrandLogo({
  size = "navbar",
  href,
  showWordmark = false,
  wordmarkClassName = "font-serif text-xl font-semibold tracking-tight text-primary",
  className = "",
  onClick,
}: BrandLogoProps) {
  const content = (
    <>
      <span
        className={`inline-flex shrink-0 items-center justify-center bg-[#F3F0E9] ${imageSizes[size]}`}
      >
        <Image
          src="/images/kiraylink-logo.png"
          alt="KirayLink Logo"
          width={406}
          height={374}
          sizes={size === "feature" ? "104px" : "48px"}
          className="h-full w-full object-contain"
        />
      </span>
      {showWordmark && <span className={wordmarkClassName}>KirayLink</span>}
    </>
  );
  const wrapperClassName = `inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus ${className}`;

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={wrapperClassName}>
        {content}
      </Link>
    );
  }

  return <div className={wrapperClassName}>{content}</div>;
}
