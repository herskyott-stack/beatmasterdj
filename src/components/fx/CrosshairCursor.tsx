import { useFX } from "@/contexts/FXContext";

const CrosshairCursor = () => {
  const { fxEnabled, mouseX, mouseY, isDesktop } = useFX();
  if (!fxEnabled || !isDesktop) return null;

  return (
    <div className="fixed inset-0 z-[55] pointer-events-none">
      <div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        style={{ top: mouseY, boxShadow: "0 0 8px hsl(var(--primary) / 0.6)" }}
      />
      <div
        className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent"
        style={{ left: mouseX, boxShadow: "0 0 8px hsl(var(--primary) / 0.6)" }}
      />
    </div>
  );
};

export default CrosshairCursor;
