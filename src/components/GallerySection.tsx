import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

// Import gallery images
import gallery1 from "@/assets/gallery/gallery-1.jpg";
import gallery2 from "@/assets/gallery/gallery-2.jpg";
import gallery3 from "@/assets/gallery/gallery-3.jpg";
import gallery4 from "@/assets/gallery/gallery-4.jpg";
import gallery5 from "@/assets/gallery/gallery-5.jpg";
import gallery6 from "@/assets/gallery/gallery-6.jpg";

const galleryImages = [
  { src: gallery1, alt: "Wedding celebration with DJ", category: "Wedding" },
  { src: gallery2, alt: "Concert crowd energy", category: "EDM Event" },
  { src: gallery3, alt: "DJ mixing at event", category: "Private Party" },
  { src: gallery4, alt: "Festival atmosphere", category: "Corporate Gala" },
  { src: gallery5, alt: "Dance floor packed", category: "School Prom" },
  { src: gallery6, alt: "Live performance", category: "Wedding" },
];

const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const ref = useRevealOnScroll<HTMLElement>();

  return (
    <section ref={ref} id="gallery" className="py-24 relative overflow-hidden bass-drop">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="font-display text-sm uppercase tracking-widest text-primary mb-4 block">
            Our Work
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 dj-heading glitch-text">
            <span className="text-foreground">EVENT </span>
            <span className="gradient-text">GALLERY</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Moments captured from our most memorable events
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {galleryImages.map((image, index) => (
            <Card
              key={index}
              variant="glass"
              className="group cursor-pointer overflow-hidden aspect-square transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_hsl(var(--primary)/0.3)] animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedImage(image.src)}
            >
              <div className="relative w-full h-full">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="inline-block px-3 py-1 text-xs font-display uppercase tracking-wider bg-primary/90 rounded-full">
                    {image.category}
                  </span>
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
            <img
              src={selectedImage}
              alt="Gallery image"
              className="w-full h-auto rounded-xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default GallerySection;
