import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const CONTEST_END = new Date("2026-09-01T23:59:59-04:00");
const FROM = "Jake at BeatMaster DJ <jake@hersky.ca>";
const REPLY_TO = "hersky.ott@gmail.com";
const ADMIN_EMAIL = "hersky.ott@gmail.com";
const SITE = "https://beatmasterdj.ca";

const shell = (bodyHtml: string, unsubUrl: string) => `
<!doctype html><html><body style="margin:0;padding:0;background:#faf7f2;font-family:Georgia,'Times New Roman',serif;color:#2b2b2b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf7f2;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06);">
        <tr><td style="background:#1a1a1a;padding:20px 28px;">
          <div style="font-family:'Playfair Display',Georgia,serif;color:#d4a574;font-size:22px;letter-spacing:.5px;">BeatMaster DJ</div>
          <div style="color:#bbb;font-size:12px;margin-top:2px;">Hersky DJ &amp; AV · Ottawa</div>
        </td></tr>
        <tr><td style="padding:28px;font-size:16px;line-height:1.55;color:#2b2b2b;">${bodyHtml}</td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #eee;font-size:12px;color:#888;line-height:1.5;">
          BeatMaster DJ · Hersky DJ &amp; AV · Ottawa, ON, Canada<br/>
          Questions? Reply to this email or write ${REPLY_TO}.<br/>
          You're receiving this because you entered the BeatMaster DJ giveaway.
          <a href="${unsubUrl}" style="color:#888;text-decoration:underline;">Unsubscribe</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

const firstName = (n: string) => (n || "").trim().split(/\s+/)[0] || "there";

type Ctx = {
  name: string;
  winnerFirstName?: string;
  packageName?: string | null;
  category?: string | null;
};

const templates: Record<string, (c: Ctx) => { subject: string; body: string }> = {
  confirmation: (c) => ({
    subject: "You're officially entered",
    body: `<p>Hi ${esc(firstName(c.name))},</p>
      <p>Thanks for reaching out — you're officially entered to win a free wedding DJ package valued up to $5,000.</p>
      <p>The winner will be announced <strong>September 1st, 2026</strong>.</p>
      <p>Here's a quick overview of what's included in our wedding packages:</p>
      <ul>
        <li>Ceremony audio</li><li>Cocktail hour music</li><li>Reception DJ</li>
        <li>MC services</li><li>Wireless mics</li><li>Dance lighting</li>
        <li>Custom playlists</li><li>Full setup + teardown</li>
      </ul>
      <p>I'll be in touch soon with more details.</p>
      <p>Talk soon,<br/>Jake — BeatMaster DJ</p>`,
  }),
  day_1: (c) => ({
    subject: "Here's what you could win",
    body: `<p>Hi ${esc(firstName(c.name))},</p>
      <p>Just wanted to give you a closer look at what's included in the free wedding DJ package you're entered to win.</p>
      <p>This is a full wedding experience — ceremony, cocktail hour, reception, lighting, MC services, everything.</p>
      <p>Value: <strong>$1,600–$5,000</strong> depending on your setup.</p>
      <p>If you have any questions about your date or venue, reply anytime.</p>
      <p>Cheers,<br/>Jake</p>`,
  }),
  day_3: (c) => ({
    subject: "What other couples say",
    body: `<p>Hi ${esc(firstName(c.name))},</p>
      <p>Thought I'd share a few quick testimonials from couples I've worked with:</p>
      <blockquote style="border-left:3px solid #d4a574;margin:12px 0;padding:6px 14px;color:#555;">
        "BeatMaster DJ made our wedding unforgettable — the dance floor was packed all night."
      </blockquote>
      <blockquote style="border-left:3px solid #d4a574;margin:12px 0;padding:6px 14px;color:#555;">
        "Jake was incredible. Professional, fun, and the music was perfect."
      </blockquote>
      <blockquote style="border-left:3px solid #d4a574;margin:12px 0;padding:6px 14px;color:#555;">
        "Best DJ in Ottawa. Period."
      </blockquote>
      <p>Your wedding could be next.</p>
      <p>Talk soon,<br/>Jake</p>`,
  }),
  day_7: (c) => ({
    subject: "A mix for your wedding night",
    body: `<p>Hi ${esc(firstName(c.name))},</p>
      <p>Here's a sample wedding mix I put together — gives you a feel for the energy I bring to receptions:</p>
      <p><a href="${SITE}" style="color:#d4a574;">Listen to the sample mix</a></p>
      <p>If you want something custom for your wedding, I can build it.</p>
      <p>Catch you soon,<br/>Jake</p>`,
  }),
  day_14: (c) => ({
    subject: "Quick question about your wedding date",
    body: `<p>Hi ${esc(firstName(c.name))},</p>
      <p>Just checking in — are you still finalizing your wedding date and venue?</p>
      <p>I'm booking 2026–2027 weddings now, and dates fill up fast. If you want me to pencil you in while the contest is running, I can do that.</p>
      <p>Let me know,<br/>Jake</p>`,
  }),
  day_21: (c) => ({
    subject: "Here's what most couples ask me",
    body: `<p>Hi ${esc(firstName(c.name))},</p>
      <p>I get a lot of the same questions, so here are quick answers:</p>
      <p><strong>Do you travel?</strong> Yes — Ottawa + 100km radius.<br/>
      <strong>Do you handle ceremony audio?</strong> Absolutely. Wireless mics + music cues.<br/>
      <strong>Do you MC?</strong> Yes — full reception hosting.<br/>
      <strong>Do you take requests?</strong> Of course.</p>
      <p>If you have anything specific in mind, reply anytime.</p>
      <p>Cheers,<br/>Jake</p>`,
  }),
  day_30: (c) => ({
    subject: "Your wedding timeline (free resource)",
    body: `<p>Hi ${esc(firstName(c.name))},</p>
      <p>Here's a free wedding reception timeline template I give to couples:</p>
      <ul style="line-height:1.7;">
        <li>5:00 — Cocktail hour</li>
        <li>6:00 — Grand entrance</li>
        <li>6:15 — Dinner</li>
        <li>7:30 — Speeches</li>
        <li>8:00 — First dances</li>
        <li>8:15 — Dance floor opens</li>
        <li>10:00 — Late-night music</li>
        <li>11:30 — Final songs</li>
      </ul>
      <p>If you want me to customize this for your wedding, I can.</p>
      <p>Talk soon,<br/>Jake</p>`,
  }),
  day_45: (c) => ({
    subject: "Your wedding date might fill soon",
    body: `<p>Hi ${esc(firstName(c.name))},</p>
      <p>Just a heads up — I've had a few inquiries for dates around yours.</p>
      <p>If you want me to hold your date while the contest is running, I can do that at no cost.</p>
      <p>Let me know,<br/>Jake</p>`,
  }),
  winner: (c) => ({
    subject: "And the winner is… you!",
    body: `<p>Hi ${esc(firstName(c.name))},</p>
      <p>Thanks again for entering the BeatMaster DJ wedding giveaway.</p>
      <p><strong>The winner of the free wedding DJ package is: ${esc(c.name)} — that's you!</strong></p>
      <p>Reply to this email within 5 business days and we'll lock in your date.</p>
      <p>Congratulations,<br/>Jake</p>`,
  }),
  loser: (c) => ({
    subject: "And the winner is…",
    body: `<p>Hi ${esc(firstName(c.name))},</p>
      <p>Thanks again for entering the BeatMaster DJ wedding giveaway.</p>
      <p>The winner of the free wedding DJ package is: <strong>${esc(c.winnerFirstName ?? "our lucky winner")}</strong>.</p>
      <p>But I've got something for you — watch your inbox for the next note.</p>
      <p>— Jake</p>`,
  }),
  discount_offer: (c) => ({
    subject: "You didn't win… but I have something for you",
    body: `<p>Hi ${esc(firstName(c.name))},</p>
      <p>You didn't win the free wedding — but here's <strong>$200 off any wedding package if you book by September 30th</strong>.</p>
      <p>This discount applies to:</p>
      <ul>
        <li>Ceremony</li><li>Cocktail hour</li><li>Reception</li>
        <li>MC services</li><li>Lighting</li><li>Custom playlists</li>
      </ul>
      <p>If you want to lock in your date, reply to this email and I'll send over the booking form.</p>
      <p>Talk soon,<br/>Jake</p>`,
  }),
};

type EntryRow = {
  id: string;
  full_name: string;
  email: string;
  contest_id: string;
  unsubscribe_token: string | null;
  unsubscribed_at: string | null;
};

const admin = () => createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const unsubUrl = (token: string | null) =>
  `${SITE}/unsubscribe?token=${encodeURIComponent(token ?? "")}`;

async function sendOne(
  to: string, name: string, templateKey: string, extra: Partial<Ctx>, unsubToken: string | null,
) {
  const tpl = templates[templateKey];
  if (!tpl) throw new Error(`Unknown template: ${templateKey}`);
  const { subject, body } = tpl({ name, ...extra });
  const url = unsubUrl(unsubToken);
  return await resend.emails.send({
    from: FROM,
    to: [to],
    reply_to: REPLY_TO,
    subject,
    html: shell(body, url),
    headers: {
      "List-Unsubscribe": `<mailto:${REPLY_TO}?subject=unsubscribe>, <${url}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}

