import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const packages = [
  { name: "Starter Site", price: "$1,800", timeline: "About 2 weeks", items: ["5-page custom website", "Mobile-ready design", "Contact form", "Google Maps", "Basic search setup"] },
  { name: "Business Site", price: "$3,800", timeline: "About 4 weeks", featured: true, items: ["Everything in Starter", "Up to 12 pages", "Booking or quote requests", "Blog, testimonials, and gallery", "Advanced search setup and analytics", "Copywriting polish"] },
  { name: "Premium / Custom", price: "From $7,500", timeline: "About 6–8 weeks", items: ["Everything in Business", "Unlimited pages", "Online store or custom connections", "AI chat assistant", "Custom design system and brand refresh", "90 days of priority support"] },
];

const extras = [
  { name: "Care Plan", price: "$99/mo", copy: "Hosting, updates, backups, and small changes." },
  { name: "SEO Growth", price: "$350/mo", copy: "Ongoing optimization, content, and local rankings." },
  { name: "AI Chat Add-on", price: "$750 + $29/mo", copy: "24/7 lead capture trained around your business." },
  { name: "Priority Support", price: "$199/mo", copy: "Same-day changes and strategy calls." },
];

const steps = [
  { number: "01", title: "Call", copy: "In 20 minutes, I learn your business and what a win looks like." },
  { number: "02", title: "Mockup", copy: "Within one week, you see the direction before I build." },
  { number: "03", title: "Build & launch", copy: "Revisions are included, then we go live." },
  { number: "04", title: "Growth", copy: "Optional care, search, and AI tools keep working after launch." },
];

const WebDesignPage = () => {
  useEffect(() => {
    document.title = "Ottawa Small Business Web Design | Hersky DJ & AV";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 md:pt-32 pb-20">
        <section className="container mx-auto px-4 pb-20 text-center md:pb-28">
          <p className="mb-4 font-display text-xs uppercase tracking-[0.2em] text-primary">Ottawa small business websites</p>
          <h1 className="mx-auto max-w-5xl font-display text-4xl font-extrabold md:text-6xl">I build websites that bring you customers — not just look pretty.</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">Custom sites for Ottawa small businesses. Fast, sharp, designed to turn visitors into paying customers.</p>
          <Button variant="hero" size="lg" asChild className="mt-8"><a href="tel:+16138374488"><Phone className="h-4 w-4" /> Free 20-minute consult</a></Button>
        </section>

        <section className="border-y border-border bg-card/30 py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid gap-5 lg:grid-cols-3">
              {packages.map((item) => (
                <Card key={item.name} variant={item.featured ? "neon" : "glass"} className="relative">
                  {item.featured && <span className="absolute right-3 top-3 rounded-sm border border-primary/40 bg-primary/10 px-2 py-1 text-xs text-primary">Most popular</span>}
                  <CardHeader className={item.featured ? "pt-14" : undefined}><CardTitle className="text-2xl">{item.name}</CardTitle><p className="font-display text-3xl font-bold text-primary">{item.price}</p></CardHeader>
                  <CardContent>
                    <div className="space-y-3">{item.items.map((feature) => <div key={feature} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{feature}</span></div>)}</div>
                    <p className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">Launch: {item.timeline}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 md:py-28">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Keep it growing</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {extras.map((extra) => <Card key={extra.name} variant="glass"><CardContent className="p-5"><h3 className="font-display text-xl font-bold">{extra.name}</h3><p className="mt-2 font-semibold text-primary">{extra.price}</p><p className="mt-3 text-sm text-muted-foreground">{extra.copy}</p></CardContent></Card>)}
          </div>
        </section>

        <section className="border-y border-border py-20 md:py-28">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold md:text-4xl">How it works</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => <div key={step.number} className="border-l border-primary/50 pl-5"><span className="font-display text-sm text-primary">{step.number}</span><h3 className="mt-3 font-display text-2xl font-bold">{step.title}</h3><p className="mt-3 text-muted-foreground">{step.copy}</p></div>)}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 text-center md:py-28">
          <p className="mx-auto max-w-4xl font-display text-2xl font-bold md:text-4xl">My own DJ sites are my #1 source of bookings — I build the same kind of sites for local businesses.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="hero" size="lg" asChild><Link to="/contact">Free 20-minute consult <ArrowRight className="h-4 w-4" /></Link></Button>
            <a href="tel:+16138374488" className="text-lg font-semibold text-primary">(613) 837-4488</a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WebDesignPage;