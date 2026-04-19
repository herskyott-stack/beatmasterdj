import { useFX } from "@/contexts/FXContext";

const MESSAGE =
  "● UPCOMING ● SAVE 15% OFF UNTIL END OF MAY ● SAVE 20% IF YOU BOOK BEFORE APRIL 30TH ● HERSKY DJ & AV ● OTTAWA, ON ● ";

const MarqueeTicker = () => {
  const { fxEnabled } = useFX();
  if (!fxEnabled) return null;

  return (
    <div className="fixed top-[72px] left-0 right-0 z-[45] pointer-events-none overflow-hidden h-6 bg-background/60 backdrop-blur-sm border-y border-primary/20">
      <div className="marquee-track font-mono text-[11px] text-primary/80 whitespace-nowrap leading-6">
        <span>{MESSAGE.repeat(4)}</span>
        <span>{MESSAGE.repeat(4)}</span>
      </div>
    </div>
  );
};

export default MarqueeTicker;
