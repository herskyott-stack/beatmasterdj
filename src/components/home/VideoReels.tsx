import { useRef, useState } from "react";
import { Play, Volume2 } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

import reelKathleenTim from "@/assets/videos/reel-kathleen-tim.mp4";
import reelKathleenTimPoster from "@/assets/videos/reel-kathleen-tim-poster.jpg";
import reelDanceFloor from "@/assets/videos/reel-on-the-dance-floor.mp4";
import reelDanceFloorPoster from "@/assets/videos/reel-on-the-dance-floor-poster.jpg";
import reelSmallWedding from "@/assets/videos/reel-small-wedding-big-energy.mp4";
import reelSmallWeddingPoster from "@/assets/videos/reel-small-wedding-big-energy-poster.jpg";
import reelHypeMan from "@/assets/videos/reel-party-hype-man.mp4";
import reelHypeManPoster from "@/assets/videos/reel-party-hype-man-poster.jpg";

/* Real wedding moments, hosted directly — just the video, no embeds,
   no Instagram chrome. One tap plays with full sound (browsers block
   autoplay-with-sound, so the tap is required). */
const REELS: Array<{
  src: string;
  poster: string;
  title: string;
  caption: string;
}> = [
  {
    src: reelKathleenTim,
    poster: reelKathleenTimPoster,
    title: "Kathleen & Tim",
    caption: "Wedding highlights — what a party",
  },
  {
    src: reelDanceFloor,
    poster: reelDanceFloorPoster,
    title: "On the dance floor",
    caption: "When the DJ joins the party",
  },
  {
    src: reelSmallWedding,
    poster: reelSmallWeddingPoster,
    title: "Small wedding, big energy",
    caption: "An intimate guest list that danced all night",
  },
  {
    src: reelHypeMan,
    poster: reelHypeManPoster,
    title: "Party hype man",
    caption: "Dancing so much you'll feel it tomorrow",
  },
];

const ReelCard = ({ reel }: { reel: (typeof REELS)[number] }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  /* The tap-to-start overlay only exists to satisfy autoplay policies
     (browsers block play-with-sound without a gesture). Once the user
     has started playback, hide it for good so pausing keeps the native
     controls (scrub, volume, fullscreen) reachable. */
  const [started, setStarted] = useState(false);

  return (
    <article className="snap-center shrink-0 w-[80vw] max-w-[360px] sm:w-[340px] lg:w-auto lg:max-w-none">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <video
          ref={videoRef}
          className="w-full aspect-[9/16] object-cover"
          src={reel.src}
          poster={reel.poster}
          controls
          playsInline
          preload="metadata"
          loop
          onPlay={() => setStarted(true)}
          aria-label={reel.title}
        />
        {!started && (
          <button
            type="button"
            onClick={() => videoRef.current?.play()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40"
            aria-label={`Play ${reel.title} with sound`}
          >
            <span className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <Play className="w-7 h-7 text-primary-foreground fill-current ml-1" />
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-black/60 border border-white/20 rounded-full px-3 py-1.5">
              <Volume2 className="w-3.5 h-3.5" /> Tap for sound
            </span>
          </button>
        )}
      </div>
      <div className="mt-3 px-1">
        <p className="font-display font-semibold text-white text-sm">
          {reel.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{reel.caption}</p>
      </div>
    </article>
  );
};

const VideoReels = () => {
  const ref = useRevealOnScroll<HTMLElement>();

  return (
    <section
      ref={ref}
      id="videos"
      aria-label="Wedding videos"
      className="py-20 md:py-28 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeader
          index="06"
          eyebrow="Watch"
          title="The dance floor doesn't lie"
          sub="Real wedding moments, filmed live from the booth."
        />

        <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
          {REELS.map((reel) => (
            <ReelCard key={reel.src} reel={reel} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoReels;
