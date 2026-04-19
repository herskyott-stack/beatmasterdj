import HUDCorners from "./HUDCorners";
import CrosshairCursor from "./CrosshairCursor";
import ParticleField from "./ParticleField";
import ScanlineOverlay from "./ScanlineOverlay";
// import ScrollBlur from "./ScrollBlur"; // disabled per user request
import FXToggle from "./FXToggle";
import EqualizerBars from "./EqualizerBars";
import VinylSpinner from "./VinylSpinner";
import BeatDropBurst from "./BeatDropBurst";
import LaserSweep from "./LaserSweep";
import SpectrumStrip from "./SpectrumStrip";
import TapeWipe from "./TapeWipe";
import GlowTrail from "./GlowTrail";
import MarqueeTicker from "./MarqueeTicker";

const FXLayer = () => {
  return (
    <>
      <ParticleField />
      <ScanlineOverlay />
      <LaserSweep />
      <CrosshairCursor />
      <GlowTrail />
      <HUDCorners />
      <SpectrumStrip />
      <MarqueeTicker />
      <EqualizerBars />
      <VinylSpinner />
      <BeatDropBurst />
      <TapeWipe />
      <FXToggle />
    </>
  );
};

export default FXLayer;
