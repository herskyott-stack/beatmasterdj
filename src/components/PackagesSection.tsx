import { Check, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useRef } from "react";

type Package = {
  name: string;
  price: string;
  priceNum: number;
  description: string;
  features: string[];
  featured?: boolean;
};

const packageData: Record<string, Package[]> = {
  weddings: [
    {
      name: "Essential",
      price: "$1,500",
      priceNum: 1500,
      description: "Perfect for intimate ceremonies",
      features: [
        "4 hours of DJ service",
        "Professional sound system",
        "Wireless microphone",
        "Basic lighting package",
        "Music consultation",
        "MC services",
      ],
    },
    {
      name: "Classic",
      price: "$2,500",
      priceNum: 2500,
      description: "Our most popular wedding package",
      features: [
        "6 hours of DJ service",
        "Premium sound system",
        "2 wireless microphones",
        "Enhanced lighting package",
        "Music consultation",
        "MC services",
        "Custom playlist creation",
        "Ceremony music",
      ],
      featured: true,
    },
    {
      name: "Premium",
      price: "$3,500",
      priceNum: 3500,
      description: "Elevated entertainment experience",
      features: [
        "8 hours of DJ service",
        "Premium sound system",
        "3 wireless microphones",
        "Professional lighting rig",
        "Unlimited consultations",
        "MC services",
        "Custom playlist creation",
        "Ceremony & cocktail hour",
        "Backup equipment",
      ],
    },
    {
      name: "Ultimate",
      price: "$5,000",
      priceNum: 5000,
      description: "The complete luxury experience",
      features: [
        "10 hours of DJ service",
        "Concert-grade sound system",
        "4 wireless microphones",
        "Intelligent lighting system",
        "Unlimited consultations",
        "MC services",
        "Custom playlist creation",
        "Full day coverage",
        "Backup DJ & equipment",
        "Live mixing & remixes",
      ],
    },
  ],
  corporate: [
    {
      name: "Starter",
      price: "$1,800",
      priceNum: 1800,
      description: "Ideal for small gatherings",
      features: [
        "4 hours of DJ service",
        "Professional sound system",
        "Background music curation",
        "Basic lighting",
        "Setup & breakdown",
      ],
    },
    {
      name: "Professional",
      price: "$2,500",
      priceNum: 2500,
      description: "Perfect for corporate celebrations",
      features: [
        "6 hours of DJ service",
        "Premium sound system",
        "Custom corporate playlist",
        "Enhanced lighting",
        "Wireless microphones",
        "MC services",
        "Event coordination",
      ],
      featured: true,
    },
    {
      name: "Executive",
      price: "$3,500",
      priceNum: 3500,
      description: "High-end corporate entertainment",
      features: [
        "8 hours of DJ service",
        "Concert-grade sound",
        "Custom branding integration",
        "Professional lighting rig",
        "Multiple microphones",
        "Full MC services",
        "Event coordination",
        "On-site technician",
      ],
    },
    {
      name: "Enterprise",
      price: "$5,000",
      priceNum: 5000,
      description: "Large-scale corporate events",
      features: [
        "10+ hours of service",
        "Multi-zone audio system",
        "Full AV integration",
        "Intelligent lighting system",
        "Multiple DJ setup",
        "Full production team",
        "Brand activation support",
        "Post-event highlights",
      ],
    },
  ],
  schools: [
    {
      name: "Basic",
      price: "$1,800",
      priceNum: 1800,
      description: "School dances & events",
      features: [
        "3 hours of DJ service",
        "Age-appropriate music",
        "Sound system",
        "Basic lighting",
        "Microphone for announcements",
      ],
    },
    {
      name: "Standard",
      price: "$1,200",
      priceNum: 1200,
      description: "Enhanced school events",
      features: [
        "4 hours of DJ service",
        "Age-appropriate music",
        "Premium sound system",
        "Dance floor lighting",
        "Microphone",
        "Interactive games",
      ],
      featured: true,
    },
    {
      name: "Prom Package",
      price: "$1,800",
      priceNum: 1800,
      description: "Perfect for prom night",
      features: [
        "5 hours of DJ service",
        "Custom prom playlist",
        "Concert sound system",
        "Professional lighting",
        "Fog machine",
        "Photo booth integration",
        "MC services",
      ],
    },
    {
      name: "Homecoming",
      price: "$2,500",
      priceNum: 2500,
      description: "Ultimate homecoming experience",
      features: [
        "6 hours of DJ service",
        "Custom themed playlist",
        "Full sound system",
        "Stadium lighting setup",
        "Multiple effect machines",
        "Dance competitions",
        "MC & crowd engagement",
        "Spirit song mixing",
      ],
    },
  ],
  private: [
    {
      name: "Party Starter",
      price: "$1,800",
      priceNum: 1800,
      description: "Great for birthday parties",
      features: [
        "3 hours of DJ service",
        "Sound system",
        "Basic lighting",
        "Music requests",
        "Setup & breakdown",
      ],
    },
    {
      name: "Celebration",
      price: "$1,500",
      priceNum: 1500,
      description: "Milestone celebrations",
      features: [
        "4 hours of DJ service",
        "Premium sound system",
        "Party lighting package",
        "Wireless microphone",
        "Custom playlist",
        "MC services",
      ],
      featured: true,
    },
    {
      name: "VIP Party",
      price: "$2,500",
      priceNum: 2500,
      description: "Exclusive private events",
      features: [
        "6 hours of DJ service",
        "Concert-grade sound",
        "Professional lighting",
        "Fog/haze machine",
        "Custom playlist",
        "MC & entertainment",
        "Game coordination",
      ],
    },
    {
      name: "Extravaganza",
      price: "$4,000",
      priceNum: 4000,
      description: "Luxury party experience",
      features: [
        "8 hours of DJ service",
        "Multi-room audio",
        "Intelligent lighting",
        "Full effects package",
        "Unlimited music requests",
        "MC & entertainment",
        "Event coordination",
        "Backup equipment",
      ],
    },
  ],
  edm: [
    {
      name: "Club Night",
      price: "$1,500",
      priceNum: 1500,
      description: "Club-style experience",
      features: [
        "4 hours of DJ service",
        "EDM-focused setlist",
        "Club sound system",
        "Basic lighting & lasers",
        "Live mixing",
      ],
    },
    {
      name: "Rave Ready",
      price: "$2,500",
      priceNum: 2500,
      description: "Festival-inspired energy",
      features: [
        "6 hours of DJ service",
        "Full EDM production",
        "Festival sound system",
        "Laser show",
        "LED panels",
        "Live mixing & drops",
        "CO2 jets",
      ],
      featured: true,
    },
    {
      name: "Festival",
      price: "$4,000",
      priceNum: 4000,
      description: "Full festival production",
      features: [
        "8 hours of DJ service",
        "Multi-genre EDM sets",
        "Concert sound system",
        "Full laser array",
        "LED wall panels",
        "Pyrotechnics",
        "Live remixing",
        "Visual effects",
      ],
    },
    {
      name: "Ultra",
      price: "$5,000",
      priceNum: 5000,
      description: "Ultimate EDM experience",
      features: [
        "10+ hours of service",
        "Multiple DJ rotations",
        "Stadium sound system",
        "360° laser experience",
        "Massive LED setup",
        "Full pyro package",
        "Live production",
        "VIP area audio",
        "Recording included",
      ],
    },
  ],
};

