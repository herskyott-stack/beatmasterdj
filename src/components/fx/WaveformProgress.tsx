import { useEffect, useRef, useState } from "react";
import { useFX } from "@/contexts/FXContext";

const BAR_COUNT = 80;

// Pre-compute bar heights with a sine-wave envelope for an audio look
const BAR_HEIGHTS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const t = i / (BAR_COUNT - 1);
  const envelope = Math.sin(t * Math.PI); // peaks in middle
  const wobble = 0.45 + 0.55 * Math.abs(Math.sin(i * 1.7));
  return Math.max(0.18, envelope * wobble);
});

const WaveformProgress = () => {
  const { fxEnabled } = useFX();
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!fxEnabled) return;

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const p = scrollable > 0 ? window.scrollY / scrollable : 0;
      setProgress(Math.max(0, Math.min(1, p)));
      rafRef.current = 0;
    };

    const onScroll = () => {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [fxEnabled]);

  if (!fxEnabled) return null;

  const filledBars = Math.floor(progress * BAR_COUNT);

  return (
    <div className="fixed top-0 left-0 right-0 h-2 z-[80] pointer-events-none flex items-end gap-[1px] px-1">
      {BAR_HEIGHTS.map((h, i) => {
        const active = i <= filledBars;
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-colors duration-150"
            style={{
              height: `${h * 100}%`,
              background: active
                ? `linear-gradient(to top, hsl(var(--primary)), hsl(var(--secondary)))`
                : `hsl(var(--muted-foreground) / 0.18)`,
              boxShadow: active
                ? `0 0 4px hsl(var(--primary) / 0.6)`
                : "none",
            }}
          />
        );
      })}
    </div>
  );
};

export default WaveformProgress;
