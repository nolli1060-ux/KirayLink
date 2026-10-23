import {
  ShieldCheck,
  FileCheck2,
  Sparkles,
  Zap,
  Building2,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import Hero from "@/components/home/Hero";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const benefits = [
  {
    icon: ShieldCheck,
    title: "100% Verified Ownership",
    description:
      "Every property title, landlord identity, and rental agreement is authenticated to ensure total security for tenants.",
  },
  {
    icon: Zap,
    title: "Infrastructure Ready",
    description:
      "All listings specify dedicated backup power generators, high-capacity water reservoirs, and integrated internet infrastructure.",
  },
  {
    icon: FileCheck2,
    title: "Transparent Terms",
    description:
      "Direct terms with property managers. No undisclosed intermediary fees or surprise administrative expenses.",
  },
  {
    icon: Sparkles,
    title: "Carefully Reviewed Listings",
    description:
      "Listings are reviewed for accurate details, condition, and safety before they appear on KirayLink.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* 1. Hero Section with Search Bar */}
      <Hero />

      {/* 2. Featured Properties Section */}
      <FeaturedProperties />

      {/* 3. Platform Benefits ("Why KirayLink") */}
      <section className="py-20 bg-white border-y border-[#E6E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <Badge variant="gold" size="sm">
              The KirayLink Difference
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
              A rental experience built on trust and clarity
            </h2>
            <p className="text-[#5B677A] text-sm sm:text-base">
              Finding a home in Addis Ababa should be simple, safe, and clear.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="p-6 rounded border border-[#E6E0D5] bg-[#FDFBF7] space-y-3 hover:border-[#C5A880] transition-colors"
                >
                  <div className="w-10 h-10 rounded bg-[#F7F3EC] text-[#8C6E43] flex items-center justify-center">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5B677A] leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Dual Call-to-Action Section */}
      <section className="py-20 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tenant CTA */}
            <div className="bg-[#0F172A] text-white p-8 sm:p-10 rounded border border-[#1E293B] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded bg-white/10 text-[#C5A880] flex items-center justify-center">
                  <KeyRound className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Looking for your next residence?
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Browse verified homes across Addis Ababa. Save favorites and
                  contact landlords directly.
                </p>
              </div>

              <div>
                <Button href="/listings" variant="primary" size="lg">
                  <span>Browse Available Properties</span>
                  <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                </Button>
              </div>
            </div>

            {/* Landlord CTA */}
            <div className="bg-white p-8 sm:p-10 rounded border border-[#E6E0D5] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded bg-[#F7F3EC] text-[#8C6E43] flex items-center justify-center">
                  <Building2 className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                  Are you a landlord or asset manager?
                </h3>
                <p className="text-[#5B677A] text-sm leading-relaxed">
                  Share your properties with people looking for a place to rent
                  in Addis Ababa.
                </p>
              </div>

              <div>
                <Button href="/sign-up" variant="secondary" size="lg">
                  <span>List Your Property</span>
                  <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
