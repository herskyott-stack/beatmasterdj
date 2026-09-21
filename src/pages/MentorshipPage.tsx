import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import {
  Headphones,
  Users,
  Mic2,
  Briefcase,
  Sparkles,
  Check,
  GraduationCap,
  Trophy,
  Rocket,
} from "lucide-react";

type Pathway = {
  id: string;
  name: string;
  tagline: string;
  duration: string;
  price: number;
  goal: string;
  focus: string;
  outcome: string;
  featured?: boolean;
  highlight?: string;
  icon: React.ElementType;
};

const tracks: { haveGear: Pathway[]; needGear: Pathway[] } = {
  haveGear: [
    {
      id: "have-hobbyist",
      name: "Hobbyist Foundation",
      tagline: "Master the gear & technical basics",
      duration: "3 Months",
      price: 400,
      goal: "Master the Gear & Technical Basics",
      focus: "Song structure, phrasing, and smooth transitions",
      outcome: "Record a clean 30-minute mix for family and friends",
      icon: GraduationCap,
    },
    {
      id: "have-performer",
      name: "Performer Program",
      tagline: "Club-ready skills & self-promotion",
      duration: "6 Months",
      price: 375,
      goal: "Club-Ready Skills & Self-Promotion",
      focus: "Loops, samples, creative FX, and building a Digital Press Kit",
      outcome: "A signature style and a digital presence on SoundCloud / YouTube",
      featured: true,
      highlight: "Multi-month commitment discount included",
      icon: Trophy,
    },
    {
      id: "have-pro",
      name: "Pro Entrepreneur Mentorship",
      tagline: "Professional launch & business ownership",
      duration: "1 Year",
      price: 350,
      goal: "Professional Launch & Business Ownership",
      focus: "Full technical mastery, gig marketing, contracts, and invoicing",
      outcome: "Graduate as a business owner ready for weddings and corporate events",
      highlight: "Our most comprehensive long-term rate",
      icon: Rocket,
    },
  ],
  needGear: [
    {
      id: "need-hobbyist",
      name: "Hobbyist Foundation",
      tagline: "In-studio gear, zero hardware costs",
      duration: "3 Months",
      price: 525,
      goal: "Learn on industry-standard equipment",
      focus: "Use of our professional studio Mackie & Pioneer setup during lessons",
      outcome: "Master the fundamentals with zero upfront hardware costs",
      icon: GraduationCap,
    },
    {
      id: "need-performer",
      name: "Performer Program",
      tagline: "Studio gear + take-home rental controller",
      duration: "6 Months",
      price: 495,
      goal: "Daily practice without buying a deck",
      focus: "Studio sessions plus a rental controller you take home",
      outcome: "Consistent daily practice and stage-ready confidence",
      featured: true,
      highlight: "Multi-month commitment discount included",
      icon: Trophy,
    },
    {
      id: "need-pro",
      name: "Pro Entrepreneur — Deck Included",
      tagline: "Pro controller is yours to keep",
      duration: "1 Year",
      price: 485,
      goal: "Total technical and business mentorship",
      focus: "Full Pro track curriculum with a professional DJ controller provided",
      outcome: "Graduate with your own professional startup kit",
      highlight: "Pro DJ controller included — yours to keep upon completion",
      icon: Rocket,
    },
  ],
};

const PATHWAY_OPTIONS = [
  ...tracks.haveGear.map((p) => ({ value: p.id, label: `Have Gear — ${p.name} ($${p.price}/mo)` })),
  ...tracks.needGear.map((p) => ({ value: p.id, label: `Need Gear — ${p.name} ($${p.price}/mo)` })),
];

const GENRES = ["House", "Hip-Hop", "EDM", "Top 40", "Latin", "Other"];

const applySchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(60),
  lastName: z.string().trim().min(1, "Required").max(60),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(7, "Phone required").max(30),
  age: z.coerce.number().int().min(8, "Min age 8").max(99),
  guardianName: z.string().trim().max(120).optional(),
  guardianEmail: z.string().trim().max(255).optional(),
  skillLevel: z.string().min(1, "Please select"),
  gearStatus: z.string().min(1, "Please select"),
  pathway: z.string().min(1, "Please select"),
  genres: z.array(z.string()).min(1, "Pick at least one"),
  goals: z.string().trim().max(500).optional(),
  startMonth: z.string().trim().max(40).optional(),
});

