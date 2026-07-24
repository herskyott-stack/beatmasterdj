import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const ALLOWED_ORIGINS = [
  "https://beatmasterdj.lovable.app",
  "https://beatmasterdj.ca",
  "https://www.beatmasterdj.ca",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

const buildCorsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin":
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Vary": "Origin",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Server-side DJ notification. Runs BEFORE the Stripe redirect so the DJ
// always receives the booking details, even if the customer's browser never
// returns to /booking-confirmed. A "PENDING PAYMENT" tag is used; a follow-up
// email from verify-booking-payment confirms once Stripe reports paid.
async function sendDjNotification(
  status: "pending" | "paid",
  payload: Record<string, string>,
  sessionId?: string,
) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("[CREATE-PAYMENT] RESEND_API_KEY missing — cannot email DJ");
    return { ok: false, error: "email_service_unavailable" };
  }
  const label = status === "paid" ? "✅ PAID" : "⏳ PENDING PAYMENT";
  const subject = `${label} — Booking: ${payload["9. Package Category"] || ""} ${payload["10. Package Name"] || ""} · ${payload["1. First Name"] || ""} ${payload["2. Last Name"] || ""}`.trim();

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
        `<tr><td style="padding:6px 10px;border:1px solid #eee;background:#faf7f0;font-weight:600;white-space:nowrap">${esc(
          k,
        )}</td><td style="padding:6px 10px;border:1px solid #eee">${esc(payload[k])}</td></tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111">
      <h2 style="margin:0 0 8px">${esc(label)} — New Booking</h2>
      ${sessionId ? `<p style="margin:0 0 12px;color:#555">Stripe session: <code>${esc(sessionId)}</code></p>` : ""}
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
        from: "Hersky DJ Bookings <bookings@hersky.ca>",
        to: ["hersky.ott@gmail.com"],
        reply_to: payload["3. Email Address"] || undefined,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[CREATE-PAYMENT] Resend error", res.status, text);
      return { ok: false, error: `resend_${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("[CREATE-PAYMENT] Resend threw", e);
    return { ok: false, error: String(e) };
  }
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Guest checkout allowed. If an auth token is present, try to attach the user
    // for record-keeping, but never block payment on it.
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userEmail: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const userClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await userClient.auth.getUser();
        if (user) {
          userId = user.id;
          userEmail = user.email ?? null;
          logStep("Authenticated user attached", { userId });
        }
      } catch (_e) {
        // ignore — proceed as guest
      }
    }

    const { amount, customerEmail, customerName, eventDetails, packageName, bookingPayload } = await req.json();
    logStep("Request parsed", { amount, customerEmail, packageName, hasPayload: !!bookingPayload });

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const email = (customerEmail || userEmail || "").trim();
    if (!email) {
      return new Response(JSON.stringify({ error: "Missing customer email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });
    logStep("Stripe initialized");

    // Reuse existing customer if any (avoid duplicates)
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const newCustomer = await stripe.customers.create({
        email,
        name: customerName || undefined,
        metadata: {
          package: packageName || '',
          event_details: eventDetails || '',
          user_id: userId || '',
        },
      });
      customerId = newCustomer.id;
      logStep("New customer created", { customerId });
    }

    const origin = req.headers.get("origin") || "https://beatmasterdj.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: `DJ Booking Deposit - ${packageName || 'Event'}`,
              description: `50% deposit for ${packageName || 'DJ'} services`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/booking-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        package_name: packageName || '',
        event_details: eventDetails || '',
        customer_name: customerName || '',
        user_id: userId || '',
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    // Fire the DJ notification SERVER-SIDE, before the customer is redirected
    // to Stripe. This guarantees the DJ receives the booking details even if
    // the browser never returns to /booking-confirmed.
    if (bookingPayload && typeof bookingPayload === "object") {
      const enriched: Record<string, string> = { ...bookingPayload };
      enriched["24. Stripe Session ID"] = session.id;
      enriched["25. Payment Status"] = "Pending — customer redirected to Stripe";
      const notif = await sendDjNotification("pending", enriched, session.id);
      logStep("DJ notification (pending) sent", notif);
    } else {
      logStep("WARNING: no bookingPayload received; DJ notification skipped");
    }

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
