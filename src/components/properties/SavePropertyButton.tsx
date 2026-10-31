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
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
          isSaved
            ? "bg-[#0F172A] text-white border-[#0F172A] hover:bg-[#1E293B]"
            : "bg-surface text-main border-border hover:border-[#C5A880] hover:bg-ivory"
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : isSaved ? (
          <Check className="w-4 h-4 text-gold-accent" aria-hidden="true" />
        ) : (
          <Bookmark className="w-4 h-4 text-gold-strong" aria-hidden="true" />
        )}
        <span>{isSaved ? "Saved in Collection" : "Save Residence"}</span>
      </button>

      {feedback && (
        <span
          role="status"
          className="absolute -bottom-7 left-0 whitespace-nowrap text-[11px] font-medium text-gold-strong bg-ivory px-2 py-0.5 rounded border border-border shadow-xs"
        >
          {feedback}
        </span>
      )}
    </div>
  );
}
