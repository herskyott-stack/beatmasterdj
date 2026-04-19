import { useFX } from "@/contexts/FXContext";

const SpectrumStrip = () => {
  const { fxEnabled } = useFX();
  if (!fxEnabled) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[70] pointer-events-none spectrum-strip" />
  );
};

export default SpectrumStrip;
