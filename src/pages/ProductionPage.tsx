import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { Check, Star, Sparkles, Zap, Building2, Mountain, ShieldCheck } from "lucide-react";

type Tier = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  features: string[];
  featured?: boolean;
  icon: React.ElementType;
};

const tiers: Tier[] = [
  {
    id: "club",
    name: "Club Full Production",
    tagline: "For clubs and NYE-style nights",
    price: "$1,000",
    priceNote: "flat",
    features: [
      "6-hour DJ set",
      "FULL production — pro sound",
      "Lighting rig",
      "Glowsticks for the crowd",
    ],
    icon: Zap,
  },
  {
    id: "corporate",
    name: "Corporate Hero",
    tagline: "The complete corporate party rig",
    price: "$2,800",
    priceNote: "+ HST",
    features: [
      "6 hours of DJ service",
      "Truss + dancefloor rig",
      "4 moving heads",
      "Subwoofer",
      "Glowsticks",
      "Uplights + mic included",
    ],
    featured: true,
    icon: Building2,
  },
  {
    id: "turnkey",
    name: "Turnkey Event Production",
    tagline: "Ski-resort / winter-festival scale",
    price: "from $7,000",
    priceNote: "",
    features: [
      "The whole event produced end to end",
      "Stage",
      "LED wall + Resolume visuals",
      "Lighting team",
      "MC",
      "Planning",
    ],
    icon: Mountain,
  },
];

const TierCard = ({ t }: { t: Tier }) => {
  const ref = useRevealOnScroll<HTMLDivElement>();
  const Icon = t.icon;
  return (
    <div ref={ref} className="bass-drop-init h-full">
      <Card variant={t.featured ? "featured" : "glass"} className="h-full flex flex-col relative">
        {t.featured && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current text-primary-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground">Most Popular</span>
            </div>
          </div>
        )}
        <CardHeader>
          <div className="w-11 h-11 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center mb-2">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-xl">{t.name}</CardTitle>
          <CardDescription>{t.tagline}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 gap-5">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl md:text-5xl font-bold gradient-text">{t.price}</span>
              {t.priceNote && <span className="text-muted-foreground text-sm">{t.priceNote}</span>}
            </div>
            <p className="text-xs text-primary/90 mt-1">50% deposit secures your date</p>
          </div>
          <ul className="space-y-3 text-sm flex-1">
            {t.features.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant={t.featured ? "hero" : "outline"} className="w-full" asChild>
            <Link to="/book">Book This Production</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const ProductionPage = () => {
  useEffect(() => {
    document.title = "Full Event Production — DJ, Stage, Sound, Lighting & Visuals | Beatmaster DJ";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 md:pt-32 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 mb-12 md:mb-20 text-center">
          <Badge className="mb-4 bg-primary/15 border-primary/30 text-primary">
            <Sparkles className="w-3 h-3 mr-1" /> Full Event Production
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 gradient-text">
            One Contract. The Whole Show.
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-8">
            DJ, stage, sound, lighting and visuals — produced by one team, under one agreement.
            No juggling vendors, no gaps between the booth and the rig.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/book">Book Now</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact">Get a Quote</Link>
            </Button>
          </div>
        </section>

        {/* Tiers */}
        <section className="container mx-auto px-4 mb-16 md:mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {tiers.map((t) => (
              <TierCard key={t.id} t={t} />
            ))}
          </div>
        </section>

        {/* Visuals & Lighting only */}
        <section className="container mx-auto px-4 mb-16 md:mb-24">
          <Card variant="glass" className="max-w-3xl mx-auto">
            <CardContent className="p-6 md:p-10 text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 gradient-text">
                Visuals &amp; Lighting — Without the DJ Set
              </h2>
              <p className="text-muted-foreground mb-6">
                Hire Jake to program and run lasers, lighting (GrandMA / ETC DMX) and Resolume
                visuals for venues, promoters and other productions — backed by a decade on
                Audioform and FMG crews.
              </p>
              <p className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
                $950–$1,800 per day depending on scale
              </p>
              <p className="text-xs text-primary/90 mb-6">50% deposit secures your date</p>
              <p className="flex items-start justify-center gap-2 text-xs text-muted-foreground mb-8">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Outdoor laser shows are coordinated with Transport Canada / NAV CANADA,
                  terminated beams only, fully insured.
                </span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" asChild>
                  <Link to="/contact">Book Visuals &amp; Lighting</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/book">See All Packages</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto bg-card border-white/10">
            <CardContent className="p-8 text-center">
              <h2 className="font-display text-2xl font-bold text-white tracking-tight mb-2">
                Planning Something Bigger?
              </h2>
              <p className="text-muted-foreground mb-6">
                Tell us about your venue, crowd and date — we'll scope the full production.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" asChild>
                  <Link to="/book">Book Now</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductionPage;
