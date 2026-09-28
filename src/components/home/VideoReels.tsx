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
   no Instagram chrome. Native player: tap to play with sound. */
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
            <article
              key={reel.src}
              className="snap-center shrink-0 w-[80vw] max-w-[360px] sm:w-[340px] lg:w-auto lg:max-w-none"
            >
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                <video
                  className="w-full aspect-[9/16] object-cover"
                  src={reel.src}
                  poster={reel.poster}
                  controls
                  playsInline
                  preload="metadata"
                  loop
                  aria-label={reel.title}
                />
              </div>
              <div className="mt-3 px-1">
                <p className="font-display font-semibold text-white text-sm">
                  {reel.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {reel.caption}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoReels;
