import { Star, ShieldCheck, Zap, Clock } from "lucide-react";

/* Slim trust/proof strip directly under the hero.
   Every claim is grounded in existing site copy:
   5.0 Google rating (TestimonialsSection), insurance + backup rig
   (PricingGuidePage "included" list), 24-hour response (ContactSection). */
const items = [
  {
    icon: Star,
    title: "5.0 on Google",
    sub: "17 verified reviews",
    stars: true,
  },
  {
    icon: ShieldCheck,
    title: "Insured & backed up",
    sub: "Liability coverage + backup rig",
  },
  {
    icon: Zap,
    title: "500+ events",
    sub: "15+ years behind the decks",
  },
  {
    icon: Clock,
    title: "24-hour response",
    sub: "Dates book fast in wedding season",
  },
];

const TrustBar = () => {
  return (
    <section aria-label="Why book Beatmaster DJ" className="border-y border-white/5 bg-card/40">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={item.title}
              className={`flex items-center gap-4 py-6 md:py-8 px-2 md:px-8 ${
                i > 0 ? "border-l border-white/5" : ""
              } ${i >= 2 ? "max-lg:border-t max-lg:border-white/5" : ""} ${
                i === 2 ? "max-lg:border-l-0" : ""
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display font-semibold text-white text-sm md:text-base whitespace-nowrap">
                    {item.title}
                  </p>
                  {item.stars && (
                    <span className="flex gap-0.5" aria-hidden="true">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="w-3 h-3 fill-primary text-primary" />
                      ))}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
