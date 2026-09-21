import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useContestSettings, formatContestDate } from "@/hooks/useContestSettings";

const GiveawayRulesPage = () => {
  const { settings } = useContestSettings();
  const endsLabel = settings ? formatContestDate(settings.end_date) : "the contest end date";
  const name = settings?.contest_name ?? "BeatmasterDJ Fall Wedding & Event Giveaway";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/giveaway"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Contest</Link>
          </Button>

          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
            <span className="gradient-text">Contest Rules</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            {name} — entries close {endsLabel} (America/Toronto).
          </p>

          <div className="space-y-6 text-sm md:text-base leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">1. Eligibility</h2>
              <p>Open to legal residents of Canada aged 18 or older (or age of majority in their
                province). Employees and immediate family of BeatmasterDJ / Hersky DJ &amp; AV are
                not eligible. Void where prohibited.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">2. How to Enter</h2>
              <p>Complete the entry form at <strong>/giveaway</strong> with your name, email, and
                event details. <strong>One entry per person.</strong> Duplicate
                or automated submissions will be disqualified.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">3. Bonus Entries</h2>
              <p>You can earn up to <strong>3 bonus entries</strong> by (a) following
                @beatmasterdj on Instagram, (b) sharing the contest post to your story, and
                (c) tagging @beatmasterdj in that story. All three must be completed and{" "}
                <strong>verified by BeatmasterDJ</strong> before they count. You'll be asked for
                your Instagram handle so we can verify.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">4. Contest Period</h2>
              <p>Entries are accepted until <strong>{endsLabel}</strong>. All times are
                America/Toronto. Entries submitted after the end date will not be counted.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">5. Prize</h2>
              <p>One (1) winner receives a free DJ package including: up to 6 hours of DJ coverage,
                professional sound system, clean transitions with curated playlists, one custom mix,
                and optional ceremony audio. The prize is <strong>non-transferable</strong>, has{" "}
                <strong>no cash value</strong>, and must be redeemed within 12 months of the winner
                announcement for an event location within our service area (Ottawa–Gatineau and surrounding regions).</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">6. Winner Selection</h2>
              <p>The winner will be selected at random from all eligible entries, with each entry
                receiving tickets equal to its total (1 base + up to 3 verified bonus). The winner
                will be notified by email within 7 days of the contest end date. If the winner does
                not respond within 5 business days, an alternate may be selected.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">7. Privacy</h2>
              <p>Information collected is used only to administer this contest and follow up about
                BeatmasterDJ services. We do not sell or share entrant data with third parties.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">8. General</h2>
              <p>By entering, participants agree to these rules and to the decisions of BeatmasterDJ,
                which are final and binding. This promotion is not sponsored, endorsed, or
                administered by Instagram or any other social platform. BeatmasterDJ may modify or
                cancel the contest if fraud or a technical issue impairs its integrity.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">9. Contact</h2>
              <p>Questions? Contact hersky.ott@gmail.com.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GiveawayRulesPage;
