import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, CheckCircle2, Phone, Send } from "lucide-react";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

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

const quoteSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100, "Name is too long."),
  email: z.string().trim().email("Please enter a valid email.").max(255, "Email is too long."),
  phone: z.string().trim().max(30, "Phone number is too long.").optional(),
  businessName: z.string().trim().max(150, "Business name is too long.").optional(),
  details: z.string().trim().max(2000, "Please keep it under 2000 characters.").optional(),
});

const QuoteRequestForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submitQuote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const parsed = quoteSchema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone") || undefined,
      businessName: data.get("business_name") || undefined,
      details: data.get("details") || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your information.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: leadError } = await supabase.from("leads").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone ?? null,
        business_name: parsed.data.businessName ?? null,
        message: parsed.data.details ?? null,
        service_interest: "web-design",
        metadata: { source: "Web design quote request form" },
      });
      if (leadError) throw new Error("Could not save your request.");

      const response = await fetch("https://formsubmit.co/ajax/hersky.ott@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Web design quote request — ${parsed.data.name}`,
          _template: "table",
          _captcha: "false",
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone ?? "",
          business_name: parsed.data.businessName ?? "",
          project_details: parsed.data.details ?? "",
          source: "Web design quote request form",
        }),
      });
      if (!response.ok) throw new Error("Submission failed");

      form.reset();
      setSuccess(true);
    } catch {
      setError("Your request could not be sent. Please try again or email hersky.ott@gmail.com.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center py-8 text-center" role="status">
        <CheckCircle2 className="mb-4 h-12 w-12 text-primary" />
        <h3 className="font-display text-2xl font-bold">Thanks — I&apos;ll reply within 24 hours.</h3>
        <p className="mt-3 text-muted-foreground">Your quote request is in. I&apos;ll take a look at your project and get back to you with next steps.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submitQuote} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="quote-name" className="mb-2 block text-sm font-medium">Name</label>
          <Input id="quote-name" name="name" autoComplete="name" maxLength={100} placeholder="Your name" required />
        </div>
        <div>
          <label htmlFor="quote-email" className="mb-2 block text-sm font-medium">Email</label>
          <Input id="quote-email" name="email" type="email" autoComplete="email" maxLength={255} placeholder="you@example.com" required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="quote-phone" className="mb-2 block text-sm font-medium">Phone <span className="font-normal text-muted-foreground">(optional)</span></label>
          <Input id="quote-phone" name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="(613) 555-0123" />
        </div>
        <div>
          <label htmlFor="quote-business" className="mb-2 block text-sm font-medium">Business name <span className="font-normal text-muted-foreground">(optional)</span></label>
          <Input id="quote-business" name="business_name" autoComplete="organization" maxLength={150} placeholder="Your business" />
        </div>
      </div>
      <div>
        <label htmlFor="quote-details" className="mb-2 block text-sm font-medium">Project details</label>
        <Textarea id="quote-details" name="details" rows={5} maxLength={2000} placeholder="Tell me about your business and what you need — pages, booking, online store, timeline…" />
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto" disabled={submitting}>
        <Send className="h-4 w-4" /> {submitting ? "Sending…" : "Request a free quote"}
      </Button>
    </form>
  );
};

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

        <section className="border-b border-border bg-card/30 py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-4 font-display text-xs uppercase tracking-[0.2em] text-primary">Free quote</p>
              <h2 className="font-display text-3xl font-bold md:text-4xl">Request a free quote</h2>
              <p className="mt-4 text-lg text-muted-foreground">Tell me about your project and I&apos;ll reply within 24 hours with next steps and honest pricing.</p>
            </div>
            <Card variant="neon" className="mx-auto mt-10 max-w-2xl">
              <CardContent className="p-6 md:p-8">
                <QuoteRequestForm />
              </CardContent>
            </Card>
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