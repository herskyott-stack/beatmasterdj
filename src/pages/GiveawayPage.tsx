import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Sparkles, AlertTriangle, Check, Instagram, ArrowRight } from "lucide-react";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useContestSettings, formatContestDate } from "@/hooks/useContestSettings";
import { CONTEST_PACKAGES, getPackageById } from "@/lib/contestPackages";
import ContestCountdown from "@/components/contest/ContestCountdown";

const LS_KEY = "beatmasterdj_giveaway_form_v1";
const IG_HANDLE = "beatmasterdj";
const IG_URL = `https://instagram.com/${IG_HANDLE}`;

const entrySchema = z.object({
  full_name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  agree: z.literal(true, { errorMap: () => ({ message: "You must agree to the rules to enter" }) }),
});

const inquirySchema = z.object({
  event_type: z.string().min(1, "Select an event type"),
  event_date: z.string().min(1, "Event date required")
    .refine((v) => new Date(v).getTime() > Date.now() - 86400000, "Event date must be in the future"),
  venue_location: z.string().trim().min(1, "Venue / location required").max(200),
  guest_count: z.string().refine((v) => Number(v) > 0, "Guest count required"),
  packageId: z.string().min(1, "Pick a package you're interested in"),
  special_requests: z.string().max(1000).optional().or(z.literal("")),
});

type FormState = {
  full_name: string; email: string; phone: string; agree: boolean;
  event_type: string; event_date: string; venue_location: string;
  guest_count: string; packageId: string; special_requests: string;
  website: string;
};

const empty: FormState = {
  full_name: "", email: "", phone: "", agree: false,
  event_type: "", event_date: "", venue_location: "",
  guest_count: "", packageId: "", special_requests: "",
  website: "",
};

