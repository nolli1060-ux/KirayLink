"use client";

import { useState } from "react";
import { Bookmark, Check, Loader2 } from "lucide-react";
import { toggleSavePropertyAction } from "@/lib/dashboard-actions";

interface SavePropertyButtonProps {
  propertyId: string;
  initialSaved?: boolean;
}

export default function SavePropertyButton({
  propertyId,
  initialSaved = false,
}: SavePropertyButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggle = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await toggleSavePropertyAction(propertyId);
      if (res.success) {
        setIsSaved(!!res.isSaved);
        setFeedback(res.isSaved ? "Saved to collection" : "Removed from collection");
        setTimeout(() => setFeedback(null), 2500);
      } else {
        setFeedback(res.error || "Please sign in as a tenant");
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setFeedback("Failed to update saved collection");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        disabled={isLoading}
        onClick={handleToggle}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer shadow-xs ${
          isSaved
            ? "bg-[#123B32] text-white border-[#123B32] hover:bg-[#174A3D]"
            : "bg-white text-[#123B32] border-[#EDE8DE] hover:border-[#C6A56B] hover:bg-[#F8F6F0]"
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#C6A56B]" aria-hidden="true" />
        ) : isSaved ? (
          <Check className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />
        ) : (
          <Bookmark className="w-4 h-4 text-[#C6A56B]" aria-hidden="true" />
        )}
        <span>{isSaved ? "Saved in Collection" : "Save Residence"}</span>
      </button>

      {feedback && (
        <span
          role="status"
          className="absolute -bottom-8 left-0 whitespace-nowrap text-[11px] font-bold text-[#123B32] bg-[#F5EFE4] px-3 py-1 rounded-full border border-[#C6A56B]/40 shadow-xs"
        >
          {feedback}
        </span>
      )}
    </div>
  );
}