const PathwayCard = ({
  p,
  onApply,
  trackLabel,
}: {
  p: Pathway;
  onApply: (id: string, gearStatus: string) => void;
  trackLabel: string;
}) => {
  const ref = useRevealOnScroll<HTMLDivElement>();
  const Icon = p.icon;
  return (
    <div ref={ref} className="bass-drop-init h-full">
      <Card
        variant={p.featured ? "featured" : "glass"}
        className="h-full flex flex-col relative overflow-hidden"
      >
        {p.featured && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-gradient-to-r from-primary to-secondary text-background border-0">
              Most Popular
            </Badge>
          </div>
        )}
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <Badge variant="outline" className="border-white/20 text-xs">
              {p.duration}
            </Badge>
          </div>
          <CardTitle className="text-xl">{p.name}</CardTitle>
          <CardDescription>{p.tagline}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 gap-5">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl md:text-5xl font-bold gradient-text">
                ${p.price}
              </span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            {p.highlight && (
              <p className="text-xs text-primary/90 mt-1">{p.highlight}</p>
            )}
          </div>

          <ul className="space-y-3 text-sm flex-1">
            <li className="flex gap-2">
              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span><span className="text-muted-foreground">Goal:</span> {p.goal}</span>
            </li>
            <li className="flex gap-2">
              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span><span className="text-muted-foreground">Focus:</span> {p.focus}</span>
            </li>
            <li className="flex gap-2">
              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span><span className="text-muted-foreground">Outcome:</span> {p.outcome}</span>
            </li>
          </ul>

          <Button
            variant={p.featured ? "hero" : "outline"}
            className="w-full mt-auto"
            onClick={() => onApply(p.id, trackLabel)}
          >
            Apply for this Pathway
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const MentorshipPage = () => {
  const [hasGear, setHasGear] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [pathway, setPathway] = useState("");
  const [gearStatus, setGearStatus] = useState("I own a controller");
  const [skillLevel, setSkillLevel] = useState("");
  const [age, setAge] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const applyRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentTrack = hasGear ? tracks.haveGear : tracks.needGear;

  useEffect(() => {
    setGearStatus(hasGear ? "I own a controller" : "I need gear provided");
  }, [hasGear]);

  const scrollToApply = (pathwayId: string, gear: string) => {
    setPathway(pathwayId);
    setGearStatus(gear === "I have my own gear" ? "I own a controller" : "I need gear provided");
    setTimeout(() => {
      applyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const raw = {
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      age: fd.get("age"),
      guardianName: fd.get("guardianName") || undefined,
      guardianEmail: fd.get("guardianEmail") || undefined,
      skillLevel,
      gearStatus,
      pathway,
      genres: selectedGenres,
      goals: fd.get("goals") || "",
      startMonth: fd.get("startMonth") || "",
    };
    const parsed = applySchema.safeParse(raw);
    if (!parsed.success) {
      const errMap: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errMap[i.path[0] as string] = i.message;
      });
      setErrors(errMap);
      toast({
        title: "Please fix the form",
        description: "Some fields need attention.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        _subject: `🎧 DJ Mentorship Application — ${parsed.data.firstName} ${parsed.data.lastName}`,
        _template: "table",
        _captcha: "false",
        ...parsed.data,
        genres: parsed.data.genres.join(", "),
        pathway: PATHWAY_OPTIONS.find((p) => p.value === parsed.data.pathway)?.label ?? parsed.data.pathway,
      };
      const res = await fetch("https://formsubmit.co/ajax/hersky.ott@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Submission failed");
      toast({
        title: "Application sent! 🎉",
        description: "We'll be in touch within 1–2 business days.",
      });
      formRef.current?.reset();
      setSelectedGenres([]);
      setPathway("");
      setSkillLevel("");
      setAge("");
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "Please try again or email hersky.ott@gmail.com directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isMinor = age !== "" && Number(age) < 18;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 md:pt-32 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 mb-12 md:mb-20 text-center">
          <Badge className="mb-4 bg-primary/15 border-primary/30 text-primary">
            <Sparkles className="w-3 h-3 mr-1" /> New Mentorship Program
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 gradient-text">
            DJ Mentorship Programs
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-8">
            Turn your passion into a craft — and your craft into a career. Weekly 1-on-1
            sessions with a working professional DJ, built around your goals, your gear,
            and your timeline.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="lg" asChild>
              <a href="#pathways">View Pathways</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#apply">Apply Now</a>
            </Button>
          </div>
        </section>

        {/* Track Toggle */}
        <section id="pathways" className="container mx-auto px-4 mb-10">
          <div className="max-w-md mx-auto">
            <div className="relative bg-card/60 backdrop-blur-xl border border-white/10 rounded-full p-1 grid grid-cols-2">
              <div
                className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-gradient-to-r from-primary to-secondary transition-transform duration-300 ${
                  hasGear ? "translate-x-0" : "translate-x-full"
                }`}
              />
              <button
                onClick={() => setHasGear(true)}
                className={`relative z-10 py-3 px-2 text-xs sm:text-sm font-display uppercase tracking-wider transition-colors ${
                  hasGear ? "text-background" : "text-muted-foreground"
                }`}
              >
                I Have My Gear
              </button>
              <button
                onClick={() => setHasGear(false)}
                className={`relative z-10 py-3 px-2 text-xs sm:text-sm font-display uppercase tracking-wider transition-colors ${
                  !hasGear ? "text-background" : "text-muted-foreground"
                }`}
              >
                I Need Gear
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              {hasGear
                ? "For students with their own controller and headphones"
                : "Studio gear provided — Pro plan includes a deck to keep"}
            </p>
          </div>
        </section>

        {/* Pathways */}
        <section className="container mx-auto px-4 mb-16 md:mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentTrack.map((p) => (
              <PathwayCard
                key={p.id}
                p={p}
                trackLabel={hasGear ? "I have my own gear" : "I need gear"}
                onApply={scrollToApply}
              />
            ))}
          </div>
        </section>

        {/* Trust strip */}
        <section className="container mx-auto px-4 mb-16 md:mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Headphones, label: "Industry-Standard Gear" },
              { icon: Users, label: "1-on-1 Weekly Sessions" },
              { icon: Mic2, label: "Real Gig Preparation" },
              { icon: Briefcase, label: "Business & Marketing Coaching" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center"
              >
                <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs md:text-sm font-display uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Apply Form */}
        <section id="apply" ref={applyRef} className="container mx-auto px-4 mb-16 md:mb-24">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 gradient-text">
                Apply Now
              </h2>
              <p className="text-muted-foreground">
                Tell us a bit about yourself — we'll respond within 1–2 business days.
              </p>
            </div>
            <Card variant="glass">
              <CardContent className="p-4 sm:p-6">
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" name="firstName" required maxLength={60} />
                      {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" name="lastName" required maxLength={60} />
                      {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" required maxLength={255} />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" name="phone" type="tel" required maxLength={30} />
                      {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min={8}
                      max={99}
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="max-w-[140px]"
                    />
                    {errors.age && <p className="text-xs text-destructive mt-1">{errors.age}</p>}
                  </div>

                  {isMinor && (
                    <div className="border border-primary/30 bg-primary/5 rounded-lg p-4 space-y-3">
                      <p className="text-sm text-primary font-medium">
                        Under 18 — please add a parent / guardian:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="guardianName">Guardian Name</Label>
                          <Input id="guardianName" name="guardianName" maxLength={120} />
                        </div>
                        <div>
                          <Label htmlFor="guardianEmail">Guardian Email</Label>
                          <Input id="guardianEmail" name="guardianEmail" type="email" maxLength={255} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="mb-2 block">Current Skill Level *</Label>
                    <RadioGroup value={skillLevel} onValueChange={setSkillLevel} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {["Complete Beginner", "Some Experience", "Intermediate", "Advanced"].map((s) => (
                        <label
                          key={s}
                          className="flex items-center gap-2 p-3 rounded-lg border border-white/10 bg-background/40 cursor-pointer hover:border-primary/40"
                        >
                          <RadioGroupItem value={s} />
                          <span className="text-sm">{s}</span>
                        </label>
                      ))}
                    </RadioGroup>
                    {errors.skillLevel && <p className="text-xs text-destructive mt-1">{errors.skillLevel}</p>}
                  </div>

                  <div>
                    <Label className="mb-2 block">Gear Status *</Label>
                    <RadioGroup value={gearStatus} onValueChange={setGearStatus} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {["I own a controller", "I need gear provided"].map((s) => (
                        <label
                          key={s}
                          className="flex items-center gap-2 p-3 rounded-lg border border-white/10 bg-background/40 cursor-pointer hover:border-primary/40"
                        >
                          <RadioGroupItem value={s} />
                          <span className="text-sm">{s}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="pathway">Pathway *</Label>
                    <Select value={pathway} onValueChange={setPathway}>
                      <SelectTrigger id="pathway">
                        <SelectValue placeholder="Choose a pathway" />
                      </SelectTrigger>
                      <SelectContent>
                        {PATHWAY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.pathway && <p className="text-xs text-destructive mt-1">{errors.pathway}</p>}
                  </div>

                  <div>
                    <Label className="mb-2 block">Music Genres of Interest *</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {GENRES.map((g) => (
                        <label
                          key={g}
                          className="flex items-center gap-2 p-2.5 rounded-lg border border-white/10 bg-background/40 cursor-pointer hover:border-primary/40"
                        >
                          <Checkbox
                            checked={selectedGenres.includes(g)}
                            onCheckedChange={() => toggleGenre(g)}
                          />
                          <span className="text-sm">{g}</span>
                        </label>
                      ))}
                    </div>
                    {errors.genres && <p className="text-xs text-destructive mt-1">{errors.genres}</p>}
                  </div>

                  <div>
                    <Label htmlFor="startMonth">Preferred Start Month</Label>
                    <Input id="startMonth" name="startMonth" placeholder="e.g. March 2026" maxLength={40} />
                  </div>

                  <div>
                    <Label htmlFor="goals">Your Goals (optional, max 500 chars)</Label>
                    <Textarea id="goals" name="goals" maxLength={500} rows={4} placeholder="What do you want to achieve?" />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? "Sending..." : "Submit Application"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-center gradient-text">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="q1" className="border border-white/10 rounded-lg px-4 bg-card/40">
                <AccordionTrigger>Do I need gear to start?</AccordionTrigger>
                <AccordionContent>
                  No — pick the "I Need Gear" track. Studio equipment is provided for every
                  lesson, and our Pro plan includes a professional DJ controller you keep.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2" className="border border-white/10 rounded-lg px-4 bg-card/40">
                <AccordionTrigger>Where are lessons held?</AccordionTrigger>
                <AccordionContent>
                  In our Ottawa studio outfitted with Pioneer DJ and Mackie monitoring. Remote
                  options can be discussed on a case-by-case basis.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3" className="border border-white/10 rounded-lg px-4 bg-card/40">
                <AccordionTrigger>In-person or online?</AccordionTrigger>
                <AccordionContent>
                  Primarily in-person for the best hands-on learning. Hybrid scheduling is
                  available once you've completed your foundation block.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q4" className="border border-white/10 rounded-lg px-4 bg-card/40">
                <AccordionTrigger>Refund policy?</AccordionTrigger>
                <AccordionContent>
                  Month-to-month tuition is non-refundable once the month begins, but you can
                  pause or cancel before the next billing cycle with 14 days' notice.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q5" className="border border-white/10 rounded-lg px-4 bg-card/40">
                <AccordionTrigger>Do you teach kids?</AccordionTrigger>
                <AccordionContent>
                  Yes — we welcome students 8 and up. A parent or guardian must be on the
                  application for anyone under 18.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MentorshipPage;
