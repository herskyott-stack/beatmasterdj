import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const CONTEST_END = new Date("2026-09-01T23:59:59-04:00");
const FROM = "Jake <hello@hersky.ca>";

const templates: Record<string, (name: string) => { subject: string; html: string }> = {
  confirmation: (name) => ({
    subject: "You're In! Good Luck 🎉",
    html: `<p>Hi ${esc(name)},</p>
      <p>Thanks for entering the Summer Tech &amp; DJ Giveaway! Your entry is confirmed.</p>
      <p>Good luck — we'll announce the winner soon.</p>
      <p>— Jake</p>`,
  }),
  followup_24h: (name) => ({
    subject: "Here's What You Can Explore While You Wait",
    html: `<p>Hi ${esc(name)},</p>
      <p>While we prepare the contest results, here are some things you might enjoy:</p>
      <ul>
        <li>Tech support services for any device</li>
        <li>Digital learning for beginners &amp; seniors</li>
        <li>DJ mixes and event bookings</li>
      </ul>
      <p>Thanks again for entering — good luck!</p>
      <p>— Jake</p>`,
  }),
  followup_48h: (name) => ({
    subject: "Stay Tuned — Winner Announcement Coming Soon",
    html: `<p>Hi ${esc(name)},</p>
      <p>Just a quick update — the contest is still active and we're excited to reveal the winner soon.</p>
      <p>Thanks for being part of the community! Good luck!</p>
      <p>— Jake</p>`,
  }),
  closing: (name) => ({
    subject: "Contest Closed — Winner Announcement Soon",
    html: `<p>Hi ${esc(name)},</p>
      <p>The contest has officially ended. We're reviewing all entries and will announce the winner shortly.</p>
      <p>Thanks for participating — and good luck!</p>
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
        const t = templates.followup_24h(e.full_name);
        await resend.emails.send({ from: FROM, to: [e.email], subject: t.subject, html: t.html });
        await admin.from("contest_entries").update({ followup_24h_sent_at: now.toISOString() }).eq("id", e.id);
        sent++;
      }
      for (const e of due48 ?? []) {
        const t = templates.followup_48h(e.full_name);
        await resend.emails.send({ from: FROM, to: [e.email], subject: t.subject, html: t.html });
        await admin.from("contest_entries").update({ followup_48h_sent_at: now.toISOString() }).eq("id", e.id);
        sent++;
      }
      return new Response(JSON.stringify({ ok: true, sent }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Single send
    const { type, email, name } = body as { type: string; email: string; name: string };
    if (!type || !email || !name) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (now > CONTEST_END && type !== "closing") {
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
    const { subject, html } = tpl(name);
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
