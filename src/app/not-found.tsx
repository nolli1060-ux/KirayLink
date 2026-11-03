import { Compass, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function GlobalNotFound() {
  return (
    <div className="py-28 max-w-xl mx-auto px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-white text-[#C6A56B] mx-auto flex items-center justify-center shadow-xs border border-[#EDE8DE]">
        <Compass className="w-8 h-8 text-[#C6A56B]" aria-hidden="true" />
      </div>

      <Badge variant="navy" className="rounded-full px-3 py-1">
        404 — Page Not Found
      </Badge>

      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#242622] tracking-tight">
        Page Not Found
      </h1>

      <p className="text-sm sm:text-base text-[#77766F] leading-relaxed font-sans">
        The residence or page you are looking for may have been leased, moved,
        or is temporarily unavailable.
      </p>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button href="/" variant="primary" size="md" className="rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          <span>Return Home</span>
        </Button>
        <Button href="/listings" variant="outline" size="md" className="rounded-full">
          <span>Explore Residences</span>
        </Button>
      </div>
    </div>
  );
}
