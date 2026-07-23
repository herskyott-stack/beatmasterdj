import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Trash2, Trophy, Crown, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CONTEST, isContestActive } from "@/lib/contest";

type Entry = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  contest_id: string;
  source_page: string;
  status: string;
  created_at: string;
  interested_package_category: string | null;
  interested_package_name: string | null;
  interested_package_price: number | null;
  is_winner: boolean;
  winner_announced_at: string | null;
};

const ALL = "__all__";

const ContestSignups = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(ALL);
  const [winnerBusy, setWinnerBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate("/auth");
  }, [adminLoading, isAdmin, navigate]);

  const loadEntries = async () => {
    const { data, error } = await supabase
      .from("contest_entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load entries");
    else setEntries((data as Entry[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadEntries();
  }, [isAdmin]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    entries.forEach((e) => e.interested_package_category && s.add(e.interested_package_category));
    return Array.from(s).sort();
  }, [entries]);

  const filtered = useMemo(
    () => (filter === ALL ? entries : entries.filter((e) => e.interested_package_category === filter)),
    [entries, filter],
  );

  const exportCsv = (rows: Entry[], suffix: string) => {
    const headers = [
      "Name", "Email", "Phone", "Package Category", "Package", "Package Price",
      "Winner", "Winner Announced", "Source", "Contest ID", "Timestamp",
    ];
    const csvRows = rows.map((e) => [
      e.full_name, e.email, e.phone ?? "",
      e.interested_package_category ?? "", e.interested_package_name ?? "",
      e.interested_package_price != null ? String(e.interested_package_price) : "",
      e.is_winner ? "YES" : "",
      e.winner_announced_at ?? "",
      e.source_page, e.contest_id,
      new Date(e.created_at).toISOString(),
    ]);
    const csv = [headers, ...csvRows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contest-participants-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    const { error } = await supabase.from("contest_entries").delete().eq("id", id);
    if (error) return toast.error("Delete failed");
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const markAsWinner = async (e: Entry) => {
    if (!confirm(
      `Select ${e.full_name} (${e.email}) as the WINNER? This will:\n\n` +
      `• Mark them as the winner in the database\n` +
      `• Send them the winner announcement email\n\n` +
      `Continue?`,
    )) return;

    setWinnerBusy(e.id);
    try {
      // Clear any previous winner then mark this one
      await supabase
        .from("contest_entries")
        .update({ is_winner: false })
        .eq("contest_id", e.contest_id)
        .neq("id", e.id);

      const now = new Date().toISOString();
      const { error: updErr } = await supabase
        .from("contest_entries")
        .update({ is_winner: true, winner_announced_at: now, status: "winner" })
        .eq("id", e.id);
      if (updErr) throw updErr;

      const { error: mailErr } = await supabase.functions.invoke("send-contest-email", {
        body: {
          type: "winner",
          email: e.email,
          name: e.full_name,
          prize: CONTEST.prize,
          category: e.interested_package_category,
          packageName: e.interested_package_name,
        },
      });
      if (mailErr) throw mailErr;

      toast.success("Winner marked and announcement email sent");
      loadEntries();
    } catch (err) {
      console.error(err);
      toast.error("Could not complete winner selection");
    } finally {
      setWinnerBusy(null);
    }
  };

  const sendPackageFollowup = async (e: Entry) => {
    if (!e.interested_package_name) {
      toast.error("No package on file for this entrant");
      return;
    }
    if (!confirm(`Send a "${e.interested_package_name}" follow-up email to ${e.email}?`)) return;
    const { error } = await supabase.functions.invoke("send-contest-email", {
      body: {
        type: "package_followup",
        email: e.email,
        name: e.full_name,
        category: e.interested_package_category,
        packageName: e.interested_package_name,
        packagePrice: e.interested_package_price,
      },
    });
    if (error) toast.error("Send failed");
    else toast.success("Follow-up sent");
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  if (!isAdmin) return null;

  const active = isContestActive();
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayCount = entries.filter((e) => e.created_at.slice(0, 10) === todayIso).length;
  const winner = entries.find((e) => e.is_winner);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">
                <span className="gradient-text">Contest Participants</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                {CONTEST.name} — Status:{" "}
                <span className={active ? "text-primary" : "text-muted-foreground"}>
                  {active ? "ACTIVE" : "CLOSED"}
                </span>{" "}
                • Ends {CONTEST.endDate.toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => navigate("/admin")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Admin
              </Button>
              <Button variant="outline" onClick={() => exportCsv(entries, "all")} disabled={!entries.length}>
                <Download className="w-4 h-4 mr-2" /> Export all
              </Button>
              <Button variant="hero" onClick={() => exportCsv(filtered, filter === ALL ? "segment" : filter.toLowerCase().replace(/\s+/g, "-"))} disabled={!filtered.length}>
                <Download className="w-4 h-4 mr-2" /> Export segment ({filtered.length})
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card variant="glass"><CardContent className="pt-6 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-primary" />
              <div><p className="text-2xl font-bold">{entries.length}</p>
              <p className="text-sm text-muted-foreground">Total Entries</p></div>
            </CardContent></Card>
            <Card variant="glass"><CardContent className="pt-6">
              <p className="text-2xl font-bold">{todayCount}</p>
              <p className="text-sm text-muted-foreground">Today</p>
            </CardContent></Card>
            <Card variant="glass"><CardContent className="pt-6">
              <p className="text-2xl font-bold">
                {Math.max(0, Math.ceil((CONTEST.endDate.getTime() - Date.now()) / 86400000))}
              </p>
              <p className="text-sm text-muted-foreground">Days Remaining</p>
            </CardContent></Card>
            <Card variant="glass"><CardContent className="pt-6 flex items-center gap-3">
              <Crown className="w-7 h-7 text-primary" />
              <div>
                <p className="text-sm font-bold truncate">
                  {winner ? winner.full_name : "Not selected"}
                </p>
                <p className="text-xs text-muted-foreground">Winner</p>
              </div>
            </CardContent></Card>
          </div>

          <Card variant="glass">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <CardTitle>Participants</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Segment:</span>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All Contest Participants</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No entries in this segment.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Package Interest</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {filtered.map((e) => (
                        <TableRow key={e.id} className={e.is_winner ? "bg-primary/5" : undefined}>
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
                            {e.interested_package_name ? (
                              <>
                                <div className="font-semibold">{e.interested_package_name}</div>
                                <div className="text-muted-foreground">
                                  {e.interested_package_category}
                                  {e.interested_package_price ? ` · $${Number(e.interested_package_price).toLocaleString()}` : ""}
                                </div>
                              </>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {new Date(e.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button size="sm" variant="ghost"
                              onClick={() => sendPackageFollowup(e)}
                              title="Send package follow-up email">
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost"
                              onClick={() => markAsWinner(e)}
                              disabled={winnerBusy === e.id}
                              title="Mark as winner & send announcement">
                              <Crown className={`w-4 h-4 ${e.is_winner ? "text-primary" : ""}`} />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteEntry(e.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

export default ContestSignups;
