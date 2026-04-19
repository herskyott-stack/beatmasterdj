import { useFX } from "@/contexts/FXContext";

const BAR_COUNT = 64;

const EqualizerBars = () => {
  const { fxEnabled, isDesktop } = useFX();
  if (!fxEnabled || !isDesktop) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[40] pointer-events-none flex items-end gap-px h-3 px-1">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          className="flex-1 eq-bar"
          style={{
            animationDelay: `${(i * 17) % 468}ms`,
          }}
        />
      ))}
    </div>
  );
};

export default EqualizerBars;
