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
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/15 via-card/60 to-secondary/15 backdrop-blur-xl border border-primary/30 rounded-2xl p-6 md:p-8 shadow-[0_0_40px_hsl(38,85%,55%,0.15)]">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-primary font-display mb-1">
                🎉 {settings.contest_name}
              </p>
              <h3 className="font-display text-xl md:text-2xl font-bold mb-2">
                Win a FREE DJ Package for your event
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                Enter now — good luck! Contest ends {endsLabel}.
              </p>
              <ContestCountdown endDate={new Date(settings.end_date)} />
            </div>
            <Button variant="hero" size="lg" asChild className="shrink-0">
              <Link to="/giveaway">
                Enter Contest <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContestBanner;
