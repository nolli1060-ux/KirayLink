"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface PropertySearchProps {
  initialQuery?: string;
  placeholder?: string;
}

export default function PropertySearch({
  initialQuery = "",
  placeholder = "Search by neighborhood, city, or residence type...",
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
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A87900]"
          aria-hidden="true"
        />
        <input
          id="property-search-input"
          name="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="min-h-12 w-full rounded-xl border border-transparent bg-white px-4 pl-11 text-sm text-[#17191F] placeholder:text-[#858995] focus:border-[#F3B41B] focus:outline-none focus:ring-2 focus:ring-[#F3B41B]/30 sm:rounded-full"
        />
      </div>
      <button
        type="submit"
        className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F3B41B] px-7 text-sm font-bold text-[#17191F] transition-colors hover:bg-[#FFC72C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3B41B] sm:rounded-full"
      >
        <span>Search homes</span>
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
