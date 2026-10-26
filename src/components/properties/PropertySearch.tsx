"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Button from "@/components/ui/Button";

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
      className="flex items-center gap-2 w-full max-w-xl"
    >
      <div className="relative flex-1">
        <label htmlFor="property-search-input" className="sr-only">
          Search properties
        </label>
        <Search
          className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="property-search-input"
          name="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E6E0D5] rounded text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
        />
      </div>
      <Button type="submit" variant="primary" size="md">
        Search
      </Button>
    </form>
  );
}
