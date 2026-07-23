import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Trash2, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
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
};

const ContestSignups = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate("/auth");
  }, [adminLoading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { data, error } = await supabase
        .from("contest_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) toast.error("Failed to load entries");
      else setEntries((data as Entry[]) || []);
      setLoading(false);
    })();
  }, [isAdmin]);

  const exportCsv = () => {
    const headers = ["Name", "Email", "Phone", "Source", "Contest ID", "Timestamp"];
    const rows = entries.map((e) => [
      e.full_name, e.email, e.phone ?? "", e.source_page, e.contest_id,
      new Date(e.created_at).toISOString(),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contest-entries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    const { error } = await supabase.from("contest_entries").delete().eq("id", id);
    if (error) return toast.error("Delete failed");
    setEntries((prev) => prev.filter((e) => e.id !== id));
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">
                <span className="gradient-text">Contest Signups</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                {CONTEST.name} — Status:{" "}
                <span className={active ? "text-primary" : "text-muted-foreground"}>
                  {active ? "ACTIVE" : "CLOSED"}
                </span>{" "}
                • Ends {CONTEST.endDate.toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/admin")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Admin
              </Button>
              <Button variant="hero" onClick={exportCsv} disabled={!entries.length}>
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          </div>

          <Card variant="glass">
            <CardHeader><CardTitle>All Entries</CardTitle></CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No entries yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Name</TableHead><TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead><TableHead>Source</TableHead>
                      <TableHead>Date</TableHead><TableHead></TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {entries.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium">{e.full_name}</TableCell>
                          <TableCell>{e.email}</TableCell>
                          <TableCell>{e.phone || "—"}</TableCell>
                          <TableCell className="text-xs">{e.source_page}</TableCell>
                          <TableCell className="text-xs">
                            {new Date(e.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
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
