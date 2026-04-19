import HUDCorners from "./HUDCorners";
import CrosshairCursor from "./CrosshairCursor";
import ParticleField from "./ParticleField";
import ScanlineOverlay from "./ScanlineOverlay";
import ScrollBlur from "./ScrollBlur";
import FXToggle from "./FXToggle";

const FXLayer = () => {
  return (
    <>
      <ParticleField />
      <ScanlineOverlay />
      <CrosshairCursor />
      <HUDCorners />
      <ScrollBlur />
      <FXToggle />
    </>
  );
};

export default FXLayer;
