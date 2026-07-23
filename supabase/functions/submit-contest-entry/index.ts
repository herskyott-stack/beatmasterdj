import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const ALLOWED_ORIGINS = [
  "https://beatmasterdj.lovable.app",
  "https://beatmasterdj.ca",
  "https://www.beatmasterdj.ca",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

const buildCors = (origin: string | null) => ({
  "Access-Control-Allow-Origin":
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Vary": "Origin",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
});

const CONTEST_END = new Date("2026-09-01T23:59:59-04:00");

async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  const cors = buildCors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    if (new Date() > CONTEST_END) {
      return new Response(JSON.stringify({ error: "Contest has ended" }), {
        status: 410, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      full_name, email, phone,
      contest_id, source_page,
      interested_package_category,
      interested_package_name,
      interested_package_price,
      website, // honeypot
    } = body ?? {};

    // Honeypot: bots fill hidden fields
    if (typeof website === "string" && website.trim() !== "") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Basic validation
    const nameOk = typeof full_name === "string" && full_name.trim().length > 0 && full_name.length <= 120;
    const emailOk = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
    const pkgOk = typeof interested_package_category === "string"
      && typeof interested_package_name === "string";
    if (!nameOk || !emailOk || !pkgOk) {
      return new Response(JSON.stringify({ error: "Invalid submission" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Rate limiting
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim()
      || req.headers.get("cf-connecting-ip") || "unknown";
    const ip_hash = await sha256(`${ip}:contest`);
    const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();

    // Duplicate email → block
    const { count: emailCount } = await admin
      .from("contest_entries")
      .select("id", { count: "exact", head: true })
      .ilike("email", email);
    if ((emailCount ?? 0) > 0) {
      return new Response(JSON.stringify({ error: "This email has already been entered." }), {
        status: 409, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // IP → max 3 per hour
    const { count: ipCount } = await admin
      .from("contest_entries")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ip_hash)
      .gte("created_at", oneHourAgo);
    if ((ipCount ?? 0) >= 3) {
      return new Response(JSON.stringify({ error: "Too many submissions. Please try again later." }), {
        status: 429, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { error: insertErr } = await admin.from("contest_entries").insert({
      full_name: String(full_name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : null,
      contest_id: contest_id || "summer-tech-dj-2026",
      source_page: source_page || "contest_page",
      interested_package_category,
      interested_package_name,
      interested_package_price: interested_package_price ?? null,
      ip_hash,
    });
    if (insertErr) {
      console.error("insert error", insertErr);
      return new Response(JSON.stringify({ error: "Could not save entry" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("submit-contest-entry error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
