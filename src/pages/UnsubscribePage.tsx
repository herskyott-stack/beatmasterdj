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
  const [state, setState] = useState<"checking" | "idle" | "working" | "done" | "invalid">("checking");

  const run = async () => {
    if (!token) return setState("invalid");
    setState("working");
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
      body: { token },
    });
    if (error || !data?.success) return setState("invalid");
    setState("done");
  };

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    const validate = async () => {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const response = await fetch(
        `${baseUrl}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
        { headers: { apikey: publishableKey } },
      );
      const result = await response.json().catch(() => ({}));
      setState(response.ok && result.valid ? "idle" : "invalid");
    };
    void validate();
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
              {state === "checking" && <p className="text-muted-foreground">Checking your link…</p>}
              {state === "working" && <p className="text-muted-foreground">Processing…</p>}
              {state === "done" && (
                <>
                  <p>You&apos;ve been unsubscribed.</p>
                  <p className="text-sm text-muted-foreground">
                    You won't receive further contest emails from Beatmaster DJ.
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
