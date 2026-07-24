import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, XOctagon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useContestSettings, ContestSettings as SettingsT } from "@/hooks/useContestSettings";

// Format a UTC ISO into a value suitable for <input type="datetime-local">.
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const ContestSettingsPage = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { settings } = useContestSettings();
  const [form, setForm] = useState<SettingsT | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate("/auth");
  }, [adminLoading, isAdmin, navigate]);

  useEffect(() => {
    if (settings && !form) setForm(settings);
  }, [settings, form]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const { error } = await supabase.from("contest_settings").update({
      contest_name: form.contest_name,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      auto_stop_enabled: form.auto_stop_enabled,
      announcement_date: form.announcement_date
        ? new Date(form.announcement_date).toISOString() : null,
    }).eq("id", form.id);
    setSaving(false);
    if (error) { toast.error("Save failed: " + error.message); return; }
    toast.success("Contest settings saved");
  };

  const closeNow = async () => {
    if (!form) return;
    if (!confirm("Close the contest immediately? Entries will stop being accepted right away.")) return;
    const nowIso = new Date().toISOString();
    const { error } = await supabase.from("contest_settings")
      .update({ end_date: nowIso, auto_stop_enabled: true }).eq("id", form.id);
    if (error) { toast.error("Failed to close contest"); return; }
    toast.success("Contest closed");
    setForm({ ...form, end_date: nowIso, auto_stop_enabled: true });
  };

  if (adminLoading || !form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button variant="ghost" onClick={() => navigate("/admin/contest")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Contest
          </Button>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-6">
            <span className="gradient-text">Contest Settings</span>
          </h1>

          <Card variant="glass">
            <CardHeader><CardTitle>General</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="name">Contest Name</Label>
                <Input id="name" value={form.contest_name}
                  onChange={(e) => setForm({ ...form, contest_name: e.target.value })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start">Start (local time)</Label>
                  <Input id="start" type="datetime-local"
                    value={toLocalInput(form.start_date)}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}/>
                </div>
                <div>
                  <Label htmlFor="end">End (local time)</Label>
                  <Input id="end" type="datetime-local"
                    value={toLocalInput(form.end_date)}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}/>
                </div>
              </div>
              <div>
                <Label htmlFor="ann">Announcement Date (optional)</Label>
                <Input id="ann" type="datetime-local"
                  value={form.announcement_date ? toLocalInput(form.announcement_date) : ""}
                  onChange={(e) => setForm({ ...form, announcement_date: e.target.value || null })}/>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium text-sm">Auto-stop at end date</p>
                  <p className="text-xs text-muted-foreground">
                    When on, the banner and entry forms automatically disappear at the end date.
                  </p>
                </div>
                <Switch checked={form.auto_stop_enabled}
                  onCheckedChange={(v) => setForm({ ...form, auto_stop_enabled: v })}/>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={save} variant="hero" disabled={saving} className="flex-1">
                  <Save className="w-4 h-4 mr-2" /> {saving ? "Saving…" : "Save Settings"}
                </Button>
                <Button onClick={closeNow} variant="outline">
                  <XOctagon className="w-4 h-4 mr-2" /> Close Contest Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContestSettingsPage;