// Small concurrency limiter
async function pool<T>(items: T[], size: number, fn: (t: T) => Promise<void>) {
  let i = 0;
  const workers = Array(Math.min(size, items.length)).fill(0).map(async () => {
    while (i < items.length) {
      const idx = i++;
      try { await fn(items[idx]); } catch (e) { console.error("send err", e); }
      await new Promise((r) => setTimeout(r, 200));
    }
  });
  await Promise.all(workers);
}

serve(async (req) => {
  const cors = buildCors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const now = new Date();
    const body = await req.json().catch(() => ({}));

    // ─── Winner blast ──────────────────────────────────────────────────────
    if (body.type === "announce_all") {
      const sb = admin();
      const contestId: string | undefined = body.contestId;
      const winnerId: string | undefined = body.winnerId;
      const includeDiscount: boolean = body.includeDiscount !== false;
      if (!contestId || !winnerId) {
        return new Response(JSON.stringify({ error: "contestId and winnerId required" }),
          { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
      }
      const { data: entries } = await sb
        .from("contest_entries")
        .select("id, full_name, email, contest_id, unsubscribe_token, unsubscribed_at, winner_email_sent_at, loser_email_sent_at, discount_email_sent_at")
        .eq("contest_id", contestId);
      const list = (entries as any[] | null) ?? [];
      const winner = list.find((e) => e.id === winnerId);
      if (!winner) {
        return new Response(JSON.stringify({ error: "winner not found" }),
          { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
      }
      const winnerFirst = firstName(winner.full_name);
      let sent = 0, skipped = 0;

      // Winner
      if (!winner.unsubscribed_at && !winner.winner_email_sent_at) {
        await sendOne(winner.email, winner.full_name, "winner", {}, winner.unsubscribe_token);
        await sb.from("contest_entries").update({ winner_email_sent_at: now.toISOString() }).eq("id", winner.id);
        sent++;
      } else skipped++;

      // Non-winners: loser email
      const losers = list.filter((e) => e.id !== winnerId && !e.unsubscribed_at && !e.loser_email_sent_at);
      await pool(losers, 5, async (e) => {
        await sendOne(e.email, e.full_name, "loser", { winnerFirstName: winnerFirst }, e.unsubscribe_token);
        await sb.from("contest_entries").update({ loser_email_sent_at: now.toISOString() }).eq("id", e.id);
        sent++;
      });

      // Non-winners: discount offer
      if (includeDiscount) {
        const discountList = list.filter((e) => e.id !== winnerId && !e.unsubscribed_at && !e.discount_email_sent_at);
        await pool(discountList, 5, async (e) => {
          await sendOne(e.email, e.full_name, "discount_offer", {}, e.unsubscribe_token);
          await sb.from("contest_entries").update({ discount_email_sent_at: now.toISOString() }).eq("id", e.id);
          sent++;
        });
      }
      return new Response(JSON.stringify({ ok: true, sent, skipped, total: list.length }),
        { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ─── Drip cron ─────────────────────────────────────────────────────────
    if (body.type === "run_followups") {
      if (now > CONTEST_END) {
        return new Response(JSON.stringify({ ok: true, skipped: "contest_ended" }),
          { headers: { ...cors, "Content-Type": "application/json" } });
      }
      const sb = admin();
      const steps: { days: number; col: string; tpl: string }[] = [
        { days: 1,  col: "email_day1_sent_at",  tpl: "day_1" },
        { days: 3,  col: "email_day3_sent_at",  tpl: "day_3" },
        { days: 7,  col: "email_day7_sent_at",  tpl: "day_7" },
        { days: 14, col: "email_day14_sent_at", tpl: "day_14" },
        { days: 21, col: "email_day21_sent_at", tpl: "day_21" },
        { days: 30, col: "email_day30_sent_at", tpl: "day_30" },
        { days: 45, col: "email_day45_sent_at", tpl: "day_45" },
      ];
      let totalSent = 0;
      for (const step of steps) {
        const cutoff = new Date(now.getTime() - step.days * 86400_000).toISOString();
        const { data } = await sb
          .from("contest_entries")
          .select("id, full_name, email, unsubscribe_token")
          .is(step.col, null)
          .is("unsubscribed_at", null)
          .eq("is_winner", false)
          .lte("created_at", cutoff)
          .limit(50);
        const rows = (data as any[] | null) ?? [];
        await pool(rows, 5, async (e) => {
          await sendOne(e.email, e.full_name, step.tpl, {}, e.unsubscribe_token);
          await sb.from("contest_entries").update({ [step.col]: now.toISOString() }).eq("id", e.id);
          totalSent++;
        });
      }
      return new Response(JSON.stringify({ ok: true, sent: totalSent }),
        { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ─── Single send (kept for confirmation on entry) ──────────────────────
    const { type, email, name, category, packageName } = body as {
      type: string; email: string; name: string;
      category?: string; packageName?: string;
    };
    if (!type || !email || !name) {
      return new Response(JSON.stringify({ error: "Missing fields" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    if (now > CONTEST_END && !["winner", "loser", "discount_offer"].includes(type)) {
      return new Response(JSON.stringify({ ok: true, skipped: "contest_ended" }),
        { headers: { ...cors, "Content-Type": "application/json" } });
    }
    // Look up unsubscribe token + full entry/inquiry for admin notification
    let unsubToken: string | null = null;
    let entryRow: any = null;
    let inquiryRow: any = null;
    try {
      const sb = admin();
      const { data } = await sb
        .from("contest_entries")
        .select("id, full_name, email, phone, unsubscribe_token, unsubscribed_at, interested_package_category, interested_package_name, interested_package_price, event_inquiry_id, created_at")
        .ilike("email", email).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (data?.unsubscribed_at) {
        return new Response(JSON.stringify({ ok: true, skipped: "unsubscribed" }),
          { headers: { ...cors, "Content-Type": "application/json" } });
      }
      entryRow = data;
      unsubToken = data?.unsubscribe_token ?? null;
      if (data?.event_inquiry_id) {
        const { data: inq } = await sb.from("contest_event_inquiries")
          .select("*").eq("id", data.event_inquiry_id).maybeSingle();
        inquiryRow = inq;
      }
    } catch (e) { console.error("lookup entry", e); }

    const res = await sendOne(email, name, type, { category, packageName }, unsubToken);
    const resendId = (res as any)?.data?.id ?? null;
    const resendErr = (res as any)?.error ?? null;
    if (resendErr) console.error("resend error (entrant)", resendErr);

    // Admin notification on confirmation
    let adminId: string | null = null;
    let adminErr: any = null;
    if (type === "confirmation") {
      const rowsHtml = [
        ["Name", entryRow?.full_name ?? name],
        ["Email", email],
        ["Phone", entryRow?.phone ?? "—"],
        ["Package", `${esc(category ?? entryRow?.interested_package_category ?? "—")} — ${esc(packageName ?? entryRow?.interested_package_name ?? "—")}`],
        ["Price", entryRow?.interested_package_price ? `$${entryRow.interested_package_price}` : "—"],
        ["Event type", inquiryRow?.event_type ?? "—"],
        ["Event date", inquiryRow?.event_date ?? "—"],
        ["Venue", inquiryRow?.venue_location ?? "—"],
        ["Guest count", inquiryRow?.guest_count ?? "—"],
        ["Notes", inquiryRow?.special_requests ?? "—"],
        ["Entry ID", entryRow?.id ?? "—"],
      ].map(([k, v]) => `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;color:#666;">${esc(k)}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;">${esc(v)}</td></tr>`).join("");
      const adminHtml = `<h2 style="font-family:'Playfair Display',Georgia,serif;color:#d4a574;">New Contest Entry</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">${rowsHtml}</table>
        <p style="margin-top:16px;"><a href="${SITE}/admin/contest-signups" style="color:#d4a574;">View in admin dashboard →</a></p>`;
      try {
        const adminRes = await resend.emails.send({
          from: FROM,
          to: [ADMIN_EMAIL],
          reply_to: email,
          subject: `🎉 New contest entry: ${entryRow?.full_name ?? name} (${category ?? "—"} / ${packageName ?? "—"})`,
          html: shell(adminHtml, `${SITE}/admin/contest-signups`),
        });
        adminId = (adminRes as any)?.data?.id ?? null;
        adminErr = (adminRes as any)?.error ?? null;
        if (adminErr) console.error("resend error (admin)", adminErr);
      } catch (e) {
        console.error("admin notify failed", e);
        adminErr = String(e);
      }
    }

    return new Response(JSON.stringify({
      ok: !resendErr,
      entrant: { id: resendId, error: resendErr },
      admin: type === "confirmation" ? { id: adminId, error: adminErr } : undefined,
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("send-contest-email error", err);
    return new Response(JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
