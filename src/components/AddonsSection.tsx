import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { addons } from "@/data/addons";
import SectionHeader from "@/components/SectionHeader";

const AddonsSection = () => {
  const ref = useRevealOnScroll<HTMLElement>();
  return (
    <section ref={ref} id="addons" className="py-20 md:py-28 relative overflow-hidden bass-drop">
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeader
          index="04"
          eyebrow="Add-Ons"
          title="Enhance your experience"
          sub="Take your event to the next level with our premium add-on services. Tap any card for full details."
        />

        {/* Add-ons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto stagger-fade-in">
          {addons.map((addon) => {
            const Icon = addon.icon;
            const detailHref = addon.customQuoteOnly ? "/contact" : `/addons/${addon.id}`;
            return (
              <Link
                key={addon.id}
                to={detailHref}
                className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
              >
                <Card
                  variant="glass"
                  className="lift-hover group-hover:border-primary/40 flex flex-col overflow-hidden h-full cursor-pointer"
                >
                  {/* Image Section */}
                  {addon.image && (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={addon.image}
                        alt={addon.name}
                        className="w-full h-full object-cover image-zoom"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                      {addon.popular && (
                        <span className="absolute top-3 right-3 px-3 py-1 text-xs font-display uppercase tracking-wider bg-primary text-primary-foreground rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                  )}

                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      {!addon.image && addon.popular && (
                        <span className="px-3 py-1 text-xs font-display uppercase tracking-wider bg-primary text-primary-foreground rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-2">
                      {addon.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 flex-1">
                      {addon.shortDescription}
                    </p>
                    <div className="flex flex-col gap-3 mt-auto">
                      <span className="font-display text-xl font-bold text-primary">
                        {addon.priceDisplay}
                        {!addon.customQuoteOnly && (
                          <span className="ml-2 text-xs text-muted-foreground font-normal">+ 13% tax</span>
                        )}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full group-hover:border-primary/40 transition-colors pointer-events-none"
                      >
                        {addon.customQuoteOnly ? "Request a Quote" : "Learn More"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AddonsSection;
