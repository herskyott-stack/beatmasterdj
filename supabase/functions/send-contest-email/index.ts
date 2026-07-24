import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const STATIC_ORIGINS = new Set([
  "https://beatmasterdj.lovable.app",
  "https://beatmasterdj.ca",
  "https://www.beatmasterdj.ca",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
]);

const isAllowedOrigin = (o: string) =>
  STATIC_ORIGINS.has(o) ||
  /^https:\/\/([a-z0-9-]+\.)*lovableproject\.com$/.test(o) ||
  /^https:\/\/([a-z0-9-]+\.)*lovable\.app$/.test(o);

const buildCors = (origin: string | null) => ({
  "Access-Control-Allow-Origin":
    origin && isAllowedOrigin(origin) ? origin : "https://beatmasterdj.lovable.app",
  "Vary": "Origin",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const CONTEST_END = new Date("2026-09-01T23:59:59-04:00");
const FROM = "Jake <hersky.ott@gmail.com>";

type Ctx = {
  name: string;
  category?: string | null;
  packageName?: string | null;
  packagePrice?: number | null;
  prize?: string | null;
};

const packageLine = (c: Ctx) =>
  c.packageName && c.category
    ? `<p style="color:#666;font-size:14px">You told us you're interested in our <strong>${esc(c.packageName)}</strong> package (${esc(c.category)}).</p>`
    : "";

const templates: Record<string, (c: Ctx) => { subject: string; html: string }> = {
  confirmation: (c) => ({
    subject: "You're In! Good Luck 🎉",
    html: `<p>Hi ${esc(c.name)},</p>
      <p>Thanks for entering the Summer DJ Giveaway! Your entry is confirmed.</p>
      ${packageLine(c)}
      <p>Good luck — we'll announce the winner soon.</p>
      <p>— Jake</p>`,
  }),
  followup_24h: (c) => ({
    subject: "Here's What You Can Explore While You Wait",
    html: `<p>Hi ${esc(c.name)},</p>
      <p>While we prepare the contest results, here are some DJ services you might enjoy:</p>
      <ul>
        <li>Wedding, corporate, school, and private event DJ packages</li>
        <li>Custom playlists and MC services</li>
        <li>Lighting, photo booths, and special effects add-ons</li>
      </ul>
      ${packageLine(c)}
      <p>Thanks again for entering — good luck!</p>
      <p>— Jake</p>`,
  }),
  followup_48h: (c) => ({
    subject: "Stay Tuned — Winner Announcement Coming Soon",
    html: `<p>Hi ${esc(c.name)},</p>
      <p>Just a quick update — the contest is still active and we're excited to reveal the winner soon.</p>
      <p>Thanks for being part of the community! Good luck!</p>
      <p>— Jake</p>`,
  }),
  package_followup: (c) => ({
    subject: `A special offer on our ${esc(c.packageName ?? "featured")} DJ package`,
    html: `<p>Hi ${esc(c.name)},</p>
      <p>Thanks again for entering the contest! Since you mentioned interest in our
        <strong>${esc(c.packageName ?? "featured")}</strong> DJ package${c.category ? ` (${esc(c.category)})` : ""}, I wanted to reach out personally.</p>
      <p>Whether you win or not, I'd love to help make your event unforgettable. Reply to this email
        and I'll put together a custom DJ quote for you.</p>
      <p>— Jake</p>`,
  }),
  closing: (c) => ({
    subject: "Contest Closed — Winner Announcement Soon",
    html: `<p>Hi ${esc(c.name)},</p>
      <p>The contest has officially ended. We're reviewing all entries and will announce the winner shortly.</p>
      <p>Thanks for participating — and good luck!</p>
      <p>— Jake</p>`,
  }),
  winner: (c) => ({
    subject: "🏆 You Won! — Summer DJ Giveaway",
    html: `<p>Hi ${esc(c.name)},</p>
      <p><strong>Congratulations — you're the winner!</strong> 🎉</p>
      <p>You've won: <strong>${esc(c.prize ?? "a free DJ add-on with Jake")}</strong>.</p>
      <p>Reply to this email within 5 business days to claim your prize and we'll schedule a time
        that works for you.</p>
      <p>Thanks for entering — and see you soon!</p>
      <p>— Jake</p>`,
  }),
  loser: (c) => ({
    subject: "Contest Results — Thanks for Entering",
    html: `<p>Hi ${esc(c.name)},</p>
      <p>The winner of the Summer DJ Giveaway has been selected. Unfortunately your name
        wasn't drawn this time — but thank you for entering!</p>
      ${packageLine(c)}
      <p>As a thank-you, reply to this email and I'll share a special rate on your next DJ booking.</p>
      <p>— Jake</p>`,
  }),
};

serve(async (req) => {
  const cors = buildCors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    // Auto-stop: never send if contest is over (except closing email if triggered manually)
    const now = new Date();

    // Two modes: single send (from client) or batch run (cron)
    const body = await req.json().catch(() => ({}));

    if (body.type === "run_followups") {
      // Cron mode — process pending 24h/48h follow-ups
      const { createClient } = await import("npm:@supabase/supabase-js@2.57.2");
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const contestOver = now > CONTEST_END;
      if (contestOver) {
        return new Response(JSON.stringify({ ok: true, skipped: "contest_ended" }), {
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      const twentyFourAgo = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
      const fortyEightAgo = new Date(now.getTime() - 48 * 3600 * 1000).toISOString();

      const { data: due24 } = await admin
        .from("contest_entries")
        .select("id, full_name, email")
        .is("followup_24h_sent_at", null)
        .lte("created_at", twentyFourAgo)
        .limit(50);
      const { data: due48 } = await admin
        .from("contest_entries")
        .select("id, full_name, email")
        .is("followup_48h_sent_at", null)
        .lte("created_at", fortyEightAgo)
        .limit(50);

      let sent = 0;
      for (const e of due24 ?? []) {
        const t = templates.followup_24h({ name: e.full_name });
        await resend.emails.send({ from: FROM, to: [e.email], subject: t.subject, html: t.html });
        await admin.from("contest_entries").update({ followup_24h_sent_at: now.toISOString() }).eq("id", e.id);
        sent++;
      }
      for (const e of due48 ?? []) {
        const t = templates.followup_48h({ name: e.full_name });
        await resend.emails.send({ from: FROM, to: [e.email], subject: t.subject, html: t.html });
        await admin.from("contest_entries").update({ followup_48h_sent_at: now.toISOString() }).eq("id", e.id);
        sent++;
      }
      return new Response(JSON.stringify({ ok: true, sent }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Single send
    const { type, email, name, category, packageName, packagePrice, prize } = body as {
      type: string; email: string; name: string;
      category?: string; packageName?: string; packagePrice?: number; prize?: string;
    };
    if (!type || !email || !name) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (now > CONTEST_END && !["closing", "winner", "loser"].includes(type)) {
      return new Response(JSON.stringify({ ok: true, skipped: "contest_ended" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const tpl = templates[type];
    if (!tpl) {
      return new Response(JSON.stringify({ error: "Unknown template" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const { subject, html } = tpl({ name, category, packageName, packagePrice, prize });
    const res = await resend.emails.send({ from: FROM, to: [email], subject, html });
    return new Response(JSON.stringify({ ok: true, id: res.data?.id }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-contest-email error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
