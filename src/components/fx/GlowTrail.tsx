import { useEffect, useRef } from "react";
import { useFX } from "@/contexts/FXContext";

const TRAIL = 8;

const GlowTrail = () => {
  const { fxEnabled, isDesktop } = useFX();
  const dotsRef = useRef<HTMLDivElement[]>([]);
  const positions = useRef<{ x: number; y: number }[]>(
    Array.from({ length: TRAIL }, () => ({ x: -100, y: -100 }))
  );
  const target = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!fxEnabled || !isDesktop) return;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      let prev = target.current;
      for (let i = 0; i < TRAIL; i++) {
        const p = positions.current[i];
        p.x += (prev.x - p.x) * 0.35;
        p.y += (prev.y - p.y) * 0.35;
        const el = dotsRef.current[i];
        if (el) el.style.transform = `translate(${p.x}px, ${p.y}px)`;
        prev = p;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [fxEnabled, isDesktop]);

  if (!fxEnabled || !isDesktop) return null;

  return (
    <div className="fixed inset-0 z-[56] pointer-events-none">
      {Array.from({ length: TRAIL }).map((_, i) => {
        const size = 12 - i;
        const opacity = 0.6 - i * 0.07;
        return (
          <div
            key={i}
            ref={(el) => {
              if (el) dotsRef.current[i] = el;
            }}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              background: i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))",
              opacity,
              boxShadow: `0 0 ${10 - i}px currentColor`,
            }}
          />
        );
      })}
    </div>
  );
};

export default GlowTrail;
