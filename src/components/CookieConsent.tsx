import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const KEY = "beatmaster-cookie-consent";

/**
 * Cookie consent banner (PIPEDA / Quebec Law 25 friendly).
 * Shows once until the visitor accepts or declines.
 */
const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const choose = (choice: "accepted" | "declined") => {
    try {
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ choice, at: new Date().toISOString() })
      );
    } catch {
      /* storage unavailable — banner simply hides for this session */
    }
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-2xl rounded-2xl border border-white/10 bg-zinc-900/95 p-5 shadow-2xl backdrop-blur"
    >
      <p className="text-sm leading-relaxed text-zinc-300">
        <strong className="font-semibold text-white">A quick word on cookies.</strong>{" "}
        We use a small number of cookies to keep the booking flow, client portal
        login, and secure checkout working. Nothing extra loads until you say yes.{" "}
        <Link to="/cookies" className="text-primary underline hover:brightness-110">
          Cookie policy
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => choose("accepted")}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => choose("declined")}
          className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/30"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
