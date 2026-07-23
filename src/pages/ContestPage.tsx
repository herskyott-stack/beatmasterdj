import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Sparkles, AlertTriangle, Check } from "lucide-react";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CONTEST, isContestActive } from "@/lib/contest";
import { CONTEST_PACKAGES, getPackageById } from "@/lib/contestPackages";
import ContestCountdown from "@/components/contest/ContestCountdown";

const schema = z.object({
  full_name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  packageId: z.string().min(1, "Please choose the package you're most interested in"),
  agree: z.literal(true, { errorMap: () => ({ message: "You must agree to the rules" }) }),
});

const ContestPage = () => {
  const active = isContestActive();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    packageId: "",
    agree: false,
    website: "", // honeypot
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const groups = CONTEST_PACKAGES.reduce<Record<string, typeof CONTEST_PACKAGES>>((acc, p) => {
    (acc[p.categoryLabel] ??= []).push(p);
    return acc;
  }, {});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    const pkg = getPackageById(parsed.data.packageId);
    if (!pkg) {
      toast.error("Invalid package selection");
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("submit-contest-entry", {
      body: {
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        contest_id: CONTEST.id,
        source_page: "contest_page",
        interested_package_category: pkg.categoryLabel,
        interested_package_name: pkg.name,
        interested_package_price: pkg.price,
        website: form.website,
      },
    });

    if (error || (data && (data as any).error)) {
      const msg = (data as any)?.error || "Could not submit entry. Please try again.";
      toast.error(msg);
      setSubmitting(false);
      return;
    }

    // Fire-and-forget confirmation email
    supabase.functions
      .invoke("send-contest-email", {
        body: {
          type: "confirmation",
          email: parsed.data.email,
          name: parsed.data.full_name,
          category: pkg.categoryLabel,
          packageName: pkg.name,
          packagePrice: pkg.price,
        },
      })
      .catch((err) => console.error("contest email failed", err));

    setDone(true);
    setSubmitting(false);
  };

  if (!active) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-3xl font-bold mb-3">Contest has ended</h1>
            <p className="text-muted-foreground mb-6">
              Thanks for your interest — this promotion is no longer accepting entries.
            </p>
            <Button asChild variant="hero">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs uppercase tracking-wider text-primary font-display mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Limited-Time Contest
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
              <span className="gradient-text">Enter the Contest — Good Luck!</span>
            </h1>
            <p className="text-muted-foreground mb-4">
              Fill out the form to enter our {CONTEST.name}. Winners will be contacted directly by email.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-xs font-medium text-secondary mb-4">
              DJs only — this contest is for DJ service packages only
            </div>
            <div className="flex justify-center">
              <ContestCountdown />
            </div>
          </div>

          <Card variant="glass">
            <CardContent className="pt-6">
              {done ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
                  <h2 className="font-display text-2xl font-bold mb-2">Your entry has been received!</h2>
                  <p className="text-muted-foreground mb-6">
                    Good luck — we'll be in touch soon.
                  </p>
                  <Button asChild variant="hero">
                    <Link to="/">Back to Home</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot: hidden from real users, catches bots */}
                  <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
                    <label>
                      Website
                      <input
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                      />
                    </label>
                  </div>

                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      maxLength={120}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      maxLength={255}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      maxLength={40}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      Which package interests you most? *
                    </Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Pick the package you'd actually book — we'll tailor your win / follow-up around it.
                    </p>
                    <div className="space-y-4">
                      {Object.entries(groups).map(([label, pkgs]) => (
                        <div key={label}>
                          <p className="text-xs font-display uppercase tracking-wider text-primary mb-2">
                            {label}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {pkgs.map((p) => {
                              const selected = form.packageId === p.id;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => setForm({ ...form, packageId: p.id })}
                                  className={`text-left rounded-lg border p-3 transition-all ${
                                    selected
                                      ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(38,85%,55%,0.25)]"
                                      : "border-border bg-card/40 hover:border-primary/40"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-semibold text-sm">{p.name}</p>
                                      <p className="text-xs text-muted-foreground">{p.blurb}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="text-sm font-display text-primary">
                                        ${p.price.toLocaleString()}
                                      </span>
                                      {selected && <Check className="w-4 h-4 text-primary" />}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <Checkbox
                      checked={form.agree}
                      onCheckedChange={(v) => setForm({ ...form, agree: v === true })}
                    />
                    <span className="text-muted-foreground">
                      I agree to the{" "}
                      <Link to="/contest-rules" target="_blank" className="text-primary underline">
                        contest rules and privacy policy
                      </Link>
                      .
                    </span>
                  </label>
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Enter & Good Luck!"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContestPage;
