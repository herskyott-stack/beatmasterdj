import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const ALLOWED_ORIGINS = [
  "https://beatmasterdj.ca",
  "https://www.beatmasterdj.ca",
  "https://beatmasterdj.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

const buildCorsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin":
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Vary": "Origin",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = buildCorsHeaders(req.headers.get("origin"));
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller - must be an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth failed:", authError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify admin role
    const { data: roleData } = await authClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      console.error("Non-admin user attempted to trigger reminders:", user.id);
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Admin authenticated:", user.id);
    console.log("Checking for events 2 weeks from now...");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the date 14 days from now
    const today = new Date();
    const twoWeeksFromNow = new Date(today);
    twoWeeksFromNow.setDate(today.getDate() + 14);
    
    // Format as YYYY-MM-DD
    const targetDate = twoWeeksFromNow.toISOString().split('T')[0];
    console.log("Looking for events on:", targetDate);

    // Find profiles with event_date exactly 14 days from now
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .eq("event_date", targetDate);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      console.log("No events found 2 weeks from now");
      return new Response(
        JSON.stringify({ success: true, message: "No events to remind", count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${profiles.length} event(s) to send reminders for`);

    let sentCount = 0;

    for (const profile of profiles) {
      // Fetch music requests for this user
      const { data: musicRequests } = await supabase
        .from("music_requests")
        .select("*")
        .eq("user_id", profile.user_id);

      const prioritySongs = musicRequests?.filter(r => r.request_type === "priority") || [];
      const additionalSongs = musicRequests?.filter(r => r.request_type === "additional") || [];
      const doNotPlaySongs = musicRequests?.filter(r => r.request_type === "do_not_play") || [];

      const eventDateFormatted = new Date(profile.event_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const templateData = {
        firstName: profile.first_name,
        lastName: profile.last_name,
        eventDate: eventDateFormatted,
        eventLocation: profile.event_location,
        packageName: profile.package_name,
        prioritySongs,
        additionalSongs,
        doNotPlaySongs,
      };
      for (const recipient of [profile.email, "hersky.ott@gmail.com"]) {
        const destination = recipient === profile.email ? "client" : "admin";
        const { error: emailError } = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "event-reminder",
            recipientEmail: recipient,
            idempotencyKey: `event-reminder-${destination}-${profile.user_id}-${targetDate}`,
            templateData,
          },
        });
        if (emailError) console.error(`Failed to queue reminder for ${recipient}:`, emailError);
        else sentCount++;
      }
    }

    console.log(`Successfully sent ${sentCount} reminder(s)`);

    return new Response(
      JSON.stringify({ success: true, message: `Sent ${sentCount} reminder(s)`, count: sentCount }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-event-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
