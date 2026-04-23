import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type FXContextType = {
  fxEnabled: boolean;
  toggleFX: () => void;
  mouseX: number;
  mouseY: number;
  isDesktop: boolean;
};

const FXContext = createContext<FXContextType | undefined>(undefined);

const STORAGE_KEY = "beatmaster-fx-enabled";

export const FXProvider = ({ children }: { children: ReactNode }) => {
  const [fxEnabled, setFxEnabled] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    // FX disabled by default; ignore any previously stored "true"
    localStorage.setItem(STORAGE_KEY, "false");
    setFxEnabled(false);

    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    if (!fxEnabled) return;
    let raf = 0;
    let nextX = 0, nextY = 0;
    const onMove = (e: MouseEvent) => {
      nextX = e.clientX;
      nextY = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          setMouseX(nextX);
          setMouseY(nextY);
          raf = 0;
        });
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [fxEnabled]);

  const toggleFX = () => {
    setFxEnabled((v) => {
      const next = !v;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <FXContext.Provider value={{ fxEnabled, toggleFX, mouseX, mouseY, isDesktop }}>
      {children}
    </FXContext.Provider>
  );
};

export const useFX = () => {
  const ctx = useContext(FXContext);
  if (!ctx) throw new Error("useFX must be used within FXProvider");
  return ctx;
};
