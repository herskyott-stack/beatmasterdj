import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Download, Trash2, Crown, Mail, Settings as SettingsIcon,
  ShieldCheck, Ticket, Instagram, Dice5,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useContestSettings, formatContestDateTime } from "@/hooks/useContestSettings";

type Entry = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  contest_id: string;
  source_page: string;
  created_at: string;
  interested_package_category: string | null;
  interested_package_name: string | null;
  interested_package_price: number | null;
  is_winner: boolean;
  winner_announced_at: string | null;
  agreed_to_rules: boolean;
  bonus_followed_instagram: boolean;
  bonus_shared_story: boolean;
  bonus_tagged_account: boolean;
  bonus_verified: boolean;
  instagram_handle: string | null;
  event_inquiry_id: string | null;
};

type Inquiry = {
  id: string;
  entry_id: string;
  event_type: string | null;
  event_date: string | null;
  venue_location: string | null;
  guest_count: number | null;
  special_requests: string | null;
  interested_package_name: string | null;
  interested_package_category: string | null;
  interested_package_price: number | null;
};

const ticketsFor = (e: Entry) => {
  const claimed = e.bonus_followed_instagram && e.bonus_shared_story && e.bonus_tagged_account;
  return 1 + (claimed && e.bonus_verified ? 3 : 0);
};

