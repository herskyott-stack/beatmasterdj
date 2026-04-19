import { useEffect, useState } from "react";
import { useFX } from "@/contexts/FXContext";

type Burst = { id: number; x: number; y: number };

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
];

const BeatDropBurst = () => {
  const { fxEnabled, isDesktop } = useFX();
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    if (!fxEnabled || !isDesktop) return;
    let next = 0;
    const onClick = (e: MouseEvent) => {
      const id = ++next;
      setBursts((prev) => {
        const updated = [...prev, { id, x: e.clientX, y: e.clientY }];
        return updated.slice(-6);
      });
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 700);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [fxEnabled, isDesktop]);

  if (!fxEnabled || !isDesktop) return null;

  return (
    <div className="fixed inset-0 z-[58] pointer-events-none">
      {bursts.map((b) => (
        <div key={b.id} className="absolute" style={{ left: b.x, top: b.y }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const dx = Math.cos(angle) * 60;
            const dy = Math.sin(angle) * 60;
            return (
              <span
                key={i}
                className="beat-particle"
                style={{
                  background: COLORS[i % COLORS.length],
                  ["--dx" as string]: `${dx}px`,
                  ["--dy" as string]: `${dy}px`,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default BeatDropBurst;
