"use client";

import { useState } from "react";
import { Bookmark, Check, Heart, Loader2 } from "lucide-react";
import { toggleSavePropertyAction } from "@/lib/dashboard-actions";

interface SavePropertyButtonProps {
  propertyId: string;
  initialSaved?: boolean;
  compact?: boolean;
}

export default function SavePropertyButton({
  propertyId,
  initialSaved = false,
  compact = false,
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
        aria-label={isSaved ? "Remove from saved properties" : "Save property"}
        aria-pressed={isSaved}
        title={isSaved ? "Remove from saved properties" : "Save property"}
        className={
          compact
            ? `inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-colors disabled:cursor-wait disabled:opacity-60 ${
                isSaved
                  ? "border-accent bg-strong-surface text-accent"
                  : "border-white/75 bg-surface/95 text-primary hover:border-accent hover:text-accent-text"
              }`
            : `inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors disabled:cursor-wait disabled:opacity-60 ${
                isSaved
                  ? "border-button-primary bg-button-primary text-button-primary-text hover:bg-button-primary-hover"
                  : "border-border bg-surface text-primary hover:border-accent hover:bg-surface-muted"
              }`
        }
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-accent-text" aria-hidden="true" />
        ) : isSaved ? (
          compact ? (
            <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
          ) : (
            <Check className="h-4 w-4 text-accent" aria-hidden="true" />
          )
        ) : (
          compact ? (
            <Heart className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Bookmark className="h-4 w-4 text-accent-text" aria-hidden="true" />
          )
        )}
        {!compact && (
          <span>{isSaved ? "Saved in Collection" : "Save Residence"}</span>
        )}
      </button>

      {feedback && (
        <span
          role="status"
          className="absolute -bottom-8 left-0 z-20 whitespace-nowrap rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-primary shadow-sm"
        >
          {feedback}
        </span>
      )}
    </div>
  );
}
