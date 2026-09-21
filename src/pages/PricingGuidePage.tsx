import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Check, CheckCircle2, Send } from "lucide-react";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100, "Name is too long."),
  email: z.string().trim().email("Please enter a valid email.").max(255, "Email is too long."),
});

const included = [
  "Professional sound sized to your venue",
  "Dance-floor lighting",
  "Wireless microphones for speeches",
  "An MC who runs your timeline",
  "Pre-event planning meetings",
  "A backup equipment plan",
  "Liability insurance",
];

const questions = [
  "Are you insured, and do you bring backup equipment?",
  "How do you handle song requests and do-not-play lists?",
  "Will you MC, and how do you coordinate with my planner and photographer?",
  "Can I see video of you at a real wedding?",
  "What’s your plan if you’re sick on my date?",
  "How much setup time do you need, and is it included?",
  "What does your planning process look like?",
  "How do you read a crowd and keep energy up all night?",
  "What’s your overtime rate?",
  "What’s the deposit, balance due date, and cancellation policy?",
];

const ranges = [
  { title: "Budget / Hobbyist", price: "$800–$1,200", copy: "Basic gear, limited planning, and often no backup plan." },
  { title: "Professional", price: "$1,500–$2,500", copy: "Full production, planning support, insurance, and an experienced MC.", featured: true },
  { title: "Premium / Full Production", price: "$3,000–$5,000+", copy: "Concert-grade sound, intelligent lighting, photo booth, cold sparklers, and day-of coordination." },
];

const PricingGuidePage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Ottawa Wedding DJ Pricing Guide 2026 | Beatmaster DJ";
  }, []);

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const parsed = leadSchema.safeParse({ name: data.get("name"), email: data.get("email") });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your information.");
      return;
    }

    setSubmitting(true);
    try {
      // Save the lead to Supabase (never blocks the user-facing success state).
      try {
        const { error: leadError } = await supabase.from("leads").insert({
          name: parsed.data.name,
          email: parsed.data.email,
          service_interest: "pricing-guide",
          metadata: { source: "Ottawa Wedding DJ Pricing Guide 2026" },
        });
        if (leadError) console.error("Failed to save lead to Supabase:", leadError.message);
      } catch (leadException) {
        console.error("Failed to save lead to Supabase:", leadException);
      }

      const response = await fetch("https://formsubmit.co/ajax/hersky.ott@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Wedding DJ Pricing Guide request — ${parsed.data.name}`,
          _template: "table",
          _captcha: "false",
          _autoresponse: "Thanks for requesting the Ottawa Wedding DJ Pricing Guide. A professional package typically includes venue-sized sound, dance-floor lighting, wireless microphones, MC service, planning meetings, backup equipment, and liability insurance. Compare quotes carefully, and use the 10-question checklist on beatmasterdj.ca/pricing-guide before booking. — Jake / DJ Hersky",
          name: parsed.data.name,
          email: parsed.data.email,
          source: "Ottawa Wedding DJ Pricing Guide 2026",
        }),
      });
      if (!response.ok) throw new Error("Submission failed");
      form.reset();
      setSuccess(true);
    } catch {
      setError("The guide could not be sent. Please try again or email hersky.ott@gmail.com.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 md:pt-32 pb-20">
        <section className="container mx-auto px-4 pb-20 md:pb-28">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 font-display text-xs uppercase tracking-[0.2em] text-primary">Free 2026 pricing breakdown</p>
            <h1 className="font-display text-4xl font-extrabold md:text-6xl">Ottawa Wedding DJ Pricing Guide 2026</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">What you’ll actually pay — and what to ask before you book.</p>
          </div>

          <Card variant="neon" className="mx-auto mt-10 max-w-2xl">
            <CardContent className="p-6 md:p-8">
              {success ? (
                <div className="flex flex-col items-center py-5 text-center" role="status">
                  <CheckCircle2 className="mb-4 h-12 w-12 text-primary" />
                  <h2 className="font-display text-2xl font-bold">Check your inbox — the pricing summary is on its way.</h2>
                  <p className="mt-3 text-muted-foreground">Ready for the next step?</p>
                  <Button variant="hero" size="lg" asChild className="mt-4">
                    <Link to="/book">Check Your Date</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={submitLead} noValidate className="space-y-4">
                  <div>
                    <label htmlFor="guide-name" className="mb-2 block text-sm font-medium">Name</label>
                    <Input id="guide-name" name="name" autoComplete="name" maxLength={100} placeholder="Your name" required />
                  </div>
                  <div>
                    <label htmlFor="guide-email" className="mb-2 block text-sm font-medium">Email</label>
                    <Input id="guide-email" name="email" type="email" autoComplete="email" maxLength={255} placeholder="you@example.com" required />
                  </div>
                  {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                    <Send className="h-4 w-4" /> {submitting ? "Sending…" : "Email me the pricing breakdown"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="border-y border-border bg-card/30 py-20 md:py-28">
          <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-2 lg:gap-20">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">What a real DJ package includes</h2>
              <div className="mt-8 space-y-4">
                {included.map((item) => <div key={item} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span>{item}</span></div>)}
              </div>
              <p className="mt-8 border-l-2 border-primary pl-4 text-muted-foreground">If any of those are missing, you’re not comparing the same product.</p>
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">10 questions to ask before booking</h2>
              <ol className="mt-8 space-y-4">
                {questions.map((question, index) => <li key={question} className="flex gap-4"><span className="font-display text-primary">{String(index + 1).padStart(2, "0")}</span><span>{question}</span></li>)}
              </ol>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 md:py-28">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">Realistic Ottawa price ranges</h2>
          <div className="mx-auto mt-10 grid max-w-6xl gap-5 md:grid-cols-3">
            {ranges.map((range) => (
              <Card key={range.title} variant={range.featured ? "neon" : "glass"} className="relative">
                {range.featured && <span className="absolute right-3 top-3 rounded-sm border border-primary/40 bg-primary/10 px-2 py-1 text-xs text-primary">Where most great weddings land</span>}
                <CardHeader className={range.featured ? "pt-14" : undefined}><CardTitle>{range.title}</CardTitle></CardHeader>
                <CardContent><p className="font-display text-3xl font-bold text-primary">{range.price}</p><p className="mt-4 text-muted-foreground">{range.copy}</p></CardContent>
              </Card>
            ))}
          </div>
          <div className="mx-auto mt-8 flex max-w-4xl gap-4 rounded-md border border-destructive/40 bg-destructive/10 p-5">
            <AlertTriangle className="h-6 w-6 shrink-0 text-destructive" />
            <p>Anyone far below these ranges is cutting corners on gear, insurance, or experience — the three things that matter when 120 guests are on the dance floor.</p>
          </div>
        </section>

        <section className="border-t border-border py-20 text-center md:py-28">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold md:text-5xl">Want straight answers to all ten?</h2>
            <p className="mt-4 text-lg text-muted-foreground">Check your date and grab a free 15-minute consult.</p>
            <Button variant="hero" size="lg" asChild className="mt-8"><Link to="/book">Check your date</Link></Button>
            <p className="mt-6 text-sm text-muted-foreground">500+ events · 15+ years · 97% satisfaction</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PricingGuidePage;