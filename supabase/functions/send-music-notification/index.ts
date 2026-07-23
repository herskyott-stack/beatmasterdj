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

const buildCorsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin":
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Vary": "Origin",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
});

const escapeHtml = (unsafe: unknown): string =>
  String(unsafe ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

interface MusicNotificationRequest {
  clientName: string;
  clientEmail: string;
  eventDate: string | null;
  eventLocation: string | null;
  prioritySongs: { song_title: string; artist: string | null; notes: string | null }[];
  additionalSongs: { song_title: string; artist: string | null }[];
  doNotPlaySongs: { song_title: string; artist: string | null }[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { createClient } = await import("npm:@supabase/supabase-js@2.57.2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth failed:", authError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    console.log("Authenticated user:", user.id);

    const {
      clientName,
      clientEmail,
      eventDate,
      eventLocation,
      prioritySongs,
      additionalSongs,
      doNotPlaySongs,
    }: MusicNotificationRequest = await req.json();

    console.log("Sending music notification for:", clientName);

    // Format song lists
    const formatSongList = (songs: { song_title: string; artist: string | null; notes?: string | null }[]) => {
      if (songs.length === 0) return "<p style='color: #666;'>None submitted</p>";
      return songs.map((s, i) => 
        `<li>${s.song_title}${s.artist ? ` <span style="color: #666;">by ${s.artist}</span>` : ""}${s.notes ? ` <em style="color: #8b5cf6;">(${s.notes})</em>` : ""}</li>`
      ).join("");
    };

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
          .content { padding: 30px; }
          .section { margin-bottom: 25px; }
          .section h2 { color: #8b5cf6; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 8px; }
          .info-grid { display: grid; gap: 10px; }
          .info-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #222; }
          .info-label { color: #888; }
          .info-value { color: #fff; font-weight: 500; }
          ul { list-style: decimal; padding-left: 20px; margin: 0; }
          li { padding: 5px 0; color: #e0e0e0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎵 Music Playlist Submitted</h1>
          </div>
          <div class="content">
            <div class="section">
              <h2>Client Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${clientName}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${clientEmail}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Event Date:</span>
                  <span class="info-value">${eventDate ? new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Location:</span>
                  <span class="info-value">${eventLocation || 'Not provided'}</span>
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
          </div>
          <div class="footer">
            Hersky DJ & AV • Submitted on ${new Date().toLocaleString()}
          </div>
        </div>
      </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: "Hersky DJ & AV <notifications@hersky.ca>",
      to: ["hersky.ott@gmail.com"],
      subject: `🎵 Music Playlist Submitted - ${clientName}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Music notification email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-music-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
