import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function UnsubscribePage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"idle" | "working" | "done" | "invalid">("idle");
  const [email, setEmail] = useState<string | null>(null);

  const run = async () => {
    if (!token) return setState("invalid");
    setState("working");
    const { data, error } = await supabase
      .from("contest_entries")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", token)
      .select("email")
      .maybeSingle();
    if (error || !data) return setState("invalid");
    setEmail(data.email);
    setState("done");
  };

  // One-click compliance: if browser POSTs (Gmail/Yahoo), auto-run on load
  useEffect(() => {
    if (token) void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <Card variant="glass">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <h1 className="font-display text-2xl">Unsubscribe</h1>
              {state === "invalid" && (
                <p className="text-muted-foreground">
                  This unsubscribe link is invalid or has already been used.
                </p>
              )}
              {state === "working" && <p className="text-muted-foreground">Processing…</p>}
              {state === "done" && (
                <>
                  <p>You've been unsubscribed{email ? ` (${email})` : ""}.</p>
                  <p className="text-sm text-muted-foreground">
                    You won't receive further contest emails from BeatMaster DJ.
                  </p>
                </>
              )}
              {state === "idle" && (
                <Button variant="hero" onClick={run}>Confirm unsubscribe</Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
