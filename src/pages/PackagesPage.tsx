import { Check, Star, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Import category hero images
import weddingHero from "@/assets/categories/wedding-hero.jpg";
import corporateHero from "@/assets/categories/corporate-hero.jpg";
import schoolHero from "@/assets/categories/school-hero.jpg";
import privateHero from "@/assets/categories/private-hero.jpg";
import edmHero from "@/assets/categories/edm-hero.jpg";
import karaokeHero from "@/assets/categories/karaoke-hero.jpg";
import avHero from "@/assets/categories/av-hero.jpg";

type Package = {
  name: string;
  price: string;
  priceNum: number;
  description: string;
  features: string[];
  featured?: boolean;
};

const categoryHeroImages: Record<string, string> = {
  weddings: weddingHero,
  corporate: corporateHero,
  schools: schoolHero,
  private: privateHero,
  edm: edmHero,
  karaoke: karaokeHero,
  av: avHero,
};

const packageData: Record<string, { title: string; description: string; packages: Package[] }> = {
  weddings: {
    title: "Wedding Packages",
    description: "Make your special day unforgettable with romantic melodies and dance floor hits.",
    packages: [
      {
        name: "Essential",
        price: "$1,750",
        priceNum: 1750,
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
  },
  corporate: {
    title: "Corporate Event Packages",
    description: "Professional entertainment for galas, conferences, and company celebrations.",
    packages: [
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
  },
  schools: {
    title: "School Event Packages",
    description: "Age-appropriate music for proms, homecoming, and school functions.",
    packages: [
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
        price: "$1,440",
        priceNum: 1440,
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
  },
  private: {
    title: "Private Event Packages",
    description: "Birthdays, anniversaries, and celebrations tailored to your taste.",
    packages: [
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
  },
  edm: {
    title: "EDM Event Packages",
    description: "High-energy electronic dance music for clubs and festival-style parties.",
    packages: [
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
  },
  karaoke: {
    title: "Karaoke Packages",
    description: "Sing your heart out with 2 wireless microphones and projected lyrics on screen.",
    packages: [
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
  },
  av: {
    title: "AV Production Packages",
    description: "Full audio-visual production with LED walls, staging, and professional sound systems.",
    packages: [
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
  },
};

const PackagesPage = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const { addItem } = useCart();

  const categoryData = category ? packageData[category] : null;

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl font-bold mb-4">Category Not Found</h1>
            <Button variant="outline" asChild>
              <Link to="/">Go Back Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSelectPackage = (pkg: Package) => {
    const id = `${category}-${pkg.name}`.toLowerCase().replace(/\s/g, "-");
    addItem({
      id,
      type: "package",
      category: category!.charAt(0).toUpperCase() + category!.slice(1),
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
      <main className="pt-32 pb-16">
        {/* Back Button */}
        <div className="container mx-auto px-4 mb-8">
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Hero Image Header */}
        <div className="container mx-auto px-4 mb-16">
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8">
            <img
              src={category ? categoryHeroImages[category] : weddingHero}
              alt={categoryData.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 dj-heading glitch-text">
                <span className="gradient-text">{categoryData.title.toUpperCase()}</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{categoryData.description}</p>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {categoryData.packages.map((pkg) => (
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
                    <span className="font-display text-4xl font-bold gradient-text">{pkg.price}</span>
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
                    onClick={() => handleSelectPackage(pkg)}
                  >
                    Select Package
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 mt-16">
          <Card variant="neon" className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h2 className="font-display text-2xl font-bold mb-2">Need a Custom Package?</h2>
              <p className="text-muted-foreground mb-6">
                Contact us to create a tailored package for your specific needs
              </p>
              <Button variant="outline" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PackagesPage;
