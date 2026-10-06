import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// TEMPLATE — not legal advice. Have a lawyer review before relying on it.

const CookiePolicyPage = () => {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: October 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-zinc-300">
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">What cookies are</h2>
            <p>
              Cookies are small text files stored on your device when you visit a
              website. They help the site remember things like your booking
              progress. We keep our cookie use minimal.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">Cookies we use</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-white">Strictly necessary</strong> — these keep the site working
                and don&apos;t require consent: booking flow state, your cookie-consent
                choice itself, and login session cookies for the client portal.
              </li>
              <li>
                <strong className="text-white">Functional</strong> — payment providers may set cookies
                during checkout so your deposit can be processed securely.
              </li>
              <li>
                <strong className="text-white">Analytics</strong> — if we use analytics tools to
                understand how visitors use the site, they only load after you accept
                them in the consent banner. No consent, no tracking cookies.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">Managing cookies</h2>
            <p>
              When you first visit beatmasterdj.ca, a consent banner lets you accept
              or decline non-essential cookies. You can change your mind at any time
              by clearing cookies in your browser settings — the banner will show
              again on your next visit. Blocking strictly necessary cookies may
              break the booking flow and client portal login.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-2">Contact</h2>
            <p>
              Beatmaster DJ — Jake Hersky, Ottawa, Ontario, Canada. Email{" "}
              <a href="mailto:hersky.ott@gmail.com" className="text-primary hover:underline">
                hersky.ott@gmail.com
              </a>{" "}
              with any questions about this policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
