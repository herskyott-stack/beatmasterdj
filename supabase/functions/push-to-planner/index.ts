import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

// Outbound sync: BeatmasterDJ -> Vibe Planner.
// Called by DB triggers (push_client_to_planner / push_music_to_planner) via pg_net
// whenever a client profile or music request changes here. Posts to the Vibe Planner
// receiver endpoint using the same shared PLANNER_SYNC_SECRET. Additive-only contract:
// we send creates/updates, never deletes.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // Only our own database triggers (using the service role key) may invoke this.
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const auth = req.headers.get("Authorization") ?? "";
  if (!serviceKey || auth !== `Bearer ${serviceKey}`) {
    return json({ error: "Unauthorized" }, 401);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const targetUrl = Deno.env.get("VIBE_PLANNER_SYNC_URL");
  const syncSecret = Deno.env.get("PLANNER_SYNC_SECRET");
  if (!targetUrl || !syncSecret) {
    // Outbound sync not configured yet — succeed quietly so client saves never fail.
    return json({ skipped: true, reason: "VIBE_PLANNER_SYNC_URL not configured" });
  }

  // Stamp the origin so the receiver never re-pushes this change back to us
  // (prevents an infinite A<->B sync loop).
  const body = { ...payload, sync_origin: "beatmasterdj" };

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sync-secret": syncSecret,
        "x-sync-source": "beatmasterdj",
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("push-to-planner failed:", res.status, text);
      return json({ error: "Remote sync failed", status: res.status }, 502);
    }
    return json({ success: true });
  } catch (err) {
    console.error("push-to-planner network error:", err);
    return json({ error: "Remote sync unreachable" }, 502);
  }
});
