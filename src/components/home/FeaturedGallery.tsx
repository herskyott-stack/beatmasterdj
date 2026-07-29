import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play, X } from "lucide-react";

type Item = {
  id: string;
  type: "image" | "video";
  file_path: string;
  title: string | null;
  caption: string | null;
};

const BUCKET = "home-media";

const FeaturedGallery = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState<Item | null>(null);

  useEffect(() => {
    supabase
      .from("home_media")
      .select("*")
      .order("display_order", { ascending: true })
      .then(({ data }) => setItems((data as Item[]) || []));
  }, []);

  if (items.length === 0) return null;

  const publicUrl = (path: string) =>
    supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-display mb-3">
            Featured
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            <span className="gradient-text">Moments & Highlights</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            A look behind the decks — events, setups, and unforgettable nights.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => setOpen(it)}
              className="group relative overflow-hidden rounded-xl border border-primary/20 bg-card/40 backdrop-blur-md shadow-[0_0_30px_hsl(var(--primary) / ,0.08)] hover:shadow-[0_0_40px_hsl(var(--primary) / ,0.25)] hover:border-primary/50 transition-all duration-500"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-black/40">
                {it.type === "image" ? (
                  <img
                    src={publicUrl(it.file_path)}
                    alt={it.title || "Featured media"}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={publicUrl(it.file_path)}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl">
                        <Play className="w-7 h-7 text-primary-foreground fill-current ml-1" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {(it.title || it.caption) && (
                <div className="p-4 text-left bg-gradient-to-t from-background/95 to-background/60">
                  {it.title && <p className="font-display font-semibold">{it.title}</p>}
                  {it.caption && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.caption}</p>}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-4xl bg-background/95 border-primary/30 p-0 overflow-hidden">
          {open && (
            <div className="relative">
              <button
                onClick={() => setOpen(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-background/80 border border-white/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              {open.type === "image" ? (
                <img src={publicUrl(open.file_path)} alt={open.title || ""} className="w-full max-h-[80vh] object-contain bg-black" />
              ) : (
                <video src={publicUrl(open.file_path)} controls autoPlay className="w-full max-h-[80vh] bg-black" />
              )}
              {(open.title || open.caption) && (
                <div className="p-5">
                  {open.title && <p className="font-display text-lg font-semibold">{open.title}</p>}
                  {open.caption && <p className="text-sm text-muted-foreground mt-1">{open.caption}</p>}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default FeaturedGallery;
