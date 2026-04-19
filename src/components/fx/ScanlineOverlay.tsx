import { useFX } from "@/contexts/FXContext";

const ScanlineOverlay = () => {
  const { fxEnabled } = useFX();
  if (!fxEnabled) return null;
  return (
    <div
      className="fixed inset-0 z-[58] pointer-events-none opacity-[0.06] mix-blend-overlay"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, hsl(var(--foreground)) 0px, hsl(var(--foreground)) 1px, transparent 1px, transparent 3px)",
        animation: "scanlines 8s linear infinite",
      }}
    />
  );
};

export default ScanlineOverlay;
