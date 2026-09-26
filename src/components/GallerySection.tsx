import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import SectionHeader from "@/components/SectionHeader";

// Import gallery images
import gallery1 from "@/assets/gallery/gallery-1.jpg";
import gallery2 from "@/assets/gallery/gallery-2.jpg";
import gallery3 from "@/assets/gallery/gallery-3.jpg";
import gallery4 from "@/assets/gallery/gallery-4.jpg";
// Verified real photo: DJ Hersky live, arms raised over a packed crowd
import gallery5 from "@/assets/real/gallery-crowd.jpg";
// Real photo: packed dance floor at one of DJ Hersky's wedding gigs
import gallery6 from "@/assets/real/weddings/wedding-dance-floor.jpg";

// Real photos: DJ Hersky live at Desert Oasis, Canadian Museum of Nature
import corpLive1 from "@/assets/corporate/desert-oasis-1.jpg";
import corpLive2 from "@/assets/corporate/desert-oasis-2.jpg";
import corpLive3 from "@/assets/corporate/desert-oasis-3.jpg";

// Real wedding photos from DJ Hersky's own wedding gigs
import wedSign from "@/assets/real/weddings/wedding-sign-charlene-vincent.jpg";
import wedWine from "@/assets/real/weddings/wedding-wine-bottle.jpg";
import wedBooth from "@/assets/real/weddings/wedding-clara-shane.jpg";
import wedCeremony from "@/assets/real/weddings/wedding-forest-ceremony.jpg";
import wedHall from "@/assets/real/weddings/wedding-reception-hall-2025.jpg";
// Sydney & Blake wedding (shot by Yash Patel) — Jake DJ'd this wedding
import sbFirstDance from "@/assets/real/weddings/sydney-blake-first-dance.jpg";
import sbGroupCheer from "@/assets/real/weddings/sydney-blake-group-cheer.jpg";
// Real club photos of DJ Hersky
import club1 from "@/assets/real/club-1.jpg";
import club2 from "@/assets/real/club-2.jpg";
import club3 from "@/assets/real/club-3.jpg";
import club4 from "@/assets/real/club-4.jpg";
import club5 from "@/assets/real/club-5.jpg";
import parford1 from "@/assets/real/parford-1.jpg";
import parford2 from "@/assets/real/parford-2.jpg";

const galleryImages: Array<{ src: string; alt: string; category: string; credit?: string }> = [
  { src: gallery1, alt: "Confetti over a packed wedding dance floor", category: "Wedding" },
  { src: gallery2, alt: "Concert crowd energy", category: "EDM Event" },
  { src: gallery3, alt: "DJ mixing at event", category: "Private Party" },
  { src: gallery4, alt: "Festival atmosphere", category: "Corporate Gala" },
  { src: gallery5, alt: "DJ Hersky live, crowd going off", category: "EDM Event" },
  { src: gallery6, alt: "Packed wedding dance floor", category: "Wedding" },
  { src: wedSign, alt: "Welcome sign at Charlene and Vincent's wedding, Wakefield QC", category: "Wedding" },
  { src: wedWine, alt: "Custom wine bottle at a Beatmaster DJ wedding", category: "Wedding" },
  { src: wedBooth, alt: "DJ Hersky in the photo booth at Clara and Shane's wedding", category: "Wedding" },
  { src: wedCeremony, alt: "Forest wedding ceremony by DJ Hersky", category: "Wedding" },
  { src: wedHall, alt: "Elegant wedding reception hall", category: "Wedding" },
  { src: sbFirstDance, alt: "First dance at Sydney and Blake's wedding", category: "Wedding", credit: "Yash Patel Photography" },
  { src: sbGroupCheer, alt: "The whole wedding crew cheering for Sydney and Blake", category: "Wedding", credit: "Yash Patel Photography" },
  { src: corpLive1, alt: "DJ Hersky live at Desert Oasis, Canadian Museum of Nature", category: "Corporate Gala", credit: "Tim Skinner © Canadian Museum of Nature" },
  { src: corpLive2, alt: "DJ Hersky on Denon decks at Desert Oasis, Canadian Museum of Nature", category: "Corporate Gala", credit: "Tim Skinner © Canadian Museum of Nature" },
  { src: corpLive3, alt: "DJ Hersky performing at Desert Oasis, Canadian Museum of Nature", category: "Corporate Gala", credit: "Tim Skinner © Canadian Museum of Nature" },
  { src: club1, alt: "DJ Hersky in the red-lit booth", category: "EDM Event" },
  { src: club2, alt: "DJ Hersky early banner set", category: "EDM Event" },
  { src: club3, alt: "DJ Hersky with light trails", category: "EDM Event" },
  { src: club4, alt: "DJ Hersky in red and blue light", category: "EDM Event" },
  { src: club5, alt: "DJ Hersky club set with green headphones", category: "EDM Event" },
  { src: parford1, alt: "DJ Hersky at PARFORD FMG with LED backdrop", category: "EDM Event" },
  { src: parford2, alt: "DJ Hersky performing at PARFORD FMG", category: "EDM Event" },
];

const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const ref = useRevealOnScroll<HTMLElement>();

  return (
    <section ref={ref} id="gallery" className="py-20 md:py-28 relative overflow-hidden bg-card/40 border-y border-white/5 bass-drop">
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeader
          index="05"
          eyebrow="Our Work"
          title="Real events, real energy"
          sub="Moments captured from our most memorable events."
        />

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {galleryImages.map((image, index) => (
            <Card
              key={index}
              variant="glass"
              className="group cursor-pointer overflow-hidden aspect-square hover:border-primary/40 lift-hover"
              onClick={() => setSelectedImage(image.src)}
            >
              <div className="relative w-full h-full">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover image-zoom"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="inline-block px-3 py-1 text-xs font-display uppercase tracking-wider bg-primary text-primary-foreground rounded-full">
                    {image.category}
                  </span>
                  {image.credit && (
                    <p className="text-[10px] text-white/80 mt-2 bg-black/50 inline-block px-2 py-1 rounded">
                      {image.credit}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          {selectedImage && (
            <div>
              <img
                src={selectedImage}
                alt="Gallery image"
                className="w-full h-auto rounded-xl"
              />
              {galleryImages.find((i) => i.src === selectedImage)?.credit && (
                <p className="text-xs text-white/70 text-center mt-3">
                  {galleryImages.find((i) => i.src === selectedImage)?.credit}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default GallerySection;
