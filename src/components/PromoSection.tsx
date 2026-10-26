import { Link } from "react-router-dom";
import { BadgePercent, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/SectionHeader";

// Current promotions (replaced the ended Summer Giveaway on 2026-10-26).
// Terms: % off the package price before HST, deposit still secures the date,
// code must be mentioned/entered at inquiry. Valid on deposits made by Dec 31, 2026.
export const PROMO_TERMS =
  "Discount applies to the package price before HST. Your deposit still secures your date. Mention the code when you inquire (or enter it in the promo code field on the inquiry form). One code per booking. Valid on deposits made by December 31, 2026.";

export const PromoBanner = () => (
  <section className="pt-20 md:pt-24 pb-4 md:pb-6">
    <div className="container mx-auto px-4">
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary/20 via-card/60 to-secondary/20 backdrop-blur-xl border border-primary/40 rounded-xl p-4 md:p-5 shadow-[0_0_30px_hsl(var(--primary)_/_0.2)]">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
              <BadgePercent className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-primary font-display">
                Current promos — until Dec 31, 2026
              </p>
              <h3 className="font-display text-base md:text-lg font-bold leading-tight">
                FIRST15 = 15% off your first booking · RETURN20 = 20% off a return booking
              </h3>
            </div>
          </div>
          <Button variant="hero" size="sm" asChild className="w-full lg:w-auto lg:shrink-0">
            <a href="#promos">
              See the promos <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

const PromoSection = () => (
  <section id="promos" className="py-20 md:py-28 relative overflow-hidden">
    <div className="container mx-auto px-4 relative z-10">
      <SectionHeader
        eyebrow="Promos"
        title="Save on your event"
        sub="Two standing promo codes — no contests, no draws, just a straight discount when you book."
      />
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-primary/40 bg-card/60 backdrop-blur-xl p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-display mb-2">First event</p>
          <p className="font-display text-4xl font-bold text-white mb-1">FIRST15</p>
          <p className="font-display text-xl font-semibold text-primary mb-4">15% off</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Booking Beatmaster DJ for the first time? Take 15% off your package price.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-display mb-2">Second / returning event</p>
          <p className="font-display text-4xl font-bold text-white mb-1">RETURN20</p>
          <p className="font-display text-xl font-semibold text-primary mb-4">20% off</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Been on my dance floor before? Returning clients take 20% off their next package.
          </p>
        </div>
      </div>
      <p className="max-w-3xl mx-auto text-center text-xs text-muted-foreground mt-8 leading-relaxed">
        {PROMO_TERMS}
      </p>
      <div className="text-center mt-8">
        <Button variant="hero" size="lg" asChild>
          <Link to="/book">
            Check your date <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  </section>
);

export default PromoSection;
