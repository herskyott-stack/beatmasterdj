import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Music,
  StickyNote,
  ListMusic,
  Clock,
  PackagePlus,
  Paperclip,
  RefreshCw,
  CloudOff,
} from "lucide-react";
import { requestTypeLabel, sourceAppLabel } from "@/lib/plannerLabels";

type SyncedClient = {
  id: string;
  source_app: string;
  external_id: string;
  email: string | null;
  full_name: string | null;
  event_date: string | null;
  event_type: string | null;
  venue_location: string | null;
  updated_at: string;
};

type Bundle = {
  music: any[];
  notes: any[];
  playlists: any[];
  timeline: any[];
  addons: any[];
  files: any[];
};

const empty: Bundle = {
  music: [],
  notes: [],
  playlists: [],
  timeline: [],
  addons: [],
  files: [],
};

interface Props {
  profileId: string;
  email: string;
}

const SyncedClientPanel = ({ profileId, email }: Props) => {
  const [clients, setClients] = useState<SyncedClient[]>([]);
  const [data, setData] = useState<Bundle>(empty);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: linked } = await supabase
      .from("synced_clients")
      .select("*")
      .or(`profile_id.eq.${profileId},email.eq.${email.toLowerCase()}`)
      .order("updated_at", { ascending: false });

    const list = (linked ?? []) as SyncedClient[];
    setClients(list);

    if (list.length === 0) {
      setData(empty);
      setLoading(false);
      return;
    }

    const ids = list.map((c) => c.id);
    const [music, notes, playlists, timeline, addons, files] = await Promise.all([
      supabase.from("synced_music").select("*").in("synced_client_id", ids),
      supabase.from("synced_notes").select("*").in("synced_client_id", ids),
      supabase.from("synced_playlists").select("*").in("synced_client_id", ids),
      supabase
        .from("synced_timeline")
        .select("*")
        .in("synced_client_id", ids)
        .order("sort_order", { ascending: true }),
      supabase.from("synced_addons").select("*").in("synced_client_id", ids),
      supabase.from("synced_files").select("*").in("synced_client_id", ids),
    ]);

    setData({
      music: music.data ?? [],
      notes: notes.data ?? [],
      playlists: playlists.data ?? [],
      timeline: timeline.data ?? [],
      addons: addons.data ?? [],
      files: files.data ?? [],
    });
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, email]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Loading synced planner data...
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <Card variant="glass">
        <CardContent className="py-8 text-center">
          <CloudOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">
            No planner data synced for this client yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const total =
    data.music.length +
    data.notes.length +
    data.playlists.length +
    data.timeline.length +
    data.addons.length +
    data.files.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {clients.map((c) => (
          <Badge key={c.id} variant="outline" className="text-xs">
            {sourceAppLabel(c.source_app)} · {c.full_name || c.email || c.external_id}
          </Badge>
        ))}
        <span className="text-xs text-muted-foreground">{total} synced items</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Read-only — these details come straight from the client's planner app, so
        edits happen there, not here.
      </p>

      <Tabs defaultValue="music" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1 h-auto">
          <TabsTrigger value="music" className="text-xs">
            <Music className="w-3.5 h-3.5 mr-1" />
            Music ({data.music.length})
          </TabsTrigger>
          <TabsTrigger value="playlists" className="text-xs">
            <ListMusic className="w-3.5 h-3.5 mr-1" />
            Lists ({data.playlists.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs">
            <StickyNote className="w-3.5 h-3.5 mr-1" />
            Notes ({data.notes.length})
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Timeline ({data.timeline.length})
          </TabsTrigger>
          <TabsTrigger value="addons" className="text-xs">
            <PackagePlus className="w-3.5 h-3.5 mr-1" />
            Add-ons ({data.addons.length})
          </TabsTrigger>
          <TabsTrigger value="files" className="text-xs">
            <Paperclip className="w-3.5 h-3.5 mr-1" />
            Files ({data.files.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="music">
          <RowList
            rows={data.music}
            render={(r) => (
              <>
                <p className="font-medium">{r.song_title}</p>
                <p className="text-sm text-muted-foreground">
                  {r.artist || "Unknown artist"} · {requestTypeLabel(r.request_type)}
                </p>
                {r.notes && <p className="text-xs text-primary mt-1">{r.notes}</p>}
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="playlists">
          <RowList
            rows={data.playlists}
            render={(r) => (
              <>
                <p className="font-medium">{r.name || "Playlist"}</p>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline break-all"
                  >
                    {r.url}
                  </a>
                )}
                <p className="text-xs text-muted-foreground">
                  {[r.provider, r.track_count ? `${r.track_count} tracks` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="notes">
          <RowList
            rows={data.notes}
            render={(r) => (
              <>
                <p className="font-medium">{r.title || r.category || "Note"}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {r.body}
                </p>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <RowList
            rows={data.timeline}
            render={(r) => (
              <>
                <p className="font-medium">
                  {r.item_time ? `${r.item_time} — ` : ""}
                  {r.title}
                </p>
                {r.details && (
                  <p className="text-sm text-muted-foreground">{r.details}</p>
                )}
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="addons">
          <RowList
            rows={data.addons}
            render={(r) => (
              <>
                <p className="font-medium">
                  {r.name} {r.quantity > 1 ? `×${r.quantity}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {r.price != null ? `$${Number(r.price).toLocaleString()}` : "—"}
                  {r.notes ? ` · ${r.notes}` : ""}
                </p>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="files">
          <RowList
            rows={data.files}
            render={(r) => (
              <>
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline break-all"
                  >
                    {r.file_name}
                  </a>
                ) : (
                  <p className="font-medium">{r.file_name}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {[r.mime_type, r.file_size ? `${Math.round(Number(r.file_size) / 1024)} KB` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </>
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const RowList = ({
  rows,
  render,
}: {
  rows: any[];
  render: (r: any) => React.ReactNode;
}) => {
  if (rows.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Nothing synced in this category.
      </div>
    );
  }
  return (
    <div className="space-y-2 max-h-72 overflow-y-auto">
      {rows.map((r) => (
        <div
          key={r.id}
          className="p-3 bg-card/30 rounded-md border border-white/5"
        >
          {render(r)}
        </div>
      ))}
    </div>
  );
};

export default SyncedClientPanel;
