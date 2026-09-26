import { useEffect } from "react";
import { Play } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

/* Real wedding moments, embedded straight from Instagram.
   Official instagram-media embeds — no downloads, no re-uploads. */
const REELS: Array<{ permalink: string; title: string; caption: string }> = [
  {
    permalink: "https://www.instagram.com/reel/C7kNa09RlnO/",
    title: "Kathleen & Tim",
    caption: "Wedding highlights — what a party",
  },
  {
    permalink: "https://www.instagram.com/reel/C8F2jduxfpc/",
    title: "On the dance floor",
    caption: "When the DJ joins the party",
  },
  {
    permalink: "https://www.instagram.com/reel/C8u8MLuRP76/",
    title: "Small wedding, big energy",
    caption: "An intimate guest list that danced all night",
  },
  {
    permalink: "https://www.instagram.com/reel/C9Nk9iNxiZu/",
    title: "Party hype man",
    caption: "Dancing so much you'll feel it tomorrow",
  },
];

const VideoReels = () => {
  const ref = useRevealOnScroll<HTMLElement>();

  useEffect(() => {
    const process = () => window.instgrm?.Embeds.process();
    if (window.instgrm) {
      process();
      return;
    }
    const existing = document.querySelector(
      'script[src="https://www.instagram.com/embed.js"]'
    );
    if (existing) {
      existing.addEventListener("load", process);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = process;
    document.body.appendChild(script);
  }, []);

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
              key={reel.permalink}
              className="snap-center shrink-0 w-[80vw] max-w-[360px] sm:w-[340px] lg:w-auto lg:max-w-none"
            >
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-card/60 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                <blockquote
                  className="instagram-media !m-0 !border-0 !shadow-none !rounded-none w-full"
                  data-instgrm-permalink={reel.permalink}
                  data-instgrm-version="14"
                >
                  <a
                    href={reel.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground"
                  >
                    <Play className="w-4 h-4 text-primary" />
                    Watch on Instagram
                  </a>
                </blockquote>
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
