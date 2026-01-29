import { Sparkles, Camera, Clock, Mic, Wind, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const addons = [
  {
    icon: Sparkles,
    name: "Cold Sparklers",
    price: "$300",
    description: "Stunning indoor-safe sparkler fountains for grand entrances, first dances, or finale moments.",
    popular: true,
  },
  {
    icon: Camera,
    name: "Photo Booth",
    price: "$500",
    description: "Premium photo booth with props, custom backdrops, and instant prints for your guests.",
    popular: true,
  },
  {
    icon: Clock,
    name: "Extra Hours",
    price: "$200/hr",
    description: "Extend the party! Add additional hours of DJ service to keep the dance floor going.",
    popular: false,
  },
  {
    icon: Mic,
    name: "Karaoke Package",
    price: "$350",
    description: "Full karaoke setup with thousands of songs, lyrics display, and wireless microphones.",
    popular: false,
  },
  {
    icon: Wind,
    name: "Dry Ice Effects",
    price: "$250",
    description: "Dramatic low-lying fog effects for first dances, entrances, and special moments.",
    popular: true,
  },
  {
    icon: Plus,
    name: "Custom Add-On",
    price: "Contact Us",
    description: "Have something specific in mind? Let us create a custom solution for your event.",
    popular: false,
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
          {addons.map((addon) => (
            <Card
              key={addon.name}
              variant="glass"
              className="group transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_hsl(280,85%,60%,0.2)]"
            >
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <addon.icon className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  {addon.popular && (
                    <span className="px-3 py-1 text-xs font-display uppercase tracking-wider bg-gradient-to-r from-secondary to-accent rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl font-bold mb-2 group-hover:gradient-text transition-all duration-300">
                  {addon.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {addon.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-bold text-primary">
                    {addon.price}
                  </span>
                  <Button variant="outline" size="sm">
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
