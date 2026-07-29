import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContestSettings, formatContestDate } from "@/hooks/useContestSettings";
import ContestCountdown from "./ContestCountdown";

const ContestBanner = () => {
  const { settings, isActive } = useContestSettings();
  if (!isActive || !settings) return null;

  const endsLabel = formatContestDate(settings.end_date);

  return (
    <section className="pt-20 md:pt-24 pb-4 md:pb-6">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary/20 via-card/60 to-secondary/20 backdrop-blur-xl border border-primary/40 rounded-xl p-4 md:p-5 shadow-[0_0_30px_hsl(var(--primary)_/_0.2)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-primary font-display">
                  🎉 {settings.contest_name}
                </p>
                <h3 className="font-display text-base md:text-lg font-bold leading-tight">
                  Win a FREE DJ Package — ends {endsLabel}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:shrink-0">
              <ContestCountdown endDate={new Date(settings.end_date)} />
              <Button variant="hero" size="sm" asChild className="shrink-0">
                <Link to="/giveaway">
                  Enter Now <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContestBanner;
