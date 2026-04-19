import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFX } from "@/contexts/FXContext";

const TapeWipe = () => {
  const { fxEnabled } = useFX();
  const location = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!fxEnabled) return;
    setActive(true);
    const t = setTimeout(() => setActive(false), 350);
    return () => clearTimeout(t);
  }, [location.pathname, fxEnabled]);

  if (!fxEnabled || !active) return null;

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none tape-wipe" />
  );
};

export default TapeWipe;