const GiveawayPage = () => {
  const navigate = useNavigate();
  const { settings, loading, isActive } = useContestSettings();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);

  // bonus state (step 3)
  const [bonus, setBonus] = useState({
    followed: false, shared: false, tagged: false, handle: "",
  });
  const [savingBonus, setSavingBonus] = useState(false);
  const [bonusSaved, setBonusSaved] = useState(false);

  // Restore + autosave
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setForm({ ...empty, ...JSON.parse(raw) });
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(form)); } catch {}
  }, [form]);

  const groups = useMemo(() => {
    return CONTEST_PACKAGES.reduce<Record<string, typeof CONTEST_PACKAGES>>((acc, p) => {
      (acc[p.categoryLabel] ??= []).push(p);
      return acc;
    }, {});
  }, []);

  const submitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = entrySchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = inquirySchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    const pkg = getPackageById(parsed.data.packageId);
    if (!pkg) { toast.error("Invalid package selection"); return; }

    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("submit-contest-entry", {
      body: {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        agreed_to_rules: form.agree,
        source_page: "giveaway_page",
        website: form.website,
        inquiry: {
          event_type: parsed.data.event_type,
          event_date: parsed.data.event_date,
          venue_location: parsed.data.venue_location,
          guest_count: Number(parsed.data.guest_count),
          special_requests: parsed.data.special_requests || null,
          interested_package_id: pkg.id,
          interested_package_name: pkg.name,
          interested_package_category: pkg.categoryLabel,
          interested_package_price: pkg.price,
        },
      },
    });
    setSubmitting(false);

    const payload = data as any;
    if (error || payload?.error) {
      const msg = payload?.error || "Could not submit entry. Please try again.";
      if (payload?.code === "duplicate_email") {
        toast.success("Looks like you're already entered — good luck!");
        setStep(3);
        setEntryId(payload.entry_id ?? null);
        return;
      }
      toast.error(msg);
      return;
    }

    setEntryId(payload?.entry_id ?? null);

    // fire-and-forget confirmation email
    supabase.functions.invoke("send-contest-email", {
      body: {
        type: "confirmation",
        email: form.email,
        name: form.full_name,
        category: getPackageById(form.packageId)?.categoryLabel,
        packageName: getPackageById(form.packageId)?.name,
        packagePrice: getPackageById(form.packageId)?.price,
      },
    }).catch(() => {});

    setStep(3);
    localStorage.removeItem(LS_KEY);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveBonus = async () => {
    if (!entryId) { toast.error("Missing entry reference"); return; }
    setSavingBonus(true);
    const { error } = await supabase
      .from("contest_entries")
      .update({
        bonus_followed_instagram: bonus.followed,
        bonus_shared_story: bonus.shared,
        bonus_tagged_account: bonus.tagged,
        instagram_handle: bonus.handle.trim() || null,
      })
      .eq("id", entryId);
    setSavingBonus(false);
    if (error) { toast.error("Could not save bonus info"); return; }
    setBonusSaved(true);
    toast.success("Bonus entries recorded — pending verification");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-16 text-center text-muted-foreground">Loading…</main>
        <Footer />
      </div>
    );
  }

  if (!isActive || !settings) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-3xl font-bold mb-3">This contest has ended</h1>
            <p className="text-muted-foreground mb-6">
              Thanks so much for your interest. Follow{" "}
              <a href={IG_URL} className="text-primary underline">@{IG_HANDLE}</a>{" "}
              on Instagram to hear about the next giveaway.
            </p>
            <Button asChild variant="hero"><Link to="/">Back to Home</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-32 md:pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs uppercase tracking-wider text-primary font-display mb-3">
              <Sparkles className="w-3.5 h-3.5" /> {settings.contest_name}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
              <span className="gradient-text">Win a FREE DJ Package</span>
            </h1>
            <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
              One winner receives a full DJ package: up to 6 hours of coverage, professional
              sound system, clean transitions with curated playlists, one custom mix, and
              optional ceremony audio.
            </p>
            <div className="flex justify-center mb-2">
              <ContestCountdown endDate={new Date(settings.end_date)} />
            </div>
            <p className="text-xs text-muted-foreground">
              Contest ends {formatContestDate(settings.end_date)}
            </p>
          </div>

          {/* Step indicator */}
          {step !== 3 && (
            <div className="flex items-center justify-center gap-2 mb-6 text-xs uppercase tracking-wider">
              <span className={step >= 1 ? "text-primary font-display" : "text-muted-foreground"}>1. Enter</span>
              <span className="text-muted-foreground">—</span>
              <span className={step >= 2 ? "text-primary font-display" : "text-muted-foreground"}>2. Event details</span>
            </div>
          )}

          <Card variant="glass">
            <CardContent className="pt-6">
              {/* honeypot everywhere */}
              <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
                <label>Website
                  <input type="text" tabIndex={-1} autoComplete="off"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}/>
                </label>
              </div>

              {step === 1 && (
                <form onSubmit={submitStep1} className="space-y-5">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input id="full_name" value={form.full_name} maxLength={120} required
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}/>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" value={form.email} maxLength={255} required
                      onChange={(e) => setForm({ ...form, email: e.target.value })}/>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input id="phone" type="tel" value={form.phone} maxLength={40}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}/>
                  </div>

                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <Checkbox checked={form.agree}
                      onCheckedChange={(v) => setForm({ ...form, agree: v === true })}/>
                    <span className="text-muted-foreground">
                      I agree to the{" "}
                      <Link to="/giveaway/rules" target="_blank" className="text-primary underline">
                        contest rules
                      </Link>.
                    </span>
                  </label>

                  <Button type="submit" variant="hero" size="lg"
                    className="w-full hidden md:flex">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  {/* Mobile sticky CTA */}
                  <div className="fixed inset-x-0 bottom-0 z-40 p-3 bg-background/90 backdrop-blur border-t border-border md:hidden">
                    <Button type="submit" variant="hero" size="lg" className="w-full">
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={submitStep2} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Event Type *</Label>
                      <Select value={form.event_type}
                        onValueChange={(v) => setForm({ ...form, event_type: v })}>
                        <SelectTrigger><SelectValue placeholder="Choose one" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="private">Private / Birthday</SelectItem>
                          <SelectItem value="party">Party</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="event_date">Event Date *</Label>
                      <Input id="event_date" type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={form.event_date}
                        onChange={(e) => setForm({ ...form, event_date: e.target.value })}/>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="venue">Venue / Location *</Label>
                      <Input id="venue" value={form.venue_location} maxLength={200}
                        onChange={(e) => setForm({ ...form, venue_location: e.target.value })}/>
                    </div>
                    <div>
                      <Label htmlFor="guests">Estimated Guests *</Label>
                      <Input id="guests" type="number" min={1} value={form.guest_count}
                        onChange={(e) => setForm({ ...form, guest_count: e.target.value })}/>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Which package interests you most? *</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Pick the package you'd actually book — this helps us tailor the win / follow-up.
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
                                <button key={p.id} type="button"
                                  onClick={() => setForm({ ...form, packageId: p.id })}
                                  className={`text-left rounded-lg border p-3 transition-all ${
                                    selected
                                      ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(38,85%,55%,0.25)]"
                                      : "border-border bg-card/40 hover:border-primary/40"
                                  }`}>
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

                  <div>
                    <Label htmlFor="notes">Special Requests</Label>
                    <Textarea id="notes" rows={4} maxLength={1000}
                      placeholder="Songs, must-plays, do-not-plays, timeline notes…"
                      value={form.special_requests}
                      onChange={(e) => setForm({ ...form, special_requests: e.target.value })}/>
                  </div>

                  <div className="hidden md:flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button type="submit" variant="hero" size="lg" className="flex-1" disabled={submitting}>
                      {submitting ? "Submitting…" : "Submit Entry — Good Luck!"}
                    </Button>
                  </div>
                  <div className="fixed inset-x-0 bottom-0 z-40 p-3 bg-background/90 backdrop-blur border-t border-border md:hidden flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button type="submit" variant="hero" size="lg" className="flex-1" disabled={submitting}>
                      {submitting ? "Submitting…" : "Submit — Good Luck!"}
                    </Button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                      Your entry has been received — good luck!
                    </h2>
                    <p className="text-muted-foreground">
                      We'll email the winner directly after the contest closes on{" "}
                      {formatContestDate(settings.end_date)}.
                    </p>
                  </div>

                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-5 h-5 text-primary" />
                      <h3 className="font-display text-lg font-semibold">Earn +3 bonus entries</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete all three actions and we'll add <strong>3 extra entries</strong> to
                      your name after we verify them on Instagram.
                    </p>

                    <div className="space-y-2">
                      <label className="flex items-start gap-3 text-sm cursor-pointer">
                        <Checkbox checked={bonus.followed}
                          onCheckedChange={(v) => setBonus({ ...bonus, followed: v === true })}/>
                        <span>
                          Follow{" "}
                          <a href={IG_URL} target="_blank" rel="noreferrer" className="text-primary underline">
                            @{IG_HANDLE}
                          </a>{" "}
                          on Instagram
                        </span>
                      </label>
                      <label className="flex items-start gap-3 text-sm cursor-pointer">
                        <Checkbox checked={bonus.shared}
                          onCheckedChange={(v) => setBonus({ ...bonus, shared: v === true })}/>
                        <span>Share the contest post to your story</span>
                      </label>
                      <label className="flex items-start gap-3 text-sm cursor-pointer">
                        <Checkbox checked={bonus.tagged}
                          onCheckedChange={(v) => setBonus({ ...bonus, tagged: v === true })}/>
                        <span>Tag @{IG_HANDLE} in the story</span>
                      </label>
                    </div>

                    <div>
                      <Label htmlFor="ig">Your Instagram Handle (so we can verify)</Label>
                      <Input id="ig" placeholder="@yourhandle" value={bonus.handle}
                        onChange={(e) => setBonus({ ...bonus, handle: e.target.value })}/>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Bonus entries are confirmed after we manually verify your Instagram activity.
                    </p>

                    <Button onClick={saveBonus} disabled={savingBonus || bonusSaved}
                      variant={bonusSaved ? "outline" : "hero"} className="w-full">
                      {bonusSaved ? "✓ Saved — pending verification" : savingBonus ? "Saving…" : "Save bonus entries"}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button variant="ghost" onClick={() => navigate("/")}>Back to home</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GiveawayPage;
