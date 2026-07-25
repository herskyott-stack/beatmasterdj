import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Check contest window from settings (source of truth)
    const { data: settings } = await admin
      .from("contest_settings")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (settings) {
      const now = Date.now();
      const start = new Date(settings.start_date).getTime();
      const end = new Date(settings.end_date).getTime();
      const active = settings.auto_stop_enabled
        ? now >= start && now <= end
        : now >= start;
      if (!active) {
        return new Response(JSON.stringify({ error: "Contest has ended" }), {
          status: 410, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json();

    // Bonus update action: scoped to a specific entry + email match; no RLS needed on client
    if (body?.action === "update_bonus") {
      const { entry_id, email: bEmail, bonus } = body ?? {};
      if (typeof entry_id !== "string" || typeof bEmail !== "string" || !bonus) {
        return new Response(JSON.stringify({ error: "Invalid bonus payload" }), {
          status: 400, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      const { data: row } = await admin
        .from("contest_entries").select("id,email").eq("id", entry_id).maybeSingle();
      if (!row || String(row.email).toLowerCase() !== String(bEmail).toLowerCase()) {
        return new Response(JSON.stringify({ error: "Entry not found" }), {
          status: 404, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      const handle = typeof bonus.handle === "string" ? bonus.handle.trim().slice(0, 60) : null;
      const { error: uErr } = await admin.from("contest_entries").update({
        bonus_followed_instagram: !!bonus.followed,
        bonus_shared_story: !!bonus.shared,
        bonus_tagged_account: !!bonus.tagged,
        instagram_handle: handle || null,
      }).eq("id", entry_id);
      if (uErr) {
        return new Response(JSON.stringify({ error: "Could not save bonus info" }), {
          status: 500, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const {
      full_name, email, phone,
      source_page, website, agreed_to_rules,
      inquiry,
    } = body ?? {};


    // Honeypot
    if (typeof website === "string" && website.trim() !== "") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const nameOk = typeof full_name === "string" && full_name.trim().length > 0 && full_name.length <= 120;
    const emailOk = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
    if (!nameOk || !emailOk || agreed_to_rules !== true) {
      return new Response(JSON.stringify({ error: "Invalid submission" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim()
      || req.headers.get("cf-connecting-ip") || "unknown";
    const ip_hash = await sha256(`${ip}:contest`);
    const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();

    // Duplicate email → friendly return with existing entry id
    const { data: existing } = await admin
      .from("contest_entries")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    if (existing?.id) {
      return new Response(JSON.stringify({
        ok: false,
        code: "duplicate_email",
        entry_id: existing.id,
        error: "Looks like you're already entered — good luck!",
      }), {
        status: 200, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // IP throttle: 20/hr (relaxed to reduce false positives during testing/shared IPs)
    const { count: ipCount } = await admin
      .from("contest_entries")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ip_hash)
      .gte("created_at", oneHourAgo);
    if ((ipCount ?? 0) >= 20) {
      return new Response(JSON.stringify({ error: "Too many submissions. Please try again later." }), {
        status: 429, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { data: inserted, error: insertErr } = await admin
      .from("contest_entries")
      .insert({
        full_name: String(full_name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : null,
        contest_id: "beatmasterdj-summer-giveaway",
        source_page: source_page || "giveaway_page",
        agreed_to_rules: true,
        interested_package_category: inquiry?.interested_package_category ?? null,
        interested_package_name: inquiry?.interested_package_name ?? null,
        interested_package_price: inquiry?.interested_package_price ?? null,
        ip_hash,
      })
      .select("id")
      .single();

    if (insertErr || !inserted) {
      console.error("insert entry", insertErr);
      return new Response(JSON.stringify({ error: "Could not save entry" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    let inquiryId: string | null = null;
    if (inquiry && typeof inquiry === "object") {
      const { data: iRow, error: iErr } = await admin
        .from("contest_event_inquiries")
        .insert({
          entry_id: inserted.id,
          event_type: inquiry.event_type ?? null,
          event_date: inquiry.event_date ?? null,
          venue_location: inquiry.venue_location ?? null,
          guest_count: inquiry.guest_count ?? null,
          special_requests: inquiry.special_requests ?? null,
          interested_package_id: inquiry.interested_package_id ?? null,
          interested_package_name: inquiry.interested_package_name ?? null,
          interested_package_category: inquiry.interested_package_category ?? null,
          interested_package_price: inquiry.interested_package_price ?? null,
        })
        .select("id")
        .single();
      if (iErr) console.error("insert inquiry", iErr);
      inquiryId = iRow?.id ?? null;
      if (inquiryId) {
        await admin.from("contest_entries")
          .update({ event_inquiry_id: inquiryId })
          .eq("id", inserted.id);
      }
    }

    const emailPayload = {
      name: String(full_name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : undefined,
      packageName: inquiry?.interested_package_name ?? undefined,
      packageCategory: inquiry?.interested_package_category ?? undefined,
      packagePrice: inquiry?.interested_package_price
        ? `$${Number(inquiry.interested_package_price).toLocaleString("en-CA")} + HST`
        : undefined,
      eventType: inquiry?.event_type ?? undefined,
      eventDate: inquiry?.event_date ?? undefined,
      venue: inquiry?.venue_location ?? undefined,
      guestCount: inquiry?.guest_count ? String(inquiry.guest_count) : undefined,
      notes: inquiry?.special_requests ?? undefined,
    };

    const [customerEmail, adminEmail] = await Promise.allSettled([
      admin.functions.invoke("send-transactional-email", {
        body: {
          templateName: "contest-confirmation",
          recipientEmail: String(email).trim(),
          idempotencyKey: `contest-confirmation-${inserted.id}`,
          templateData: emailPayload,
        },
      }),
      admin.functions.invoke("send-transactional-email", {
        body: {
          templateName: "contest-admin-notification",
          recipientEmail: "hersky.ott@gmail.com",
          idempotencyKey: `contest-admin-notification-${inserted.id}`,
          templateData: emailPayload,
        },
      }),
    ]);

    const emailQueued = [customerEmail, adminEmail].map((result) =>
      result.status === "fulfilled" && !result.value.error
    );
    if (!emailQueued.every(Boolean)) {
      console.error("contest email enqueue incomplete", { emailQueued, entryId: inserted.id });
    }

    return new Response(JSON.stringify({
      ok: true,
      entry_id: inserted.id,
      inquiry_id: inquiryId,
      email_queued: { customer: emailQueued[0], admin: emailQueued[1] },
    }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("submit-contest-entry error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
