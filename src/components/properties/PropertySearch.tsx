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
  placeholder = "Search by district, neighborhood, or residence type...",
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
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C6A56B]"
          aria-hidden="true"
        />
        <input
          id="property-search-input"
          name="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="min-h-12 w-full rounded-xl border border-[#EDE8DE] bg-white px-4 pl-11 text-sm text-[#242622] placeholder:text-[#77766F] focus:border-[#C6A56B] focus:outline-none focus:ring-2 focus:ring-[#C6A56B]/25 sm:rounded-full transition-all"
        />
      </div>
      <button
        type="submit"
        className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C6A56B] px-8 text-sm font-bold text-[#123B32] shadow-sm transition-all hover:bg-[#D8BD8E] active:scale-98 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6A56B] cursor-pointer sm:rounded-full"
      >
        <span>Search</span>
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
