import { useEffect, useRef, useState } from "react";
import { Disc3, Headphones, Music2, Zap } from "lucide-react";
import { useFX } from "@/contexts/FXContext";

const ICONS = [
  { Icon: Disc3, top: "12%", left: "4%", size: 160, factor: 0.15, color: "hsl(var(--primary))", opacity: 0.08 },
  { Icon: Headphones, top: "30%", right: "6%", size: 140, factor: 0.25, color: "hsl(var(--secondary))", opacity: 0.07 },
  { Icon: Music2, bottom: "22%", left: "8%", size: 130, factor: 0.10, color: "hsl(var(--accent))", opacity: 0.07 },
  { Icon: Zap, bottom: "10%", right: "10%", size: 150, factor: 0.20, color: "hsl(var(--primary))", opacity: 0.06 },
] as const;

const FloatingGear = () => {
  const { fxEnabled, isDesktop } = useFX();
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!fxEnabled || !isDesktop) return;

    const update = () => {
      setScrollY(window.scrollY);
      rafRef.current = 0;
    };
    const onScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [fxEnabled, isDesktop]);

  if (!fxEnabled || !isDesktop) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
      {ICONS.map(({ Icon, factor, color, opacity, size, ...pos }, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            ...pos,
            transform: `translate3d(0, ${-scrollY * factor}px, 0)`,
            animationDelay: `${i * 0.7}s`,
            willChange: "transform",
          }}
        >
          <Icon size={size} style={{ color, opacity }} strokeWidth={1.2} />
        </div>
      ))}
    </div>
  );
};

export default FloatingGear;
