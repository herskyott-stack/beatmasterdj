import { Zap, ZapOff } from "lucide-react";
import { useFX } from "@/contexts/FXContext";

const FXToggle = () => {
  const { fxEnabled, toggleFX } = useFX();
  return (
    <button
      onClick={toggleFX}
      aria-label={fxEnabled ? "Disable FX mode" : "Enable FX mode"}
      title={fxEnabled ? "FX Mode: ON" : "FX Mode: OFF"}
      className={`fixed bottom-4 right-4 z-[70] w-12 h-12 rounded-full flex items-center justify-center border backdrop-blur-md transition-all duration-300 ${
        fxEnabled
          ? "bg-primary/20 border-primary text-primary shadow-[0_0_20px_hsl(var(--primary)/0.6)]"
          : "bg-background/70 border-white/20 text-muted-foreground hover:text-primary hover:border-primary/50"
      }`}
    >
      {fxEnabled ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
    </button>
  );
};

export default FXToggle;
