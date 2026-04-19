import { ReactNode, useRef } from "react";
import { useFX } from "@/contexts/FXContext";

const MagneticButton = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const { fxEnabled, isDesktop } = useFX();
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (!fxEnabled || !isDesktop || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < 120) {
      const pull = (1 - dist / 120) * 0.4;
      ref.current.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
    }
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block transition-transform duration-200 ease-out ${fxEnabled ? "neon-glow-pulse" : ""} ${className}`}
    >
      {children}
    </div>
  );
};

export default MagneticButton;
