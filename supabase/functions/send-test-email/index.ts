// Admin-only test send used by the Email Status dashboard.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { sendTemplateEmailLogged } from "../_shared/transactional-email-templates/send-and-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const { data: allowed, error: roleError } = await admin.rpc(
      "has_admin_area_access",
      { _user_id: userData.user.id },
    );
    if (roleError || !allowed) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const target = body?.target === "admin" ? "admin" : "customer";
    const recipient =
      target === "admin"
        ? "hersky.ott@gmail.com"
        : String(body?.recipientEmail ?? "").trim();

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipient)) {
      return json({ error: "A valid recipient email is required" }, 400);
    }

    const result = await sendTemplateEmailLogged(
      target === "admin" ? "contest-admin-notification" : "contest-confirmation",
      recipient,
      {
        idempotencyKey: `dns-test-${target}-${Date.now()}`,
        templateData: {
          name: "Test Recipient",
          email: recipient,
          packageName: "DNS Verification Test",
        },
      },
    );

    return json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("send-test-email error", message);
    return json({ error: message }, 500);
  }
});
