import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const ALLOWED_ORIGINS = [
  "https://beatmasterdj.lovable.app",
  "https://beatmasterdj.ca",
  "https://www.beatmasterdj.ca",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin":
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Vary": "Origin",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
});

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

serve(async (req) => {
  const headers = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers });

  try {
    const { sessionId, bookingPayload } = await req.json();
    if (!sessionId || typeof sessionId !== "string") {
      return new Response(JSON.stringify({ error: "Missing sessionId" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";

    if (!paid) {
      return new Response(
        JSON.stringify({ paid: false, status: session.payment_status }),
        { headers: { ...headers, "Content-Type": "application/json" } },
      );
    }

    // Server-side "payment confirmed" follow-up. Idempotent-ish: if the DJ
    // already got a "PENDING" email from create-payment, this one confirms the
    // charge went through. If bookingPayload is missing (e.g. new browser tab),
    // we still send a minimal receipt using the Stripe session metadata so the
    // DJ can reconcile.
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (apiKey) {
      const md = session.metadata ?? {};
      const payload: Record<string, string> =
        bookingPayload && typeof bookingPayload === "object"
          ? { ...bookingPayload }
          : {
              "Package": String(md.package_name ?? ""),
              "Event Details": String(md.event_details ?? ""),
              "Customer": String(md.customer_name ?? ""),
              "Customer Email": String(session.customer_details?.email ?? ""),
            };
      payload["24. Stripe Session ID"] = session.id;
      payload["25. Payment Status"] = `Paid — ${(session.amount_total ?? 0) / 100} ${session.currency?.toUpperCase() ?? ""}`;

      const rows = Object.keys(payload)
        .filter((k) => !k.startsWith("_"))
        .sort((a, b) => {
          const na = parseInt(a.split(".")[0], 10);
          const nb = parseInt(b.split(".")[0], 10);
          if (isNaN(na) || isNaN(nb)) return a.localeCompare(b);
          return na - nb;
        })
        .map(
          (k) =>
            `<tr><td style="padding:6px 10px;border:1px solid #eee;background:#f0f7f0;font-weight:600;white-space:nowrap">${esc(
              k,
            )}</td><td style="padding:6px 10px;border:1px solid #eee">${esc(payload[k])}</td></tr>`,
        )
        .join("");

      const subject = `✅ PAID — Booking confirmed · ${payload["1. First Name"] || payload["Customer"] || ""} ${payload["2. Last Name"] || ""}`.trim();
      const html = `
        <div style="font-family:Arial,sans-serif;color:#111">
          <h2 style="margin:0 0 8px">✅ Booking payment confirmed</h2>
          <p style="margin:0 0 12px;color:#555">Stripe session: <code>${esc(session.id)}</code></p>
          <table style="border-collapse:collapse;border:1px solid #eee">${rows}</table>
        </div>`;

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Hersky DJ & AV <notifications@hersky.ca>",
            to: ["hersky.ott@gmail.com"],
            reply_to: payload["3. Email Address"] || undefined,
            subject,
            html,
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          console.error("[VERIFY-BOOKING] Resend error", res.status, text);
        }
      } catch (e) {
        console.error("[VERIFY-BOOKING] Resend threw", e);
      }
    } else {
      console.error("[VERIFY-BOOKING] RESEND_API_KEY missing");
    }

    return new Response(
      JSON.stringify({
        paid: true,
        amountTotal: session.amount_total,
        currency: session.currency,
      }),
      { headers: { ...headers, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[VERIFY-BOOKING] ERROR", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
});
