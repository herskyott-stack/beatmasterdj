import { useFX } from "@/contexts/FXContext";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const VinylSpinner = () => {
  const { fxEnabled, isDesktop } = useFX();
  const location = useLocation();
  const [boost, setBoost] = useState(false);

  useEffect(() => {
    setBoost(true);
    const t = setTimeout(() => setBoost(false), 700);
    return () => clearTimeout(t);
  }, [location.pathname]);

  if (!fxEnabled || !isDesktop) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[60] pointer-events-none">
      <svg
        width="56"
        height="56"
        viewBox="0 0 64 64"
        className="vinyl-spin"
        style={{ animationDuration: boost ? "0.4s" : "3s" }}
      >
        <defs>
          <radialGradient id="vinyl-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="40%" stopColor="hsl(var(--secondary))" />
            <stop offset="100%" stopColor="hsl(20 15% 5%)" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="hsl(20 15% 5%)" stroke="hsl(var(--primary) / 0.6)" strokeWidth="1" />
        {[26, 22, 18, 14].map((r) => (
          <circle key={r} cx="32" cy="32" r={r} fill="none" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="0.5" />
        ))}
        <circle cx="32" cy="32" r="10" fill="url(#vinyl-grad)" />
        <circle cx="32" cy="32" r="2" fill="hsl(20 15% 5%)" />
      </svg>
    </div>
  );
};

export default VinylSpinner;
