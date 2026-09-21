import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { sendTemplateEmailLogged } from "../_shared/transactional-email-templates/send-and-log.ts";

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

// Server-side DJ notification. Runs BEFORE the Stripe redirect so the DJ
// always receives the booking details, even if the customer's browser never
// returns to /booking-confirmed. A "PENDING PAYMENT" tag is used; a follow-up
// email from verify-booking-payment confirms once Stripe reports paid.
async function sendDjNotification(
  status: "pending" | "paid",
  payload: Record<string, string>,
  sessionId?: string,
) {
  try {
    const result = await sendTemplateEmailLogged(
      "booking-notification",
      "hersky.ott@gmail.com",
      {
        idempotencyKey: `booking-${status}-${sessionId ?? crypto.randomUUID()}`,
        templateData: { status, sessionId, details: payload },
      },
    );
    return { ok: true, data: result };
  } catch (e) {
    console.error("[CREATE-PAYMENT] Email send failed", e);
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

    const origin = req.headers.get("origin") || "https://beatmasterdj.ca";

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
