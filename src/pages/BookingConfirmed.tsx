import { useEffect, useState } from "react";
import { CheckCircle, Calendar, Mail, ArrowRight, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { isContestActive } from "@/lib/contest";

const BookingConfirmed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"verifying" | "ok" | "missing">(
    sessionId ? "verifying" : "missing"
  );

  useEffect(() => {
    if (!sessionId) return;

    // The DJ has already been notified server-side (create-payment sent a
    // "PENDING PAYMENT" email before the Stripe redirect). Here we ask the
    // server to verify with Stripe and send a "PAID" follow-up. This does NOT
    // depend on a third-party form endpoint reaching the browser.
    const key = `booking_confirmed_${sessionId}`;
    if (sessionStorage.getItem(key)) {
      setStatus("ok");
      return;
    }

    const raw = sessionStorage.getItem("pending_booking");
    const bookingPayload: Record<string, string> | undefined = raw
      ? (() => { try { return JSON.parse(raw); } catch { return undefined; } })()
      : undefined;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "verify-booking-payment",
          { body: { sessionId, bookingPayload } },
        );
        if (error) throw error;
        if (data?.paid) {
          // Only clear on confirmed success — never in a finally block.
          sessionStorage.setItem(key, "1");
          sessionStorage.removeItem("pending_booking");
          clearCart();
        } else {
          console.warn("Stripe session not paid yet", data);
        }
      } catch (err) {
        // Do NOT mark as submitted. Leave pending_booking intact so a reload
        // can retry. The DJ already has the pending notification from
        // create-payment; the paid follow-up will be retried on next visit.
        console.error("verify-booking-payment failed", err);
      } finally {
        // Show the confirmation UI regardless — Stripe redirected here, so the
        // customer has paid. Retry logic above ensures the DJ email is not lost.
        setStatus("ok");
      }
    })();
  }, [sessionId, clearCart]);

  if (status === "missing") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/20 mb-6">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Payment Not Detected
              </h1>
              <p className="text-muted-foreground mb-8">
                We couldn't confirm your Stripe payment. If you closed the payment
                tab or cancelled, your booking has not been submitted yet. Please
                return to checkout and try again.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" className="w-full sm:w-auto" onClick={() => navigate("/checkout")}>
                  Return to Checkout
                </Button>
                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Confirming your payment…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-primary to-accent">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 dj-heading">
              <span className="text-foreground">BOOKING </span>
              <span className="gradient-text">CONFIRMED!</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Thank you for choosing Beatmaster DJ! Your deposit has been received
              and your booking request has been submitted successfully.
            </p>

            {/* Next Steps Card */}
            <Card variant="glass" className="text-left mb-8">
              <CardContent className="p-8 space-y-6">
                <h2 className="font-display text-xl font-bold text-primary">What Happens Next?</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="font-display font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Deposit Received</p>
                      <p className="text-sm text-muted-foreground">
                        Your 50% deposit has been securely processed by Stripe. A Stripe
                        receipt has been emailed to you.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="font-display font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Confirmation Email</p>
                      <p className="text-sm text-muted-foreground">
                        You'll receive a confirmation email from Beatmaster DJ within 24 hours.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="font-display font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Pre-Event Consultation</p>
                      <p className="text-sm text-muted-foreground">
                        We'll reach out to discuss your music preferences, timeline, and special requests.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card variant="neon" className="mb-8">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Questions? Contact us:</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="tel:6138374488" className="flex items-center gap-2 text-primary hover:underline">
                    <Calendar className="w-4 h-4" />
                    (613) 837-4488
                  </a>
                  <a href="mailto:hersky.ott@gmail.com" className="flex items-center gap-2 text-primary hover:underline">
                    <Mail className="w-4 h-4" />
                    hersky.ott@gmail.com
                  </a>
                </div>
              </CardContent>
            </Card>

            {isContestActive() && (
              <Card variant="glass" className="mb-8 border-primary/30">
                <CardContent className="p-5 flex items-center gap-3 justify-center text-sm">
                  <Sparkles className="w-5 h-5 text-primary shrink-0" />
                  <p>
                    Thanks for your enquiry! If you entered our contest,{" "}
                    <span className="text-primary font-medium">good luck</span> — we're rooting for you!
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Back to Home Button */}
            <Button variant="hero" size="lg" asChild>
              <Link to="/">
                Back to Home
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingConfirmed;
