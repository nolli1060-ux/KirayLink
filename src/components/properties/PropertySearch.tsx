"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface PropertySearchProps {
  initialQuery?: string;
  placeholder?: string;
  translucent?: boolean;
}

export default function PropertySearch({
  initialQuery = "",
  placeholder = "Search by neighborhood, city, or residence type...",
  translucent = false,
}: PropertySearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/listings?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/listings");
    }
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
    >
      <div className="relative min-w-0 flex-1">
        <label htmlFor="property-search-input" className="sr-only">
          Search properties
        </label>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-strong"
          aria-hidden="true"
        />
        <input
          id="property-search-input"
          name="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`min-h-12 w-full rounded-xl border px-4 pl-11 text-sm focus:border-[#C5A880] focus:outline-none focus:ring-2 focus:ring-[#C5A880]/30 sm:rounded-full ${
            translucent
              ? "border-white/30 bg-transparent text-white placeholder:text-white/70"
              : "border-transparent bg-surface text-main placeholder:text-text-light"
          }`}
        />
      </div>
      <button
        type="submit"
        className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C5A880] px-7 text-sm font-bold text-[#0F172A] transition-all hover:-translate-y-0.5 hover:bg-[#B8986C] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6E43] sm:rounded-full"
      >
        <span>Search homes</span>
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
