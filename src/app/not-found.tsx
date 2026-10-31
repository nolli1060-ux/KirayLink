import { Compass, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function GlobalNotFound() {
  return (
    <div className="py-28 max-w-xl mx-auto px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-gold-light text-gold-strong mx-auto flex items-center justify-center">
        <Compass className="w-8 h-8" aria-hidden="true" />
      </div>

      <Badge variant="navy">404 Ã¢â‚¬â€ Page Not Found</Badge>

      <h1 className="text-3xl sm:text-4xl font-bold text-main tracking-tight">
        Page Not Found
      </h1>

      <p className="text-sm sm:text-base text-muted leading-relaxed">
        The page you are looking for may have been moved, renamed, or is
        temporarily unavailable.
      </p>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button href="/" variant="primary" size="md">
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          <span>Return Home</span>
        </Button>
        <Button href="/listings" variant="outline" size="md">
          <span>Explore Properties</span>
        </Button>
      </div>
    </div>
  );
}
