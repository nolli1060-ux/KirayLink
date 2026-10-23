import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#E6E0D5] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs text-[#5B677A] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link href="/" className="font-bold tracking-wide text-[#0F172A]">
          Kiray<span className="text-[#8C6E43]">Link</span>
        </Link>
        <p>Verified residences. Clear terms. Better renting.</p>
        <p>&copy; KirayLink</p>
      </div>
    </footer>
  );
}
