import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { sendTemplateEmailLogged } from "../_shared/transactional-email-templates/send-and-log.ts";

const ALLOWED_ORIGINS = [
  "https://beatmasterdj.ca",
  "https://www.beatmasterdj.ca",
  "https://beatmasterdj.lovable.app",
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

    const customerEmail = String(session.customer_details?.email ?? md.customer_email ?? "").trim();
    const sendBooking = (recipient: string, keySuffix: string) =>
      sendTemplateEmailLogged("booking-notification", recipient, {
        idempotencyKey: `booking-paid-${session.id}-${keySuffix}`,
        templateData: { status: "paid", sessionId: session.id, details: payload },
      });
    const [adminRes, customerRes] = await Promise.allSettled([
      sendBooking("hersky.ott@gmail.com", "admin"),
      customerEmail ? sendBooking(customerEmail, "customer") : Promise.resolve({ sent: true } as const),
    ]);
    if (adminRes.status === "rejected") console.error("[VERIFY-BOOKING] admin email send failed", adminRes.reason);
    if (customerRes.status === "rejected") console.error("[VERIFY-BOOKING] customer email send failed", customerRes.reason);

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
