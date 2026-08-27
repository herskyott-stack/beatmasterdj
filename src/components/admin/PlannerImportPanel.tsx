import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CloudDownload, Link2, RefreshCw, Search, UserPlus } from "lucide-react";

type SyncedClient = {
  id: string;
  source_app: string;
  external_id: string;
  profile_id: string | null;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  event_date: string | null;
  event_type: string | null;
  venue_location: string | null;
  updated_at: string;
};

type ProfileLite = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

const splitName = (full: string | null, fallbackEmail: string | null) => {
  const base = (full || fallbackEmail?.split("@")[0] || "Planner Client").trim();
  const parts = base.split(/\s+/);
  return {
    first_name: parts[0] || "Planner",
    last_name: parts.slice(1).join(" ") || "Client",
  };
};

interface Props {
  onProfilesChanged?: () => void;
}

const PlannerImportPanel = ({ onProfilesChanged }: Props) => {
  const [rows, setRows] = useState<SyncedClient[]>([]);
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const profilesRef = useRef<ProfileLite[]>([]);
  profilesRef.current = profiles;

  const load = async () => {
    setLoading(true);
    const [syncedResult, profilesResult, musicResult] = await Promise.all([
      supabase.from("synced_clients").select("*").order("updated_at", { ascending: false }),
      supabase.from("profiles").select("id, first_name, last_name, email").order("first_name"),
      supabase.from("synced_music").select("synced_client_id"),
    ]);

    const firstError = syncedResult.error || profilesResult.error || musicResult.error;
    if (firstError) {
      setLoading(false);
      toast({
        title: "Could not load planner data",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    const tally: Record<string, number> = {};
    (musicResult.data ?? []).forEach((m) => {
      tally[m.synced_client_id] = (tally[m.synced_client_id] ?? 0) + 1;
    });

    setRows((syncedResult.data ?? []) as SyncedClient[]);
    setProfiles((profilesResult.data ?? []) as ProfileLite[]);
    setCounts(tally);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Live updates: re-pull synced planner records as they arrive.
  useEffect(() => {
    const channel = supabase
      .channel("planner-import-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "synced_clients" },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "synced_music" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const linkTo = async (row: SyncedClient, profileId: string) => {
    setBusy(row.id);
    const { error } = await supabase
      .from("synced_clients")
      .update({ profile_id: profileId })
      .eq("id", row.id);
    setBusy(null);

    if (error) {
      toast({ title: "Could not link", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Linked to client" });
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, profile_id: profileId } : r)));
    onProfilesChanged?.();
  };

  const importRow = async (row: SyncedClient) => {
    setBusy(row.id);

    // Reuse an existing client with the same email instead of creating a duplicate.
    // Uses the ref (not the closed-over state) so sequential "Import all" runs see
    // profiles created moments earlier in the same loop.
    const normalizedEmail = row.email?.toLowerCase();
    const existing = normalizedEmail
      ? profilesRef.current.find((p) => p.email.toLowerCase() === normalizedEmail)
      : undefined;

    let profileId = existing?.id ?? null;

    if (!profileId) {
      const { first_name, last_name } = splitName(row.full_name, row.email);
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          first_name,
          last_name,
          email: (row.email || `${row.external_id}@planner.local`).toLowerCase(),
          phone: row.phone,
          event_date: row.event_date,
          event_type: row.event_type,
          event_location: row.venue_location,
          notes: `Imported from ${row.source_app} (${row.external_id})`,
        })
        .select("id, first_name, last_name, email")
        .single();

      if (error || !data) {
        setBusy(null);
        toast({ title: "Import failed", description: error?.message, variant: "destructive" });
        return;
      }
      profileId = data.id;
      setProfiles((prev) => [...prev, data as ProfileLite]);
    }

    const { error: linkErr } = await supabase
      .from("synced_clients")
      .update({ profile_id: profileId })
      .eq("id", row.id);
    setBusy(null);

    if (linkErr) {
      toast({ title: "Linked partially", description: linkErr.message, variant: "destructive" });
      return;
    }

    toast({
      title: existing ? "Attached to existing client" : "Client imported",
      description: "Planner music, notes and timeline now show on their profile.",
    });
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, profile_id: profileId } : r)));
    onProfilesChanged?.();
  };

  const importAll = async () => {
    const pending = rows.filter((r) => !r.profile_id);
    for (const row of pending) {
      // sequential so each import can reuse profiles created just before it
      // eslint-disable-next-line no-await-in-loop
      await importRow(row);
    }
    load();
  };

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (r.full_name ?? "").toLowerCase().includes(q) ||
      (r.email ?? "").toLowerCase().includes(q) ||
      r.external_id.toLowerCase().includes(q)
    );
  });

  const pendingCount = rows.filter((r) => !r.profile_id).length;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Loading Vibe Planner records...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search planner clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card/50 border-white/10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="hero" onClick={importAll} disabled={pendingCount === 0}>
            <CloudDownload className="w-4 h-4 mr-2" />
            Import all ({pendingCount})
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Importing only creates or links client records — planner music, notes, playlists, timelines
        and files are never changed or deleted.
      </p>

      {filtered.length === 0 ? (
        <Card variant="glass">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No Vibe Planner records here yet. Once the planner site pushes data, clients show up
            here ready to import.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => {
            const linked = profiles.find((p) => p.id === row.profile_id);
            return (
              <Card key={row.id} variant="glass">
                <CardContent className="py-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium truncate">
                        {row.full_name || row.email || row.external_id}
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        {row.source_app}
                      </Badge>
                      {counts[row.id] ? (
                        <Badge variant="outline" className="text-[10px]">
                          {counts[row.id]} songs
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {[row.email, row.event_date, row.event_type, row.venue_location]
                        .filter(Boolean)
                        .join(" · ") || "No event details"}
                    </p>
                    {linked && (
                      <p className="text-xs text-primary mt-1 flex items-center gap-1">
                        <Link2 className="w-3 h-3" />
                        Linked to {linked.first_name} {linked.last_name}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={row.profile_id ?? undefined}
                      onValueChange={(v) => linkTo(row, v)}
                    >
                      <SelectTrigger className="w-full sm:w-56 bg-card/50 border-white/10">
                        <SelectValue placeholder="Link to existing client" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.first_name} {p.last_name} — {p.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!row.profile_id && (
                      <Button
                        variant="hero"
                        onClick={() => importRow(row)}
                        disabled={busy === row.id}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {busy === row.id ? "Importing..." : "Import"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlannerImportPanel;
