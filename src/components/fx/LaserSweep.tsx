import { useFX } from "@/contexts/FXContext";

const LaserSweep = () => {
  const { fxEnabled, isDesktop } = useFX();
  if (!fxEnabled || !isDesktop) return null;

  return (
    <div className="fixed inset-0 z-[35] pointer-events-none overflow-hidden mix-blend-screen">
      <div className="laser-beam laser-magenta" />
      <div className="laser-beam laser-cyan" />
    </div>
  );
};

export default LaserSweep;
