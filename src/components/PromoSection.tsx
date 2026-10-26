import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BadgePercent, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/SectionHeader";

// Current promotions (replaced the ended Summer Giveaway on 2026-10-26).
// Terms: % off the package price before HST, deposit still secures the date,
// code must be mentioned/entered at inquiry. Valid on deposits made by Dec 31, 2026.
export const PROMO_TERMS =
  "Discount applies to the package price before HST. Your deposit still secures your date. Mention the code when you inquire (or enter it in the promo code field on the inquiry form). One code per booking. Valid on deposits made by December 31, 2026.";

// Slim promo bar (redesigned 2026-10-26, replaces the large top banner card).
// One line, 40px tall, sits in-flow directly under the fixed navbar.
// Dismissible — the choice is remembered with the same localStorage
// pattern CookieConsent uses; if dismissed it renders nothing and the
// hero's own top padding clears the navbar as before.
// Bump PROMO_BAR_ID when the offer changes so past dismissals re-show it.
const PROMO_BAR_KEY = "beatmaster-promo-bar-dismissed";
const PROMO_BAR_ID = "first15-return20-2026";

export const PromoBanner = () => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(PROMO_BAR_KEY) === PROMO_BAR_ID;
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(PROMO_BAR_KEY, PROMO_BAR_ID);
    } catch {
      /* storage unavailable — bar simply hides for this page view */
    }
    setDismissed(true);
  };

  return (
    <section aria-label="Current promotions" className="bg-[#070708] pt-16 md:pt-20">
      <div className="border-b border-amber-200/15 bg-gradient-to-r from-amber-300/[0.08] via-transparent to-amber-300/[0.08]">
        <div className="container mx-auto flex h-10 max-h-10 items-center gap-2.5 px-4 text-[13px] leading-none">
          <BadgePercent className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
          <p className="min-w-0 truncate">
            <span className="font-display font-semibold tracking-wide text-amber-200">FIRST15</span>{" "}
            <span className="text-white/70">15% off your first booking</span>
            <span className="mx-2 text-white/25" aria-hidden="true">·</span>
            <span className="font-display font-semibold tracking-wide text-amber-200">RETURN20</span>{" "}
            <span className="text-white/70">20% off a return booking</span>
            <span className="ml-2 hidden text-white/45 lg:inline">— deposits by Dec 31, 2026</span>
          </p>
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <a
              href="#promos"
              className="hidden items-center font-display text-xs font-semibold uppercase tracking-wider text-amber-200 transition-colors hover:text-amber-100 sm:inline-flex"
            >
              Details <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss promotion"
              className="-mr-1 rounded-full p-1 text-white/40 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Refined promo cards — same section, copy and anchor (#promos) as before,
// tightened spacing and type so it reads as a pricing/booking detail,
// not a second hero. Rendered on the homepage and at the end of /book.
const PromoSection = () => {
  const { pathname } = useLocation();
  // This section also renders at the end of /book, where a /book link is a
  // dead self-link. There, send visitors to /contact instead — the inquiry
  // form is where the event date and promo code are actually entered.
  const checkDateHref = pathname === "/book" ? "/contact" : "/book";

  return (
  <section id="promos" className="py-14 md:py-20 relative overflow-hidden">
    <div className="container mx-auto px-4 relative z-10">
      <SectionHeader
        eyebrow="Promos"
        title="Save on your event"
        sub="Two standing promo codes — no contests, no draws, just a straight discount when you book."
        className="mb-10 md:mb-12"
      />
      <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-amber-200/25 bg-card/60 backdrop-blur-xl p-6 md:p-7">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-display mb-2">First event</p>
              <p className="font-display text-3xl font-bold text-white leading-none">FIRST15</p>
            </div>
            <span className="shrink-0 rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-1 font-display text-sm font-semibold text-amber-200">
              15% off
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Booking Beatmaster DJ for the first time? Take 15% off your package price.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl p-6 md:p-7">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-display mb-2">Second / returning event</p>
              <p className="font-display text-3xl font-bold text-white leading-none">RETURN20</p>
            </div>
            <span className="shrink-0 rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-1 font-display text-sm font-semibold text-amber-200">
              20% off
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Been on my dance floor before? Returning clients take 20% off their next package.
          </p>
        </div>
      </div>
      <p className="max-w-3xl mx-auto text-center text-xs text-muted-foreground mt-6 leading-relaxed">
        {PROMO_TERMS}
      </p>
      <div className="text-center mt-6">
        <Button variant="hero" size="lg" asChild>
          <Link to={checkDateHref}>
            Check your date <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  </section>
  );
};

export default PromoSection;
