import { Check, Star, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GearSection from "@/components/GearSection";

// Import category hero images
import weddingHero from "@/assets/real/weddings/wedding-forest-ceremony.jpg";
import corporateHero from "@/assets/categories/corporate-hero.jpg";
import schoolHero from "@/assets/categories/school-hero.jpg";
import privateHero from "@/assets/categories/private-hero.jpg";
import edmHero from "@/assets/categories/edm-hero.jpg";
import karaokeHero from "@/assets/gear/denon-mcx8000.jpg";
import avHero from "@/assets/real/parford-1.jpg";

// Real photos: DJ Hersky live at Desert Oasis, Canadian Museum of Nature
import corpLive1 from "@/assets/corporate/desert-oasis-1.jpg";
import corpLive2 from "@/assets/corporate/desert-oasis-2.jpg";
import corpLive3 from "@/assets/corporate/desert-oasis-3.jpg";

// Real performance photos of DJ Hersky
import edmLive from "@/assets/real/edm.jpg";
import clubLive1 from "@/assets/real/club-1.jpg";
import parfordLive1 from "@/assets/real/parford-1.jpg";
import privateLive from "@/assets/real/private.jpg";
import clubLive3 from "@/assets/real/club-3.jpg";
import heroLive from "@/assets/real/hero.jpg";
// Real product photo: ADJ WMX1 — DJ Hersky's own lighting controller
import wmx1Live from "@/assets/gear/wmx1.webp";
import decksLive from "@/assets/real/mentorship.jpg";
import parfordLive2 from "@/assets/real/parford-2.jpg";

// Real wedding photos from DJ Hersky's own wedding gigs
import weddingCeremony from "@/assets/real/weddings/wedding-forest-ceremony.jpg";
import weddingHall2025 from "@/assets/real/weddings/wedding-reception-hall-2025.jpg";
import weddingHall2024 from "@/assets/real/weddings/wedding-reception-hall-2024.jpg";
import weddingReception from "@/assets/real/weddings/wedding-reception-tablesetting.jpg";
import weddingDanceFloor from "@/assets/real/weddings/wedding-dance-floor.jpg";
import weddingToasts from "@/assets/real/weddings/wedding-tent-toasts.jpg";
// Personality row: the fun, human side of Jake's wedding gigs
import weddingBouquet from "@/assets/real/weddings/wedding-bouquet-catch.jpg";
import weddingBooth from "@/assets/real/weddings/wedding-clara-shane.jpg";
import weddingBridalParty from "@/assets/real/weddings/wedding-bridal-party.jpg";
import weddingSign from "@/assets/real/weddings/wedding-sign-charlene-vincent.jpg";
import weddingWine from "@/assets/real/weddings/wedding-wine-bottle.jpg";
// Sydney & Blake wedding (shot by Yash Patel) — Jake DJ'd this wedding
import sbTentDance from "@/assets/real/weddings/sydney-blake-tent-dance.jpg";
import sbDanceFloor from "@/assets/real/weddings/sydney-blake-dance-floor.jpg";
import sbEntrance from "@/assets/real/weddings/sydney-blake-grand-entrance.jpg";

// Real gear that powers karaoke nights
import mcx8000Gear from "@/assets/gear/denon-mcx8000.jpg";
import movingHeadGear from "@/assets/gear/moving-head.jpg";
import pixelBarGear from "@/assets/gear/pixel-bar.jpg";

type StripPhoto = { src: string; credit?: string };

// Real-photo strips per package category (only where we have real photos)
const realPhotoStrips: Record<string, { titleA: string; titleB: string; blurb: string; alt: string; photos: StripPhoto[] }> = {
  corporate: {
    titleA: "RECENT ",
    titleB: "CORPORATE WORK",
    blurb: "DJ Hersky live at Desert Oasis — Nature Nocturne, Canadian Museum of Nature.",
    alt: "DJ Hersky performing at a corporate event",
    photos: [
      { src: corpLive1, credit: "Tim Skinner © Canadian Museum of Nature" },
      { src: corpLive2, credit: "Tim Skinner © Canadian Museum of Nature" },
      { src: corpLive3, credit: "Tim Skinner © Canadian Museum of Nature" },
    ],
  },
  edm: {
    titleA: "LIVE ",
    titleB: "IN THE CLUB",
    blurb: "Real nights, real crowds — DJ Hersky doing what he does best.",
    alt: "DJ Hersky performing at a club event",
    photos: [{ src: edmLive }, { src: clubLive1 }, { src: parfordLive1 }],
  },
  private: {
    titleA: "REAL ",
    titleB: "PARTY ENERGY",
    blurb: "Birthdays, milestones, packed dance floors — this is what it looks like.",
    alt: "DJ Hersky performing at a private party",
    photos: [
      { src: privateLive, credit: "© LMF" },
      { src: clubLive3, credit: "© LMF" },
      { src: heroLive, credit: "© LMF" },
    ],
  },
  av: {
    titleA: "THE RIG ",
    titleB: "IN ACTION",
    blurb: "Pro decks, real lighting — the actual rig, live.",
    alt: "DJ Hersky's AV setup in action",
    photos: [
      { src: wmx1Live },
      { src: decksLive },
      { src: parfordLive2 },
    ],
  },
  weddings: {
    titleA: "REAL ",
    titleB: "WEDDINGS",
    blurb: "Ceremonies, receptions, and dance floors that stayed full — shot at DJ Hersky's own wedding gigs.",
    alt: "Real wedding gigs by DJ Hersky",
    photos: [
      { src: weddingCeremony },
      { src: weddingHall2025 },
      { src: weddingHall2024 },
      { src: weddingReception },
      { src: weddingToasts },
      { src: weddingDanceFloor },
    ],
  },
  weddingsVibes: {
    titleA: "WEDDING ",
    titleB: "VIBES",
    blurb: "The fun stuff — bouquet catches, photo booths, bridal parties, and packed dance floors.",
    alt: "Behind the scenes at DJ Hersky's wedding gigs",
    photos: [
      { src: weddingBouquet },
      { src: weddingBooth },
      { src: weddingBridalParty },
      { src: weddingSign },
      { src: weddingWine },
      { src: sbTentDance, credit: "Yash Patel Photography" },
      { src: sbDanceFloor, credit: "Yash Patel Photography" },
      { src: sbEntrance, credit: "Yash Patel Photography" },
    ],
  },
  karaoke: {
    titleA: "THE RIG ",
    titleB: "BEHIND KARAOKE",
    blurb: "Denon decks, pro sound, and pixel-bar stage lighting — the same real rig behind every karaoke night.",
    alt: "DJ Hersky's karaoke rig",
    photos: [
      { src: mcx8000Gear },
      { src: pixelBarGear },
      { src: movingHeadGear },
    ],
  },
};

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
        price: "$1,800",
        priceNum: 1800,
        description: "Perfect for intimate ceremonies",
        features: [
          "4 hours of DJ service",
          "Mackie + EV pro sound system",
          "Wireless microphone",
          "LED pixel bars, wireless DMX",
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
          "Mackie tops + EV 1200W sub",
          "2 wireless microphones",
          "Moving heads + pixel bars, wireless DMX",
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
          "Mackie tops + EV 1200W sub",
          "3 wireless microphones",
          "Movers, pixel bars + laser, wireless DMX",
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
          "Full EV sub stack + Mackie tops",
          "4 wireless microphones",
          "Full intelligent rig: movers, bars, laser + fog",
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
          "Mackie + EV pro sound system",
          "Background music curation",
          "LED pixel-bar lighting",
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
          "Mackie tops + EV 1200W sub",
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
          "EV 1200W subs + Mackie tops",
          "Custom branding integration",
          "Movers, pixel bars + laser, wireless DMX",
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
          "Full intelligent rig: movers, bars, laser + fog",
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
      price: "$1,200",
        priceNum: 1200,
        description: "School dances & events",
        features: [
          "3 hours of DJ service",
          "Age-appropriate music",
          "Sound system",
          "LED pixel-bar lighting",
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
          "Mackie tops + EV 1200W sub",
          "Dance-floor lighting: pixel bars + movers",
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
          "Mackie tops + EV sub stack",
          "Intelligent lighting: movers, bars, laser",
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
          "Full Mackie + EV sound system",
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
      price: "$1,500",
        priceNum: 1500,
        description: "Great for birthday parties",
        features: [
          "3 hours of DJ service",
          "Sound system",
          "LED pixel-bar lighting",
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
          "Mackie tops + EV 1200W sub",
          "LED pixel bars + moving heads",
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
          "EV 1200W subs + Mackie tops",
          "Intelligent lighting: movers, bars, laser",
          "Fog machine FX",
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
          "Mackie + EV club sound",
          "Pixel bars + laser, wireless DMX",
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
          "EV sub stack + Mackie tops",
          "Laser show",
          "LED pixel-bar walls",
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
          "Mackie tops + EV sub stack",
          "Laser FX show",
          "LED pixel-bar walls",
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
          "Full EV/Mackie concert sound",
          "Laser FX experience",
          "Full pixel-bar + mover light show",
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
          "Mackie pro sound",
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
          "Mackie tops + EV 1200W sub",
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
          "Mackie tops + EV sub stack",
          "Pixel-bar stage lighting",
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
          "Mackie + EV pro sound system",
          "Pixel bars, laser + fog FX",
          "Song request app",
          "Backup equipment",
        ],
      },
    ],
  },
  av: {
    title: "AV Production Packages",
    description: "Full audio-visual production with pro sound, intelligent lighting, and staging.",
    packages: [
      {
        name: "Basic AV",
        price: "$3,625",
        priceNum: 3625,
        description: "Essential AV setup",
        features: [
          "Mackie + EV pro sound system",
          "Mackie tops on tripod stands",
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
          "EV 1200W subs + Mackie tops",
          "Full-range stacks + EV subwoofers",
          "Multiple wireless mics",
          "LED uplighting",
          "Laser + fog FX",
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
          "Full EV/Mackie concert sound",
          "EV sub array + Mackie tops",
          "Multiple wireless systems",
          "Intelligent lighting rig: movers, bars, laser",
          "Wireless DMX across every fixture",
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
          "Full intelligent lighting production",
          "Full lighting design",
          "Custom staging",
          "Dual fog + laser FX show",
          "Dedicated lighting operator",
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
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const categoryData = category ? packageData[category] : null;

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl font-bold text-white tracking-tight mb-4">Category Not Found</h1>
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
          <div className="relative h-72 md:h-96 rounded-xl overflow-hidden mb-8">
            <img
              src={category ? categoryHeroImages[category] : weddingHero}
              alt={categoryData.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                {categoryData.title}
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{categoryData.description}</p>
            </div>
          </div>
        </div>

        {/* Real performance photos — per category (weddings gets a second personality row) */}
        {category &&
          realPhotoStrips[category] &&
          [realPhotoStrips[category], ...(category === "weddings" ? [realPhotoStrips.weddingsVibes] : [])].map(
            (strip, si) => (
              <div key={si} className="container mx-auto px-4 mb-16">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight mb-2 text-center">
                  {strip.titleA}{strip.titleB}
                </h2>
                <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">{strip.blurb}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
                  {strip.photos.map((photo, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden aspect-[4/3]">
                      <img src={photo.src} alt={strip.alt} className="w-full h-full object-cover image-zoom" />
                      {photo.credit && (
                        <span className="absolute bottom-2 right-2 text-[10px] text-white/80 bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                          {photo.credit}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

        {/* Packages Grid */}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {categoryData.packages.map((pkg) => {
              const isSelected = selectedName === pkg.name;
              const isLit = isSelected || pkg.featured;
              return (
                <Card
                  key={pkg.name}
                  variant={isLit ? "featured" : "glass"}
                  onClick={() => setSelectedName(pkg.name)}
                  className={`relative transition-all duration-300 cursor-pointer hover:border-primary/40 hover:-translate-y-1 ${
                    isSelected
                      ? "ring-2 ring-primary"
                      : ""
                  } ${pkg.featured && !isSelected ? "lg:-mt-4 lg:mb-4" : ""}`}
                >
                  {pkg.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current text-primary-foreground" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground">Most Popular</span>
                      </div>
                    </div>
                  )}
                  {isSelected && !pkg.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full">
                      <div className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-primary-foreground" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground">Selected</span>
                      </div>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                    <div className="mt-4">
                      <span className="font-display text-4xl font-bold text-white">{pkg.price}</span>
                      <span className="ml-2 text-xs text-muted-foreground align-middle">+ 13% HST</span>
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
                      variant={isLit ? "hero" : "outline"}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSelected) {
                          handleSelectPackage(pkg);
                        } else {
                          setSelectedName(pkg.name);
                        }
                      }}
                    >
                      {isSelected ? "Continue to Checkout" : "Select Package"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        {/* The real rig — every package runs on this gear */}
        <GearSection />

        {/* CTA Section */}
        <div className="container mx-auto px-4 mt-16">
          <Card className="max-w-2xl mx-auto bg-card border-white/10">
            <CardContent className="p-8 text-center">
              <h2 className="font-display text-2xl font-bold text-white tracking-tight mb-2">Need a Custom Package?</h2>
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
