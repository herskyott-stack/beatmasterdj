import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFX } from "@/contexts/FXContext";

type Variant = "sheen" | "iris" | "veil" | "bars";
const VARIANTS: Variant[] = ["sheen", "iris", "veil", "bars"];
const DURATION = 800;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

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
    if (prefersReducedMotion()) return;

    let idx = Math.floor(Math.random() * VARIANTS.length);
    if (idx === lastIdx.current) idx = (idx + 1) % VARIANTS.length;
    lastIdx.current = idx;
    setVariant(VARIANTS[idx]);
    const t = setTimeout(() => setVariant(null), DURATION);
    return () => clearTimeout(t);
  }, [location.pathname, fxEnabled]);

  if (!fxEnabled || !variant) return null;

  const base = "fixed inset-0 z-[80] pointer-events-none overflow-hidden";

  if (variant === "sheen") {
    return (
      <div className={base}>
        <div
          className="absolute inset-0 pt-sheen"
          style={{
            background:
              "linear-gradient(115deg, transparent 35%, hsl(var(--primary) / 0.18) 48%, hsl(var(--foreground) / 0.08) 52%, transparent 65%)",
            filter: "blur(8px)",
          }}
        />
      </div>
    );
  }

  if (variant === "iris") {
    return (
      <div
        className={`${base} pt-iris`}
        style={{
          background: "hsl(var(--background))",
        }}
      />
    );
  }

  if (variant === "veil") {
    return (
      <div className={base}>
        <div
          className="absolute inset-x-0 bottom-0 h-full pt-veil"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(20 12% 8%) 100%)",
            borderTop: "1px solid hsl(var(--primary) / 0.6)",
            boxShadow: "0 -1px 24px hsl(var(--primary) / 0.15)",
          }}
        />
      </div>
    );
  }

  // bars
  return (
    <div className={base}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute inset-x-0 pt-bar-fade"
          style={{
            top: `${i * 33.34}%`,
            height: "33.34%",
            background: "hsl(var(--background))",
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  );
};

export default PageTransitionFX;
