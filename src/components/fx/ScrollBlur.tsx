import { useEffect } from "react";
import { useFX } from "@/contexts/FXContext";

const ScrollBlur = () => {
  const { fxEnabled } = useFX();

  useEffect(() => {
    if (!fxEnabled) return;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let timeout: number | undefined;
    const root = document.getElementById("root");
    if (!root) return;

    const onScroll = () => {
      const now = performance.now();
      const dy = Math.abs(window.scrollY - lastY);
      const dt = now - lastT;
      const speed = dy / Math.max(dt, 1);
      lastY = window.scrollY;
      lastT = now;

      if (speed > 1.5) {
        const blur = Math.min(speed * 0.8, 4);
        root.style.filter = `blur(${blur}px)`;
        root.style.transition = "filter 80ms ease-out";
      }
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        root.style.filter = "blur(0px)";
        root.style.transition = "filter 250ms ease-out";
      }, 90);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timeout);
      root.style.filter = "";
      root.style.transition = "";
    };
  }, [fxEnabled]);

  return null;
};

export default ScrollBlur;