const PackagesSection = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const packagesRef = useRef<HTMLDivElement>(null);

  const handleSelectPackage = (category: string, pkg: Package) => {
    const id = `${category}-${pkg.name}`.toLowerCase().replace(/\s/g, "-");
    addItem({
      id,
      type: "package",
      category: category.charAt(0).toUpperCase() + category.slice(1),
      name: pkg.name,
      price: pkg.priceNum,
      description: pkg.description,
      features: pkg.features,
    });
    navigate("/checkout");
  };

  const handleTabChange = () => {
    // Scroll to the packages section when changing tabs
    packagesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="packages" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">PRICING </span>
            <span className="gradient-text-secondary">PACKAGES</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Choose the perfect package for your event. All packages are fully customizable to meet your specific needs.
          </p>
        </div>

        {/* Package Tabs */}
        <Tabs defaultValue="weddings" className="max-w-6xl mx-auto" onValueChange={handleTabChange}>
          <TabsList className="flex flex-wrap justify-center gap-2 mb-12 bg-transparent h-auto p-0">
            {Object.keys(packageData).map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="font-display uppercase tracking-wider px-6 py-3 rounded-full border border-white/10 bg-card/50 backdrop-blur-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:border-transparent transition-all duration-300"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <div ref={packagesRef}>
            {Object.entries(packageData).map(([category, packages]) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {packages.map((pkg) => (
                    <Card
                      key={pkg.name}
                      variant={pkg.featured ? "featured" : "glass"}
                      className={`relative transition-all duration-500 hover:scale-[1.02] ${
                        pkg.featured ? "lg:-mt-4 lg:mb-4" : ""
                      }`}
                    >
                      {pkg.featured && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent rounded-full">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-display uppercase tracking-wider">Most Popular</span>
                          </div>
                        </div>
                      )}
                      <CardHeader className="text-center pb-4">
                        <CardTitle className="font-display text-xl">{pkg.name}</CardTitle>
                        <CardDescription>{pkg.description}</CardDescription>
                        <div className="mt-4">
                          <span className="font-display text-4xl font-bold gradient-text">
                            {pkg.price}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-6">
                        <ul className="space-y-3">
                          {pkg.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant={pkg.featured ? "hero" : "outline"}
                          className="w-full"
                          onClick={() => handleSelectPackage(category, pkg)}
                        >
                          Select Package
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
};

export default PackagesSection;
