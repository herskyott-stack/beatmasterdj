import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

      const formatSongList = (songs: any[]) => {
        if (songs.length === 0) return "<p style='color: #666;'>None submitted</p>";
        return songs.map((s, i) => 
          `<li>${s.song_title}${s.artist ? ` <span style="color: #666;">by ${s.artist}</span>` : ""}${s.notes ? ` <em style="color: #8b5cf6;">(${s.notes})</em>` : ""}</li>`
        ).join("");
      };

      const eventDateFormatted = new Date(profile.event_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #8b5cf6, #d946ef); padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; color: white; }
            .header p { margin: 10px 0 0; color: rgba(255,255,255,0.9); }
            .countdown { background: #0a0a0a; padding: 20px; text-align: center; }
            .countdown-number { font-size: 48px; font-weight: bold; color: #8b5cf6; }
            .countdown-label { color: #888; font-size: 14px; }
            .content { padding: 30px; }
            .section { margin-bottom: 25px; }
            .section h2 { color: #8b5cf6; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 8px; }
            .info-grid { display: grid; gap: 10px; }
            .info-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #222; }
            .info-label { color: #888; }
            .info-value { color: #fff; font-weight: 500; }
            ul { list-style: decimal; padding-left: 20px; margin: 0; }
            li { padding: 5px 0; color: #e0e0e0; }
            .cta { text-align: center; padding: 20px; }
            .cta a { display: inline-block; background: linear-gradient(135deg, #8b5cf6, #d946ef); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Your Event is Coming Up!</h1>
              <p>${eventDateFormatted}</p>
            </div>
            <div class="countdown">
              <div class="countdown-number">14</div>
              <div class="countdown-label">days to go!</div>
            </div>
            <div class="content">
              <p style="color: #e0e0e0; margin-bottom: 25px;">
                Hi ${profile.first_name}! We're excited that your special day is almost here. 
                Please review the details below and let us know if anything needs to be updated.
              </p>

              <div class="section">
                <h2>📋 Event Details</h2>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Date:</span>
                    <span class="info-value">${eventDateFormatted}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Location:</span>
                    <span class="info-value">${profile.event_location || 'To be confirmed'}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Package:</span>
                    <span class="info-value">${profile.package_name || 'Standard'}</span>
                  </div>
                </div>
              </div>

              <div class="section">
                <h2>⭐ Priority Songs (${prioritySongs.length})</h2>
                <ul>${formatSongList(prioritySongs)}</ul>
              </div>

              <div class="section">
                <h2>🎶 Additional Songs (${additionalSongs.length})</h2>
                <ul>${formatSongList(additionalSongs)}</ul>
              </div>

              <div class="section">
                <h2>🚫 Do Not Play (${doNotPlaySongs.length})</h2>
                <ul>${formatSongList(doNotPlaySongs)}</ul>
              </div>

              <div class="cta">
                <p style="color: #888; margin-bottom: 15px;">Need to make changes to your music selection?</p>
                <a href="https://beatmasterdj.lovable.app/client-portal">Update Your Playlist</a>
              </div>
            </div>
            <div class="footer">
              <p>Questions? Reply to this email or call us anytime.</p>
              <p>Hersky DJ & AV</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send to both the client and admin
      const recipients = [profile.email, "hersky.ott@gmail.com"];

      const { error: emailError } = await resend.emails.send({
        from: "Hersky DJ & AV <notifications@hersky.ca>",
        to: recipients,
        subject: `🎉 2 Weeks Until Your Event - ${profile.first_name} ${profile.last_name}`,
        html: emailHtml,
      });

      if (emailError) {
        console.error(`Failed to send reminder for ${profile.email}:`, emailError);
      } else {
        console.log(`Reminder sent to ${profile.email} and admin`);
        sentCount++;
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