const ContestSignups = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { settings, isActive } = useContestSettings();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [inquiries, setInquiries] = useState<Record<string, Inquiry>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Entry | null>(null);
  const [drawResult, setDrawResult] = useState<Entry | null>(null);
  const [drawOpen, setDrawOpen] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate("/auth");
  }, [adminLoading, isAdmin, navigate]);

  const load = async () => {
    const [{ data: e }, { data: i }] = await Promise.all([
      supabase.from("contest_entries").select("*").order("created_at", { ascending: false }),
      supabase.from("contest_event_inquiries").select("*"),
    ]);
    setEntries((e as Entry[]) || []);
    const map: Record<string, Inquiry> = {};
    (i as Inquiry[] | null)?.forEach((row) => { if (row.entry_id) map[row.entry_id] = row; });
    setInquiries(map);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      e.full_name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      (e.interested_package_name ?? "").toLowerCase().includes(q) ||
      (e.instagram_handle ?? "").toLowerCase().includes(q)
    );
  }, [entries, search]);

  const stats = useMemo(() => {
    const claimed = entries.filter((e) =>
      e.bonus_followed_instagram && e.bonus_shared_story && e.bonus_tagged_account).length;
    const verified = entries.filter((e) =>
      e.bonus_verified && e.bonus_followed_instagram && e.bonus_shared_story && e.bonus_tagged_account).length;
    const tickets = entries.reduce((sum, e) => sum + ticketsFor(e), 0);
    return { total: entries.length, claimed, verified, tickets };
  }, [entries]);

  const daysRemaining = settings
    ? Math.max(0, Math.ceil((new Date(settings.end_date).getTime() - Date.now()) / 86400000))
    : 0;
  const winner = entries.find((e) => e.is_winner);

  const toggleVerify = async (e: Entry) => {
    const next = !e.bonus_verified;
    const { error } = await supabase.from("contest_entries")
      .update({ bonus_verified: next }).eq("id", e.id);
    if (error) return toast.error("Update failed");
    setEntries((prev) => prev.map((x) => x.id === e.id ? { ...x, bonus_verified: next } : x));
  };

  const exportCsv = () => {
    const headers = [
      "Name", "Email", "Phone", "Package Category", "Package", "Package Price",
      "Event Type", "Event Date", "Venue", "Guests", "Special Requests",
      "IG Handle", "Bonus Followed", "Bonus Shared", "Bonus Tagged", "Bonus Verified",
      "Total Tickets", "Winner", "Winner Announced", "Entered At",
    ];
    const rows = entries.map((e) => {
      const inq = inquiries[e.id];
      return [
        e.full_name, e.email, e.phone ?? "",
        e.interested_package_category ?? "", e.interested_package_name ?? "",
        e.interested_package_price != null ? String(e.interested_package_price) : "",
        inq?.event_type ?? "", inq?.event_date ?? "", inq?.venue_location ?? "",
        inq?.guest_count != null ? String(inq.guest_count) : "",
        inq?.special_requests ?? "",
        e.instagram_handle ?? "",
        e.bonus_followed_instagram ? "Y" : "",
        e.bonus_shared_story ? "Y" : "",
        e.bonus_tagged_account ? "Y" : "",
        e.bonus_verified ? "Y" : "",
        String(ticketsFor(e)),
        e.is_winner ? "YES" : "",
        e.winner_announced_at ?? "",
        new Date(e.created_at).toISOString(),
      ];
    });
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beatmasterdj-contest-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    const { error } = await supabase.from("contest_entries").delete().eq("id", id);
    if (error) return toast.error("Delete failed");
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const runDraw = () => {
    const eligible = entries.filter((e) => !e.is_winner);
    if (!eligible.length) { toast.error("No eligible entries to draw from"); return; }
    // Weighted pool
    const pool: Entry[] = [];
    eligible.forEach((e) => {
      const n = ticketsFor(e);
      for (let i = 0; i < n; i++) pool.push(e);
    });
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setDrawResult(pick);
    setDrawOpen(true);
  };

  const confirmWinner = async () => {
    if (!drawResult) return;
    const now = new Date().toISOString();
    await supabase.from("contest_entries").update({ is_winner: false })
      .eq("contest_id", drawResult.contest_id).neq("id", drawResult.id);
    const { error } = await supabase.from("contest_entries")
      .update({ is_winner: true, winner_announced_at: now, status: "winner" })
      .eq("id", drawResult.id);
    if (error) { toast.error("Failed to save winner"); return; }
    if (settings) {
      await supabase.from("contest_settings")
        .update({ winner_entry_id: drawResult.id, announcement_date: now })
        .eq("id", settings.id);
    }
    const t = toast.loading("Sending one contest result email to each entrant…");
    const { data, error: fnErr } = await supabase.functions.invoke("send-contest-email", {
      body: {
        type: "announce_all",
        contestId: drawResult.contest_id,
        winnerId: drawResult.id,
      },
    });
    toast.dismiss(t);
    if (fnErr) toast.error("Winner saved but email blast failed — check logs");
    else toast.success(`Winner saved. Sent one result email to ${(data as any)?.sent ?? 0} entrants.`);
    setDrawOpen(false);
    setDrawResult(null);
    load();
  };

  if (adminLoading || loading) {
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
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">
                <span className="gradient-text">Contest Dashboard</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                {settings?.contest_name ?? "Contest"} —{" "}
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-display uppercase tracking-wider ${
                  isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {isActive ? "Active" : "Closed"}
                </span>{" "}
                {isActive && <>· {daysRemaining} days remaining</>}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate("/admin")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Admin
              </Button>
              <Button variant="outline" onClick={() => navigate("/admin/contest/settings")}>
                <SettingsIcon className="w-4 h-4 mr-2" /> Settings
              </Button>
              <Button variant="outline" onClick={exportCsv} disabled={!entries.length}>
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
              <Button variant="hero" onClick={runDraw} disabled={!entries.length}>
                <Dice5 className="w-4 h-4 mr-2" /> Pick Winner
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card variant="glass"><CardContent className="pt-6">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Entries</p>
            </CardContent></Card>
            <Card variant="glass"><CardContent className="pt-6 flex items-center gap-3">
              <Instagram className="w-7 h-7 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.claimed}</p>
                <p className="text-sm text-muted-foreground">Bonus Claimed</p>
              </div>
            </CardContent></Card>
            <Card variant="glass"><CardContent className="pt-6 flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-sm text-muted-foreground">Bonus Verified</p>
              </div>
            </CardContent></Card>
            <Card variant="glass"><CardContent className="pt-6 flex items-center gap-3">
              <Ticket className="w-7 h-7 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.tickets}</p>
                <p className="text-sm text-muted-foreground">Tickets in Draw</p>
              </div>
            </CardContent></Card>
          </div>

          {winner && (
            <Card variant="glass" className="mb-6 border-primary/40">
              <CardContent className="pt-6 flex items-center gap-3">
                <Crown className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-primary font-display">Winner</p>
                  <p className="font-semibold">{winner.full_name} — {winner.email}</p>
                  {winner.winner_announced_at && (
                    <p className="text-xs text-muted-foreground">
                      Announced {formatContestDateTime(winner.winner_announced_at)}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={runDraw}>Redraw</Button>
              </CardContent>
            </Card>
          )}

          <Card variant="glass">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <CardTitle>Participants ({filtered.length})</CardTitle>
              <Input placeholder="Search name, email, package, IG…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs" />
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No entries.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead>Tickets</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {filtered.map((e) => {
                        const claimed = e.bonus_followed_instagram && e.bonus_shared_story && e.bonus_tagged_account;
                        return (
                          <TableRow key={e.id}
                            className={`cursor-pointer ${e.is_winner ? "bg-primary/5" : ""}`}
                            onClick={() => setDetail(e)}>
                            <TableCell className="font-medium">
                              {e.full_name}
                              {e.is_winner && (
                                <span className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                                  <Crown className="w-3 h-3" /> Winner
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">{e.email}</TableCell>
                            <TableCell className="text-xs">
                              {e.interested_package_name
                                ? <><div className="font-semibold">{e.interested_package_name}</div>
                                    <div className="text-muted-foreground">{e.interested_package_category}</div></>
                                : "—"}
                            </TableCell>
                            <TableCell className="text-xs">
                              {claimed
                                ? (e.bonus_verified
                                    ? <span className="inline-flex items-center gap-1 text-primary"><ShieldCheck className="w-3 h-3" /> Verified</span>
                                    : <span className="text-muted-foreground">Claimed</span>)
                                : <span className="text-muted-foreground/60">—</span>}
                            </TableCell>
                            <TableCell className="tabular-nums font-display text-primary">{ticketsFor(e)}</TableCell>
                            <TableCell className="text-xs">
                              {new Date(e.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right space-x-1"
                              onClick={(ev) => ev.stopPropagation()}>
                              <Button size="sm" variant={e.bonus_verified ? "hero" : "ghost"}
                                onClick={() => toggleVerify(e)}
                                title={e.bonus_verified ? "Un-verify bonus" : "Verify bonus"}>
                                <ShieldCheck className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => deleteEntry(e.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Entry detail modal */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{detail?.full_name}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Email:</span> {detail.email}</div>
              <div><span className="text-muted-foreground">Phone:</span> {detail.phone || "—"}</div>
              <div><span className="text-muted-foreground">IG Handle:</span> {detail.instagram_handle || "—"}</div>
              <div><span className="text-muted-foreground">Entered:</span> {formatContestDateTime(detail.created_at)}</div>
              <div><span className="text-muted-foreground">Tickets:</span> <span className="font-display text-primary">{ticketsFor(detail)}</span></div>
              <hr className="border-border" />
              <p className="text-xs uppercase tracking-wider text-primary font-display">Package Interest</p>
              <div>{detail.interested_package_name || "—"} <span className="text-muted-foreground">({detail.interested_package_category || "—"})</span></div>
              {inquiries[detail.id] && (
                <>
                  <hr className="border-border" />
                  <p className="text-xs uppercase tracking-wider text-primary font-display">Event Details</p>
                  <div>Type: {inquiries[detail.id].event_type || "—"}</div>
                  <div>Date: {inquiries[detail.id].event_date || "—"}</div>
                  <div>Venue: {inquiries[detail.id].venue_location || "—"}</div>
                  <div>Guests: {inquiries[detail.id].guest_count ?? "—"}</div>
                  {inquiries[detail.id].special_requests && (
                    <div className="text-muted-foreground italic">"{inquiries[detail.id].special_requests}"</div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Draw result modal */}
      <Dialog open={drawOpen} onOpenChange={setDrawOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Random draw result</DialogTitle></DialogHeader>
          {drawResult && (
            <div className="space-y-3 text-center py-4">
              <Crown className="w-12 h-12 text-primary mx-auto" />
              <p className="font-display text-2xl font-bold">{drawResult.full_name}</p>
              <p className="text-muted-foreground">{drawResult.email}</p>
              <p className="text-xs text-muted-foreground">
                Drawn from {stats.tickets} tickets · {stats.total} entries
              </p>
              <p className="text-sm text-muted-foreground">
                Confirming will email the winner and all {Math.max(0, stats.total - 1)} non-winners once. No discount email will be sent.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={runDraw}>Redraw</Button>
            <Button variant="hero" onClick={confirmWinner}>Confirm &amp; email all entrants</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContestSignups;
