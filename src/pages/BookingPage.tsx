import { Check, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Package images
import weddingPackageImg from "@/assets/real/weddings/wedding-reception-tablesetting.jpg";
import corporatePackageImg from "@/assets/corporate/desert-oasis-3.jpg";
import schoolPackageImg from "@/assets/packages/school-package.jpg";
import privatePackageImg from "@/assets/packages/private-package.jpg";
import edmPackageImg from "@/assets/real/club-2.jpg";
import karaokePackageImg from "@/assets/gear/denon-mcx8000.jpg";
import avPackageImg from "@/assets/gear/dmx-console.jpg";

type Package = {
  name: string;
  price: string;
  priceNum: number;
  description: string;
  features: string[];
  featured?: boolean;
};

// Category images map
export const categoryImages: Record<string, string> = {
  weddings: weddingPackageImg,
  corporate: corporatePackageImg,
  schools: schoolPackageImg,
  private: privatePackageImg,
  edm: edmPackageImg,
  karaoke: karaokePackageImg,
  av: avPackageImg,
};

export type { Package };
export const packageData: Record<string, Package[]> = {
  weddings: [
    {
      name: "Essential",
      price: "$1,800",
      priceNum: 1800,
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
      price: "$2,800",
      priceNum: 2800,
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
      price: "$1,200",
      priceNum: 1200,
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
      price: "$1,600",
      priceNum: 1600,
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
      price: "$2,160",
      priceNum: 2160,
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
      price: "$3,000",
      priceNum: 3000,
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
      price: "$1,500",
      priceNum: 1500,
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
      price: "$1,800",
      priceNum: 1800,
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
  karaoke: [
    {
      name: "Basic",
      price: "$400",
      priceNum: 400,
      description: "Small gatherings",
      features: [
        "2 hours of karaoke",
        "2 wireless microphones",
        "Lyrics on TV screen",
        "10,000+ song library",
        "Basic sound system",
      ],
    },
    {
      name: "Standard",
      price: "$600",
      priceNum: 600,
      description: "Perfect for parties",
      features: [
        "3 hours of karaoke",
        "2 wireless microphones",
        "Projected lyrics display",
        "15,000+ song library",
        "Premium sound system",
        "Song request queue",
      ],
      featured: true,
    },
    {
      name: "Premium",
      price: "$850",
      priceNum: 850,
      description: "Enhanced experience",
      features: [
        "4 hours of karaoke",
        "2 wireless microphones",
        "Large screen projection",
        "20,000+ song library",
        "Concert sound system",
        "Stage lighting",
        "Song request queue",
      ],
    },
    {
      name: "Ultimate",
      price: "$1,200",
      priceNum: 1200,
      description: "Full karaoke production",
      features: [
        "5+ hours of karaoke",
        "2 wireless microphones",
        "Dual screen setup",
        "Unlimited song library",
        "Professional sound system",
        "Stage lighting & effects",
        "Song request app",
        "Backup equipment",
      ],
    },
  ],
  av: [
    {
      name: "Basic AV",
      price: "$3,625",
      priceNum: 3625,
      description: "Essential AV setup",
      features: [
        "Professional sound system",
        "2 speaker stacks",
        "Wireless microphones",
        "Basic stage lighting",
        "Setup & teardown",
        "On-site technician",
      ],
    },
    {
      name: "Standard AV",
      price: "$6,500",
      priceNum: 6500,
      description: "Enhanced production",
      features: [
        "Concert-grade sound",
        "4 speaker stacks + subs",
        "Multiple wireless mics",
        "LED uplighting",
        "Projector & screen",
        "Setup & teardown",
        "On-site technician",
        "Backup equipment",
      ],
      featured: true,
    },
    {
      name: "Premium AV",
      price: "$10,750",
      priceNum: 10750,
      description: "Full production package",
      features: [
        "Stadium sound system",
        "Line array speakers",
        "Multiple wireless systems",
        "LED video wall",
        "Intelligent lighting rig",
        "Stage design",
        "Production team",
        "Backup systems",
      ],
    },
    {
      name: "Enterprise AV",
      price: "$17,250",
      priceNum: 17250,
      description: "Large-scale production",
      features: [
        "Multi-zone audio system",
        "Large LED video walls",
        "Full lighting design",
        "Custom staging",
        "Live video production",
        "Multiple camera setup",
        "Full production crew",
        "24/7 support",
        "Complete redundancy",
      ],
    },
  ],
};

const BookingPage = () => {
  const { addItem } = useCart();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Header */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 dj-heading glitch-text">
              <span className="text-foreground">BOOK YOUR </span>
              <span className="gradient-text">EVENT</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Select a package to begin your booking. Add-ons can be added during checkout.
            </p>
          </div>

          {/* Package Tabs */}
          <Tabs defaultValue="weddings" className="max-w-6xl mx-auto">
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

            {Object.entries(packageData).map(([category, packages]) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {packages.map((pkg) => (
                    <Card
                      key={pkg.name}
                      variant={pkg.featured ? "featured" : "glass"}
                      className={`relative transition-all duration-500 hover:scale-[1.02] overflow-hidden ${
                        pkg.featured ? "lg:-mt-4 lg:mb-4" : ""
                      }`}
                    >
                      {/* Background Image */}
                      <div className="absolute inset-0 z-0">
                        <img
                          src={categoryImages[category]}
                          alt=""
                          className="w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-card/60 via-card/80 to-card" />
                      </div>

                      {pkg.featured && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent rounded-full z-10">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-display uppercase tracking-wider">Most Popular</span>
                          </div>
                        </div>
                      )}
                      <CardHeader className="text-center pb-4 relative z-10">
                        <CardTitle className="font-display text-xl">{pkg.name}</CardTitle>
                        <CardDescription>{pkg.description}</CardDescription>
                        <div className="mt-4">
                          <span className="font-display text-4xl font-bold gradient-text">
                            {pkg.price}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-6 relative z-10">
                        <ul className="space-y-3">
                          {pkg.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter className="relative z-10">
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
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;
