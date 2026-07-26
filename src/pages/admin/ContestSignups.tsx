import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Download, Trash2, Crown, Send, Settings as SettingsIcon,
  ShieldCheck, Ticket, Instagram, Dice5, Copy, AlertCircle, Eye,
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
  dedupe_override: boolean;
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

const FOLLOWUP_STEPS: { key: string; label: string; when: string }[] = [
  { key: "confirmation", label: "Instant · Entry confirmation", when: "On signup" },
  { key: "day_1", label: "Day 1 · What you could win", when: "+1 day" },
  { key: "day_3", label: "Day 3 · Testimonials", when: "+3 days" },
  { key: "day_7", label: "Day 7 · Sample mix", when: "+7 days" },
  { key: "day_14", label: "Day 14 · Date check-in", when: "+14 days" },
  { key: "day_21", label: "Day 21 · FAQ", when: "+21 days" },
  { key: "day_30", label: "Day 30 · Timeline resource", when: "+30 days" },
  { key: "day_45", label: "Day 45 · Date holding", when: "+45 days" },
  { key: "winner", label: "Winner announcement", when: "On draw" },
  { key: "loser", label: "Non-winner announcement", when: "On draw" },
  { key: "discount_offer", label: "Consolation $200 off", when: "Manual" },
];

const ticketsForEffective = (e: Entry, suppressed: boolean) => {
  if (suppressed) return 0;
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
  const [sendingPreview, setSendingPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate("/auth");
  }, [adminLoading, isAdmin, navigate]);

  const load = async () => {
    const [{ data: e }, { data: i }] = await Promise.all([
      supabase.from("contest_entries").select("*").order("created_at", { ascending: true }),
      supabase.from("contest_event_inquiries").select("*"),
    ]);
    setEntries((e as Entry[]) || []);
    const map: Record<string, Inquiry> = {};
    (i as Inquiry[] | null)?.forEach((row) => { if (row.entry_id) map[row.entry_id] = row; });
    setInquiries(map);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  // ── Duplicate detection ────────────────────────────────────────────
  // Group by lower(email). Oldest entry in each group is the "primary".
  // Newer entries in the same group are auto-suppressed unless
  // dedupe_override=true.
  const { suppressedIds, duplicateGroups } = useMemo(() => {
    const groups: Record<string, Entry[]> = {};
    entries.forEach((e) => {
      const k = e.email.toLowerCase().trim();
      (groups[k] ||= []).push(e);
    });
    const suppressed = new Set<string>();
    const dupGroups: Record<string, Entry[]> = {};
    Object.entries(groups).forEach(([k, list]) => {
      if (list.length < 2) return;
      dupGroups[k] = list;
      // list is asc; primary = list[0]
      list.slice(1).forEach((e) => {
        if (!e.dedupe_override) suppressed.add(e.id);
      });
    });
    return { suppressedIds: suppressed, duplicateGroups: dupGroups };
  }, [entries]);

  const sortedForDisplay = useMemo(
    () => [...entries].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)),
    [entries],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedForDisplay;
    return sortedForDisplay.filter((e) =>
      e.full_name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      (e.interested_package_name ?? "").toLowerCase().includes(q) ||
      (e.instagram_handle ?? "").toLowerCase().includes(q)
    );
  }, [sortedForDisplay, search]);

  const stats = useMemo(() => {
    const counted = entries.filter((e) => !suppressedIds.has(e.id));
    const claimed = counted.filter((e) =>
      e.bonus_followed_instagram && e.bonus_shared_story && e.bonus_tagged_account).length;
    const verified = counted.filter((e) =>
      e.bonus_verified && e.bonus_followed_instagram && e.bonus_shared_story && e.bonus_tagged_account).length;
    const tickets = counted.reduce((sum, e) => sum + ticketsForEffective(e, false), 0);
    return {
      total: counted.length,
      raw: entries.length,
      duplicates: suppressedIds.size,
      claimed,
      verified,
      tickets,
    };
  }, [entries, suppressedIds]);

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

  const toggleOverride = async (e: Entry) => {
    const next = !e.dedupe_override;
    const { error } = await supabase.from("contest_entries")
      .update({ dedupe_override: next }).eq("id", e.id);
    if (error) return toast.error("Override failed");
    setEntries((prev) => prev.map((x) => x.id === e.id ? { ...x, dedupe_override: next } : x));
    toast.success(next ? "Duplicate now counts" : "Duplicate suppressed");
  };

  const exportCsv = () => {
    const headers = [
      "Name", "Email", "Duplicate?", "Counts?", "Phone", "Package Category", "Package", "Package Price",
      "Event Type", "Event Date", "Venue", "Guests", "Special Requests",
      "IG Handle", "Bonus Followed", "Bonus Shared", "Bonus Tagged", "Bonus Verified",
      "Total Tickets", "Winner", "Winner Announced", "Entered At",
    ];
    const rows = entries.map((e) => {
      const inq = inquiries[e.id];
      const isDup = !!duplicateGroups[e.email.toLowerCase().trim()];
      const suppressed = suppressedIds.has(e.id);
      return [
        e.full_name, e.email,
        isDup ? "Y" : "",
        suppressed ? "" : "Y",
        e.phone ?? "",
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
        String(ticketsForEffective(e, suppressed)),
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
    const eligible = entries.filter((e) => !e.is_winner && !suppressedIds.has(e.id));
    if (!eligible.length) { toast.error("No eligible entries to draw from"); return; }
    const pool: Entry[] = [];
    eligible.forEach((e) => {
      const n = ticketsForEffective(e, false);
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

  const sendPreview = async (type: string) => {
    setSendingPreview(type);
    const { error } = await supabase.functions.invoke("send-contest-email", {
      body: {
        type,
        email: "hersky.ott@gmail.com",
        name: "Jake (preview)",
        category: "Wedding",
        packageName: "Wedding Essential",
      },
    });
    setSendingPreview(null);
    if (error) toast.error(`Preview send failed: ${error.message ?? error}`);
    else toast.success(`Queued "${type}" preview to hersky.ott@gmail.com`);
  };

  const sendAllPreviews = async () => {
    setSendingPreview("__all__");
    const t = toast.loading("Queueing all follow-up previews…");
    for (const step of FOLLOWUP_STEPS) {
      await supabase.functions.invoke("send-contest-email", {
        body: {
          type: step.key,
          email: "hersky.ott@gmail.com",
          name: "Jake (preview)",
          category: "Wedding",
          packageName: "Wedding Essential",
        },
      });
    }
    toast.dismiss(t);
    setSendingPreview(null);
    toast.success(`Queued ${FOLLOWUP_STEPS.length} preview emails`);
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
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 gap-3">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight">
                <span className="gradient-text">Contest Dashboard</span>
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm mt-1">
                {settings?.contest_name ?? "Contest"} ·{" "}
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-display uppercase tracking-wider ${
                  isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {isActive ? "Active" : "Closed"}
                </span>
                {isActive && <> · {daysRemaining}d remaining</>}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate("/admin")}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Admin
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/admin/contest/settings")}>
                <SettingsIcon className="w-4 h-4 mr-1.5" /> Settings
              </Button>
              <Button size="sm" variant="outline" onClick={exportCsv} disabled={!entries.length}>
                <Download className="w-4 h-4 mr-1.5" /> CSV
              </Button>
              <Button size="sm" variant="hero" onClick={runDraw} disabled={!entries.length}>
                <Dice5 className="w-4 h-4 mr-1.5" /> Pick Winner
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            <Card variant="glass"><CardContent className="p-4">
              <p className="text-xl font-bold leading-tight">{stats.total}</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Counted</p>
              {stats.raw !== stats.total && (
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">of {stats.raw} raw</p>
              )}
            </CardContent></Card>
            <Card variant="glass"><CardContent className="p-4 flex items-center gap-2">
              <Copy className="w-5 h-5 text-yellow-500 shrink-0" />
              <div>
                <p className="text-xl font-bold leading-tight">{Object.keys(duplicateGroups).length}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Dup emails</p>
              </div>
            </CardContent></Card>
            <Card variant="glass"><CardContent className="p-4 flex items-center gap-2">
              <Instagram className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xl font-bold leading-tight">{stats.claimed}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Bonus claimed</p>
              </div>
            </CardContent></Card>
            <Card variant="glass"><CardContent className="p-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xl font-bold leading-tight">{stats.verified}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Verified</p>
              </div>
            </CardContent></Card>
            <Card variant="glass"><CardContent className="p-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xl font-bold leading-tight">{stats.tickets}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Draw tickets</p>
              </div>
            </CardContent></Card>
          </div>

          {winner && (
            <Card variant="glass" className="mb-5 border-primary/40">
              <CardContent className="p-4 flex items-center gap-3">
                <Crown className="w-6 h-6 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-primary font-display">Winner</p>
                  <p className="font-semibold text-sm truncate">{winner.full_name} — {winner.email}</p>
                  {winner.winner_announced_at && (
                    <p className="text-[10px] text-muted-foreground">
                      Announced {formatContestDateTime(winner.winner_announced_at)}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={runDraw}>Redraw</Button>
              </CardContent>
            </Card>
          )}

          {/* Duplicate warning banner */}
          {Object.keys(duplicateGroups).length > 0 && (
            <Card variant="glass" className="mb-5 border-yellow-500/40">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">
                    {Object.keys(duplicateGroups).length} duplicate email{Object.keys(duplicateGroups).length > 1 ? "s" : ""} detected
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    The oldest entry counts by default; newer entries are auto-crossed out.
                    Toggle <ShieldCheck className="inline w-3 h-3" /> on any crossed-out row to force it to count.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Participants table */}
          <Card variant="glass" className="mb-6">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-4">
              <CardTitle className="text-lg">Participants ({filtered.length})</CardTitle>
              <Input placeholder="Search name, email, package, IG…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs h-9" />
            </CardHeader>
            <CardContent className="pt-0">
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
                        const emailKey = e.email.toLowerCase().trim();
                        const isDup = !!duplicateGroups[emailKey];
                        const suppressed = suppressedIds.has(e.id);
                        return (
                          <TableRow key={e.id}
                            className={`cursor-pointer ${e.is_winner ? "bg-primary/5" : ""} ${suppressed ? "opacity-50" : ""}`}
                            onClick={() => setDetail(e)}>
                            <TableCell className={`font-medium ${suppressed ? "line-through" : ""}`}>
                              {e.full_name}
                              {e.is_winner && (
                                <span className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                                  <Crown className="w-3 h-3" /> Winner
                                </span>
                              )}
                              {isDup && (
                                <span
                                  className={`ml-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                    suppressed ? "bg-yellow-500/20 text-yellow-500" : "bg-emerald-500/20 text-emerald-500"
                                  }`}
                                  title={suppressed ? "Auto-suppressed duplicate" : e.dedupe_override ? "Admin override — counts" : "Primary entry"}
                                >
                                  <Copy className="w-3 h-3" />
                                  {suppressed ? "Dup" : e.dedupe_override ? "Dup·on" : "Primary"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className={`text-sm ${suppressed ? "line-through" : ""}`}>{e.email}</TableCell>
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
                            <TableCell className="tabular-nums font-display text-primary">
                              {ticketsForEffective(e, suppressed)}
                            </TableCell>
                            <TableCell className="text-xs">
                              {new Date(e.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right space-x-1"
                              onClick={(ev) => ev.stopPropagation()}>
                              {isDup && suppressed && (
                                <Button size="sm" variant="outline" onClick={() => toggleOverride(e)}
                                  title="Force this duplicate to count">
                                  Count
                                </Button>
                              )}
                              {isDup && !suppressed && e.dedupe_override && (
                                <Button size="sm" variant="ghost" onClick={() => toggleOverride(e)}
                                  title="Remove override">
                                  Un-count
                                </Button>
                              )}
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

          {/* Follow-up email previews */}
          <Card variant="glass">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Follow-up email previews
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Sends each scheduled contest email to <strong>hersky.ott@gmail.com</strong> so you can review the copy.
                </p>
              </div>
              <Button size="sm" variant="hero" onClick={sendAllPreviews}
                disabled={sendingPreview !== null}>
                <Send className="w-4 h-4 mr-1.5" />
                {sendingPreview === "__all__" ? "Sending…" : "Send all previews"}
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {FOLLOWUP_STEPS.map((s) => (
                  <div key={s.key}
                    className="flex items-center justify-between gap-3 border border-border/50 rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.label}</p>
                      <p className="text-[11px] text-muted-foreground">{s.when} · <code className="text-[10px]">{s.key}</code></p>
                    </div>
                    <Button size="sm" variant="outline"
                      disabled={sendingPreview !== null}
                      onClick={() => sendPreview(s.key)}>
                      {sendingPreview === s.key ? "…" : "Send"}
                    </Button>
                  </div>
                ))}
              </div>
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
              <div><span className="text-muted-foreground">Tickets:</span> <span className="font-display text-primary">{ticketsForEffective(detail, suppressedIds.has(detail.id))}</span></div>
              {suppressedIds.has(detail.id) && (
                <div className="text-yellow-500 text-xs">
                  Auto-suppressed duplicate. Click "Count" in the row to override.
                </div>
              )}
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
