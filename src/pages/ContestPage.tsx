import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Sparkles, AlertTriangle } from "lucide-react";
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

const schema = z.object({
  full_name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  agree: z.literal(true, { errorMap: () => ({ message: "You must agree to the rules" }) }),
});

const ContestPage = () => {
  const active = isContestActive();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", agree: false });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contest_entries").insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      contest_id: CONTEST.id,
      source_page: "contest_page",
    });
    if (error) {
      console.error(error);
      toast.error("Could not submit entry. Please try again.");
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
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs uppercase tracking-wider text-primary font-display mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Limited-Time Contest
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
              <span className="gradient-text">Enter the Contest — Good Luck!</span>
            </h1>
            <p className="text-muted-foreground">
              Fill out the form to enter our {CONTEST.name}. Winners will be contacted directly by email.
            </p>
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
                <form onSubmit={handleSubmit} className="space-y-5">
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
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <Checkbox
                      checked={form.agree}
                      onCheckedChange={(v) => setForm({ ...form, agree: v === true })}
                    />
                    <span className="text-muted-foreground">
                      I agree to the contest rules and privacy policy.
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
