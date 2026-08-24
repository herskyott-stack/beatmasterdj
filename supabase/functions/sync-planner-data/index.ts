import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-sync-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

type Row = Record<string, unknown>;

interface Payload {
  source_app?: string;
  external_id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  event_date?: string | null;
  event_type?: string | null;
  venue_location?: string | null;
  raw?: Row;
  music?: Row[];
  notes?: Row[];
  playlists?: Row[];
  timeline?: Row[];
  addons?: Row[];
  files?: Row[];
}

const str = (v: unknown) =>
  v === null || v === undefined || v === "" ? null : String(v);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const expected = Deno.env.get("PLANNER_SYNC_SECRET");
  const provided = req.headers.get("x-sync-secret");
  if (!expected || !provided || provided !== expected) {
    return json({ error: "Unauthorized" }, 401);
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!payload?.external_id) {
    return json({ error: "external_id is required" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const sourceApp = payload.source_app || "vibe_planner";
  const email = str(payload.email)?.toLowerCase() ?? null;

  // Match to an existing BeatmasterDJ client by email (never modifies the profile).
  let profileId: string | null = null;
  if (email) {
    const { data: match } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();
    profileId = match?.id ?? null;
  }

  // Upsert only the planner-side mirror record (additive; never touches profiles).
  const { data: client, error: clientErr } = await supabase
    .from("synced_clients")
    .upsert(
      {
        source_app: sourceApp,
        external_id: String(payload.external_id),
        email,
        full_name: str(payload.full_name),
        phone: str(payload.phone),
        event_date: str(payload.event_date),
        event_type: str(payload.event_type),
        venue_location: str(payload.venue_location),
        raw: payload.raw ?? {},
        ...(profileId ? { profile_id: profileId } : {}),
      },
      { onConflict: "source_app,external_id" },
    )
    .select("id, profile_id")
    .single();

  if (clientErr || !client) {
    console.error("synced_clients upsert failed:", clientErr);
    return json({ error: clientErr?.message ?? "Sync failed" }, 500);
  }

  const cid = client.id;
  const counts: Record<string, number> = {};

  // Insert-only with ignoreDuplicates: existing rows are never overwritten or deleted.
  const push = async (
    table: string,
    rows: Row[] | undefined,
    map: (r: Row, i: number) => Row,
  ) => {
    if (!Array.isArray(rows) || rows.length === 0) return;
    const mapped = rows.map((r, i) => ({ synced_client_id: cid, ...map(r, i) }));
    const { error, count } = await supabase
      .from(table)
      .upsert(mapped, {
        onConflict: "synced_client_id,external_id",
        ignoreDuplicates: true,
        count: "exact",
      })
      .select("id");
    if (error) console.error(`${table} sync error:`, error.message);
    counts[table] = count ?? 0;
  };

  await push("synced_music", payload.music, (r, i) => ({
    external_id: str(r.external_id ?? r.id) ?? `music-${i}`,
    request_type: str(r.request_type) ?? "additional",
    song_title: str(r.song_title ?? r.title) ?? "Untitled",
    artist: str(r.artist),
    notes: str(r.notes),
  }));

  await push("synced_notes", payload.notes, (r, i) => ({
    external_id: str(r.external_id ?? r.id) ?? `note-${i}`,
    category: str(r.category),
    title: str(r.title),
    body: str(r.body ?? r.text) ?? "",
  }));

  await push("synced_playlists", payload.playlists, (r, i) => ({
    external_id: str(r.external_id ?? r.id) ?? `playlist-${i}`,
    name: str(r.name),
    provider: str(r.provider),
    url: str(r.url),
    track_count: r.track_count == null ? null : Number(r.track_count),
  }));

  await push("synced_timeline", payload.timeline, (r, i) => ({
    external_id: str(r.external_id ?? r.id) ?? `timeline-${i}`,
    item_time: str(r.item_time ?? r.time),
    sort_order: r.sort_order == null ? i : Number(r.sort_order),
    title: str(r.title) ?? "Untitled",
    details: str(r.details),
  }));

  await push("synced_addons", payload.addons, (r, i) => ({
    external_id: str(r.external_id ?? r.id) ?? `addon-${i}`,
    name: str(r.name) ?? "Add-on",
    quantity: r.quantity == null ? 1 : Number(r.quantity),
    price: r.price == null ? null : Number(r.price),
    notes: str(r.notes),
  }));

  await push("synced_files", payload.files, (r, i) => ({
    external_id: str(r.external_id ?? r.id) ?? `file-${i}`,
    file_name: str(r.file_name ?? r.name) ?? "file",
    url: str(r.url),
    mime_type: str(r.mime_type),
    file_size: r.file_size == null ? null : Number(r.file_size),
  }));

  return json({
    success: true,
    synced_client_id: cid,
    matched_profile_id: client.profile_id,
    inserted: counts,
  });
});
