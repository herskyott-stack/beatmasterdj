import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsPage = () => {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: September 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-zinc-300">
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">The basics</h2>
            <p>
              By using beatmasterdj.ca you agree to these terms. Hersky DJ &amp; AV
              provides DJ, MC, lighting, and AV services for events in the Ottawa area
              and beyond.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">Bookings &amp; deposits</h2>
            <p>
              Your date is reserved once a signed agreement and the required deposit
              are received. A non-refundable deposit of 50% of the booking total is
              required to secure your date. Deposits are non-refundable but transferable to a new
              date (one transfer per booking), subject to availability.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">Cancellations</h2>
            <p>
              If you need to cancel, please let us know as early as possible. The
              balance of your booking fee is due on or before the event date unless
              otherwise agreed in writing.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">Your event</h2>
            <p>
              You agree to provide safe working conditions, adequate power, and
              venue access as discussed during planning. We'll handle the music —
              final playlist and timeline decisions are confirmed with you before
              the event.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">Liability</h2>
            <p>
              Our liability is limited to the fees paid for your booking. We're not
              liable for venue issues, weather, or other circumstances beyond our
              control — but we'll always do our best to adapt.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">Contact</h2>
            <p>
              Questions? Email <span className="text-white">hersky.ott@gmail.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
