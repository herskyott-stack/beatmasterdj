import { useFX } from "@/contexts/FXContext";
import { useEffect, useState } from "react";

const HUDCorners = () => {
  const { fxEnabled, mouseX, mouseY, isDesktop } = useFX();
  const [time, setTime] = useState("");

  useEffect(() => {
    if (!fxEnabled) return;
    const update = () => {
      const d = new Date();
      setTime(d.toTimeString().slice(0, 8));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [fxEnabled]);

  if (!fxEnabled || !isDesktop) return null;

  const cls = "fixed z-[60] font-mono text-[10px] tracking-widest text-primary/70 pointer-events-none select-none uppercase";

  return (
    <>
      <div className={`${cls} top-3 left-3`}>
        <div>● BPM: 128</div>
        <div>SYS: STABLE</div>
      </div>
      <div className={`${cls} top-3 right-3 text-right`}>
        <div>SYS_TIME: {time}</div>
        <div>CH: 01/02</div>
      </div>
      <div className={`${cls} bottom-3 left-3`}>
        <div>LOC: OTTAWA, ON</div>
        <div>BEATMASTER.FX</div>
      </div>
      <div className={`${cls} bottom-3 right-3 text-right`}>
        <div>X: {String(mouseX).padStart(4, "0")}</div>
        <div>Y: {String(mouseY).padStart(4, "0")}</div>
      </div>
    </>
  );
};

export default HUDCorners;
