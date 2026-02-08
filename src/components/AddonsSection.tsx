import { Sparkles, Camera, Clock, Mic, Wind, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Import addon images
import coldSparklers from "@/assets/addons/cold-sparklers.jpg";
import photoBooth from "@/assets/addons/photo-booth.jpg";
import karaoke from "@/assets/addons/karaoke.jpg";
import dryIce from "@/assets/addons/dry-ice.jpg";

const addons = [
  {
    icon: Sparkles,
    name: "Cold Sparklers",
    price: "$300",
    description: "Stunning indoor-safe sparkler fountains for grand entrances, first dances, or finale moments.",
    popular: true,
    image: coldSparklers,
  },
  {
    icon: Camera,
    name: "Photo Booth (No Prints)",
    price: "$750",
    description: "Premium photo booth with props and custom backdrops. Digital copies only.",
    popular: false,
    image: photoBooth,
  },
  {
    icon: Camera,
    name: "Photo Booth (Unlimited Prints)",
    price: "$900",
    description: "Premium photo booth with props, custom backdrops, and unlimited instant prints for your guests.",
    popular: true,
    image: photoBooth,
  },
  {
    icon: Clock,
    name: "Extra Hours",
    price: "$200/hr",
    description: "Extend the party! Add additional hours of DJ service to keep the dance floor going.",
    popular: false,
    image: null,
  },
  {
    icon: Mic,
    name: "Karaoke Package",
    price: "$350",
    description: "Full karaoke setup with thousands of songs, lyrics display, and wireless microphones.",
    popular: false,
    image: karaoke,
  },
  {
    icon: Wind,
    name: "Dry Ice Effects",
    price: "$250",
    description: "Dramatic low-lying fog effects for first dances, entrances, and special moments.",
    popular: true,
    image: dryIce,
  },
  {
    icon: Plus,
    name: "Custom Add-On",
    price: "Contact Us",
    description: "Have something specific in mind? Let us create a custom solution for your event.",
    popular: false,
    image: null,
  },
];

const AddonsSection = () => {
  return (
    <section id="addons" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">ENHANCE YOUR </span>
            <span className="gradient-text">EXPERIENCE</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Take your event to the next level with our premium add-on services.
          </p>
        </div>

        {/* Add-ons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {addons.map((addon, index) => (
            <Card
              key={addon.name}
              variant="glass"
              className="group transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_hsl(var(--accent)/0.2)] flex flex-col overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Section */}
              {addon.image && (
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={addon.image}
                    alt={addon.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  {addon.popular && (
                    <span className="absolute top-3 right-3 px-3 py-1 text-xs font-display uppercase tracking-wider bg-gradient-to-r from-secondary to-accent rounded-full">
                      Popular
                    </span>
                  )}
                </div>
              )}
              
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <addon.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  {!addon.image && addon.popular && (
                    <span className="px-3 py-1 text-xs font-display uppercase tracking-wider bg-gradient-to-r from-secondary to-accent rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl font-bold mb-2 group-hover:gradient-text transition-all duration-300">
                  {addon.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 flex-1">
                  {addon.description}
                </p>
                <div className="flex flex-col gap-3 mt-auto">
                  <span className="font-display text-xl font-bold text-primary">
                    {addon.price}
                  </span>
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-primary/10 transition-colors">
                    Add to Package
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AddonsSection;
