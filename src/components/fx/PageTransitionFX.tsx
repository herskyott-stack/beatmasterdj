import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFX } from "@/contexts/FXContext";

type Variant = "tape" | "vinyl" | "eq" | "glitch" | "beat" | "curtain";
const VARIANTS: Variant[] = ["tape", "vinyl", "eq", "glitch", "beat", "curtain"];
const DURATION = 600;

const PageTransitionFX = () => {
  const { fxEnabled } = useFX();
  const location = useLocation();
  const [variant, setVariant] = useState<Variant | null>(null);
  const lastIdx = useRef<number>(-1);
  const isFirst = useRef(true);

  useEffect(() => {
    if (!fxEnabled) return;
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    let idx = Math.floor(Math.random() * VARIANTS.length);
    if (idx === lastIdx.current) idx = (idx + 1) % VARIANTS.length;
    lastIdx.current = idx;
    setVariant(VARIANTS[idx]);
    const t = setTimeout(() => setVariant(null), DURATION);
    return () => clearTimeout(t);
  }, [location.pathname, fxEnabled]);

  if (!fxEnabled || !variant) return null;

  const base = "fixed inset-0 z-[80] pointer-events-none overflow-hidden";

  if (variant === "tape") {
    return <div className={`${base} tape-wipe`} />;
  }

  if (variant === "vinyl") {
    return (
      <div className={`${base} flex items-center justify-center`}>
        <svg viewBox="0 0 64 64" className="w-[80vmin] h-[80vmin] pt-vinyl-spinout">
          <defs>
            <radialGradient id="pt-vinyl-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="40%" stopColor="hsl(var(--secondary))" />
              <stop offset="100%" stopColor="hsl(20 15% 5%)" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="30" fill="hsl(20 15% 5%)" stroke="hsl(var(--primary))" strokeWidth="0.5" />
          {[26, 22, 18, 14].map((r) => (
            <circle key={r} cx="32" cy="32" r={r} fill="none" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="0.3" />
          ))}
          <circle cx="32" cy="32" r="10" fill="url(#pt-vinyl-grad)" />
          <circle cx="32" cy="32" r="2" fill="hsl(20 15% 5%)" />
        </svg>
      </div>
    );
  }

  if (variant === "eq") {
    return (
      <div className={`${base} flex items-end gap-1 px-2`}>
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 pt-eq-rise"
            style={{
              animationDelay: `${i * 12}ms`,
              background:
                "linear-gradient(to top, hsl(120,80%,50%) 0%, hsl(50,95%,55%) 60%, hsl(0,90%,55%) 100%)",
              boxShadow: "0 0 12px hsl(var(--primary) / 0.6)",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "glitch") {
    return (
      <>
        <div className={`${base} pt-glitch-flash`} style={{ background: "hsl(0 100% 55% / 0.25)" }} />
        <div className={`${base} pt-glitch-flash-2`} style={{ background: "hsl(195 100% 55% / 0.25)" }} />
        <div
          className={base}
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, hsl(var(--foreground)) 0 1px, transparent 1px 4px)",
            opacity: 0.15,
            mixBlendMode: "overlay",
          }}
        />
      </>
    );
  }

  if (variant === "beat") {
    return (
      <div
        className={`${base} pt-beat-flash`}
        style={{
          background:
            "radial-gradient(circle at center, hsl(var(--primary) / 0.85) 0%, hsl(var(--secondary) / 0.5) 30%, transparent 70%)",
        }}
      />
    );
  }

  // curtain
  return (
    <div className={base}>
      <div
        className="absolute left-0 right-0 top-0 h-1/2 pt-curtain-top"
        style={{ background: "linear-gradient(180deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
      />
      <div
        className="absolute left-0 right-0 bottom-0 h-1/2 pt-curtain-bottom"
        style={{ background: "linear-gradient(0deg, hsl(var(--secondary)), hsl(var(--accent)))" }}
      />
    </div>
  );
};

export default PageTransitionFX;
