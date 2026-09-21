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
  const corsHeaders = buildCorsHeaders(req.headers.get("origin"));

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

    const emailClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const templateData = {
      clientName,
      clientEmail,
      eventDate: eventDate ? new Date(eventDate).toLocaleDateString("en-CA") : undefined,
      eventLocation,
      prioritySongs,
      additionalSongs,
      doNotPlaySongs,
    };
    const sendMusic = (recipient: string, keySuffix: string) =>
      sendTemplateEmailLogged("music-submission", recipient, {
        idempotencyKey: `music-submission-${user.id}-${keySuffix}-${Date.now()}`,
        templateData,
      });
    const [adminRes, customerRes] = await Promise.allSettled([
      sendMusic("hersky.ott@gmail.com", "admin"),
      clientEmail ? sendMusic(clientEmail, "customer") : Promise.resolve({ sent: true } as const),
    ]);
    if (adminRes.status === "rejected") { console.error("Admin music email error:", adminRes.reason); throw adminRes.reason; }
    if ((customerRes as any)?.error) console.error("Customer music email error:", (customerRes as any).error);

    console.log("Music notification email queued successfully");

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
