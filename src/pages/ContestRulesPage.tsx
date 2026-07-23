import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CONTEST } from "@/lib/contest";

const ContestRulesPage = () => {
  const endsLabel = CONTEST.endDate.toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/contest"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Contest</Link>
          </Button>

          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
            <span className="gradient-text">Contest Rules & Legal Disclaimer</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            {CONTEST.name} — entries close {endsLabel}.
          </p>

          <div className="space-y-6 text-sm md:text-base leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">1. Eligibility</h2>
              <p>Open to legal residents of Canada aged 18+ (or age of majority in their province). Void where prohibited.
                Employees and immediate family members of Hersky DJ &amp; AV are not eligible.
                <strong> This contest is only open to entries for DJ service packages;</strong> AV-only, tech support, or other non-DJ services are not eligible.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">2. How to Enter</h2>
              <p>Complete the contest entry form at /contest with a valid name, email, and package interest.
                Limit one (1) entry per person and per email address. Duplicate or automated submissions will be disqualified.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">3. Prize</h2>
              <p>One (1) winner will receive: {CONTEST.prize}. Approximate retail value: CAD $250.
                Prize is non-transferable, has no cash value, and must be redeemed within 90 days of notification.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">4. Winner Selection & Notification</h2>
              <p>The winner will be selected at random from all valid entries within 7 days of the contest end date
                ({endsLabel}) and notified by email at the address provided. If the winner does not respond within
                5 business days, an alternate winner may be selected.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">5. Privacy</h2>
              <p>Information collected is used solely to administer the contest and to send related communications about
                Hersky DJ &amp; AV services. You may unsubscribe at any time. We do not sell or share entrant data with
                third parties.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">6. General Conditions</h2>
              <p>By entering, participants agree to be bound by these rules and the decisions of Hersky DJ &amp; AV, which
                are final and binding. This promotion is in no way sponsored, endorsed or administered by any social
                media platform. Hersky DJ &amp; AV reserves the right to cancel, suspend or modify the contest if fraud,
                technical failures, or any other factor beyond reasonable control impairs its integrity.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">7. Contact</h2>
              <p>Questions? Contact hello@hersky.ca.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContestRulesPage;
