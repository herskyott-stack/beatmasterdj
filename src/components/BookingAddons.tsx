import { Sparkles, Camera, Clock, Mic, Wind, Plus, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";

import coldSparklers from "@/assets/addons/cold-sparklers.jpg";
import karaokeRig from "@/assets/gear/denon-mcx8000.jpg";
import dryIce from "@/assets/addons/dry-ice.jpg";
import extraHours from "@/assets/addons/extra-hours.jpg";

const addons = [
  {
    id: "cold-sparklers",
    icon: Sparkles,
    name: "Cold Sparklers",
    price: 300,
    priceDisplay: "$300",
    description: "Stunning indoor-safe sparkler fountains for grand entrances, first dances, or finale moments.",
    popular: true,
    image: coldSparklers,
  },
  {
    id: "photo-booth-basic",
    icon: Camera,
    name: "Photo Booth (No Prints)",
    price: 750,
    priceDisplay: "$750",
    description: "Premium photo booth with props and custom backdrops. Digital copies only.",
    popular: false,
    image: null,
  },
  {
    id: "photo-booth-prints",
    icon: Camera,
    name: "Photo Booth (Unlimited Prints)",
    price: 900,
    priceDisplay: "$900",
    description: "Premium photo booth with props, custom backdrops, and unlimited instant prints for your guests.",
    popular: true,
    image: null,
  },
  {
    id: "extra-hours",
    icon: Clock,
    name: "Extra Hours (x2)",
    price: 400,
    priceDisplay: "$400",
    description: "Extend the party! Add 2 additional hours of DJ service to keep the dance floor going.",
    popular: false,
    image: extraHours,
  },
  {
    id: "karaoke",
    icon: Mic,
    name: "Karaoke Package",
    price: 350,
    priceDisplay: "$350",
    description: "Full karaoke setup with thousands of songs, lyrics display, and wireless microphones.",
    popular: false,
    image: karaokeRig,
  },
  {
    id: "dry-ice",
    icon: Wind,
    name: "Dry Ice Effects",
    price: 250,
    priceDisplay: "$250",
    description: "Dramatic low-lying fog effects for first dances, entrances, and special moments.",
    popular: true,
    image: dryIce,
  },
];

const BookingAddons = () => {
  const { addItem, removeItem, isInCart } = useCart();

  const handleToggleAddon = (addon: typeof addons[0]) => {
    if (isInCart(addon.id)) {
      removeItem(addon.id);
      toast({
        title: "Add-on Removed",
        description: `${addon.name} removed from your cart`,
      });
    } else {
      addItem({
        id: addon.id,
        type: "addon",
        name: addon.name,
        price: addon.price,
        description: addon.description,
      });
      toast({
        title: "Add-on Added",
        description: `${addon.name} added to your cart`,
      });
    }
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          <span className="text-foreground">ENHANCE YOUR </span>
          <span className="gradient-text-secondary">EXPERIENCE</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Add these premium extras to make your event truly unforgettable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {addons.map((addon) => {
          const inCart = isInCart(addon.id);
          return (
            <Card
              key={addon.id}
              variant="glass"
              className={`group transition-all duration-500 hover:scale-[1.02] overflow-hidden flex flex-col ${
                inCart ? "ring-2 ring-secondary" : ""
              }`}
            >
              {addon.image && (
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={addon.image}
                    alt={addon.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  {addon.popular && (
                    <span className="absolute top-3 right-3 px-2 py-1 text-xs font-display uppercase tracking-wider bg-gradient-to-r from-secondary to-accent rounded-full">
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
                    <span className="px-2 py-1 text-xs font-display uppercase tracking-wider bg-gradient-to-r from-secondary to-accent rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-bold mb-2">
                  {addon.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 flex-1">
                  {addon.description}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-xl font-bold text-primary">
                    {addon.priceDisplay}
                    <span className="ml-1 text-[10px] text-muted-foreground font-normal">+ 13% tax</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/addons/${addon.id}`} className="gap-1">
                        <Info className="w-3.5 h-3.5" />
                        Details
                      </Link>
                    </Button>
                    <Button
                      variant={inCart ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handleToggleAddon(addon)}
                    >
                      {inCart ? "Remove" : "Add"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BookingAddons;
