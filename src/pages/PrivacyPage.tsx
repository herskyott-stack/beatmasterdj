import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: September 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-zinc-300">
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">Who we are</h2>
            <p>
              Beatmaster DJ ("we", "us") is an Ottawa-based DJ and event entertainment
              business. This policy explains how we handle your information when you use
              beatmasterdj.ca or contact us about our services.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">Information we collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Contact details you share in our forms (name, email, phone, event details).</li>
              <li>Booking and payment details when you reserve our services.</li>
              <li>Basic analytics (pages visited, device type) to improve the site.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">How we use it</h2>
            <p>
              We use your information to respond to inquiries, prepare quotes, manage
              bookings, and send service-related updates. We do not sell your personal
              information to anyone, ever.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">Marketing emails</h2>
            <p>
              If you opt in, we may send occasional offers or updates. Every marketing
              email includes an unsubscribe link, and you can opt out at any time by
              visiting <Link to="/unsubscribe" className="text-primary hover:underline">/unsubscribe</Link>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">Your rights</h2>
            <p>
              Under Canadian privacy law (PIPEDA), you can ask to see, correct, or
              delete the personal information we hold about you. Email us at
              hersky.ott@gmail.com and we'll respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">Contact</h2>
            <p>
              Questions about this policy? Email <span className="text-white">hersky.ott@gmail.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
