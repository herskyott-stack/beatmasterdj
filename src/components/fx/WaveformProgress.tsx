import { useEffect, useRef, useState } from "react";
import { useFX } from "@/contexts/FXContext";

/**
 * Vertical tempo fader (CDJ-3000 style) that doubles as a scroll indicator.
 * Sits on the right edge. The thumb position tracks scroll progress.
 */
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

  // Tempo fader: center is 0%, top is +pitch, bottom is -pitch.
  // Map scroll 0..1 to thumb top 4%..96%.
  const thumbTop = 4 + progress * 92;
  // Display a "pitch" value like a real DJ deck (-8.0 .. +8.0).
  const pitch = (0.5 - progress) * 16;
  const pitchLabel = `${pitch >= 0 ? "+" : ""}${pitch.toFixed(1)}%`;

  // Tick marks along the fader track
  const TICKS = 41;

  return (
    <div
      className="fixed left-1.5 top-24 bottom-24 z-[60] pointer-events-none hidden md:flex items-stretch"
      aria-hidden="true"
    >
      <div className="relative w-7 rounded-md bg-gradient-to-b from-card via-background to-card border border-border shadow-[inset_0_0_8px_hsl(var(--background)/0.8),0_0_12px_hsl(var(--background)/0.5)] flex flex-col items-center py-2">
        {/* Pitch label at top */}
        <div className="font-mono text-[8px] text-primary/80 tracking-wider mb-1 leading-none">
          {pitchLabel}
        </div>

        {/* Fader track */}
        <div className="relative flex-1 w-full flex justify-center">
          {/* Center line guide */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-primary/40" />

          {/* Tick marks (left side) */}
          <div className="absolute left-0.5 top-0 bottom-0 flex flex-col justify-between py-0.5">
            {Array.from({ length: TICKS }).map((_, i) => {
              const isMajor = i % 5 === 0;
              const isCenter = i === Math.floor(TICKS / 2);
              return (
                <div
                  key={i}
                  className={`${isMajor ? "w-2" : "w-1"} h-px ${
                    isCenter ? "bg-primary" : "bg-white/30"
                  }`}
                />
              );
            })}
          </div>

          {/* Tick marks (right side) */}
          <div className="absolute right-0.5 top-0 bottom-0 flex flex-col justify-between py-0.5">
            {Array.from({ length: TICKS }).map((_, i) => {
              const isMajor = i % 5 === 0;
              const isCenter = i === Math.floor(TICKS / 2);
              return (
                <div
                  key={i}
                  className={`${isMajor ? "w-2" : "w-1"} h-px ${
                    isCenter ? "bg-primary" : "bg-white/30"
                  }`}
                />
              );
            })}
          </div>

          {/* Center groove */}
          <div className="w-[2px] h-full bg-black/80 rounded-full shadow-[inset_0_0_2px_rgba(0,0,0,0.9)]" />

          {/* Thumb (slider handle) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-6 h-4 rounded-sm transition-[top] duration-150 ease-out"
            style={{
              top: `${thumbTop}%`,
              transform: "translate(-50%, -50%)",
              background:
                "linear-gradient(to bottom, hsl(var(--muted)) 0%, hsl(var(--background)) 45%, hsl(var(--muted)) 50%, hsl(var(--background)) 55%, hsl(var(--muted)) 100%)",
              boxShadow:
                "0 2px 4px rgba(0,0,0,0.6), inset 0 0 0 1px hsl(var(--border)), 0 0 6px hsl(var(--primary) / 0.35)",
            }}
          >
            {/* Thumb center notch */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-primary shadow-[0_0_4px_hsl(var(--primary))]" />
          </div>
        </div>

        {/* TEMPO label */}
        <div className="font-mono text-[7px] text-muted-foreground/70 tracking-[0.15em] mt-1 leading-none">
          TEMPO
        </div>
      </div>
    </div>
  );
};

export default WaveformProgress;
