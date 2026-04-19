import { useEffect, useRef } from "react";
import { useFX } from "@/contexts/FXContext";

const ParticleField = () => {
  const { fxEnabled, isDesktop } = useFX();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!fxEnabled || !isDesktop) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const colors = ["38, 85%, 55%", "340, 65%, 62%", "280, 50%, 62%"];
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)],
      a: Math.random() * 0.5 + 0.2,
    }));

    let raf = 0;
    let paused = false;
    const onVis = () => (paused = document.hidden);
    document.addEventListener("visibilitychange", onVis);

    const tick = () => {
      if (!paused) {
        ctx.clearRect(0, 0, w, h);
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.c}, ${p.a})`;
          ctx.shadowBlur = 12;
          ctx.shadowColor = `hsl(${p.c})`;
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [fxEnabled, isDesktop]);

  if (!fxEnabled || !isDesktop) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 z-[1] pointer-events-none" />;
};

export default ParticleField;
