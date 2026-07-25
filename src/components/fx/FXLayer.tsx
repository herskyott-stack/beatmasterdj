import HUDCorners from "./HUDCorners";
import CrosshairCursor from "./CrosshairCursor";
import ParticleField from "./ParticleField";
import ScanlineOverlay from "./ScanlineOverlay";
// import ScrollBlur from "./ScrollBlur"; // disabled per user request

import EqualizerBars from "./EqualizerBars";
import VinylSpinner from "./VinylSpinner";
import BeatDropBurst from "./BeatDropBurst";
import LaserSweep from "./LaserSweep";
import SpectrumStrip from "./SpectrumStrip";
import PageTransitionFX from "./PageTransitionFX";
import GlowTrail from "./GlowTrail";
// import WaveformProgress from "./WaveformProgress"; // disabled per user request
import FloatingGear from "./FloatingGear";

const FXLayer = () => {
  return (
    <>
      <FloatingGear />
      <ParticleField />
      {/* <WaveformProgress /> disabled per user request */}
      <ScanlineOverlay />
      <LaserSweep />
      <CrosshairCursor />
      <GlowTrail />
      <HUDCorners />
      {/* <SpectrumStrip /> removed — replaced by vertical tempo fader */}
      <EqualizerBars />
      <VinylSpinner />
      <BeatDropBurst />
      <PageTransitionFX />
      
    </>
  );
};

export default FXLayer;
