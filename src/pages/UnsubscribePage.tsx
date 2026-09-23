import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Unsubscribes are handled by the one-click link included in every email
// (managed delivery). This page covers older links and the Privacy page link.
export default function UnsubscribePage() {
  const mailto =
    "mailto:hersky.ott@gmail.com?subject=Unsubscribe%20request&body=Please%20unsubscribe%20this%20email%20address%20from%20Beatmaster%20DJ%20emails.";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <Card variant="glass">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <h1 className="font-display text-2xl">Unsubscribe</h1>
              <p className="text-muted-foreground">
                Every email from Beatmaster DJ includes an <strong>Unsubscribe</strong> link at the
                bottom. Click it in any recent email to opt out instantly.
              </p>
              <p className="text-sm text-muted-foreground">
                Clicked an older link, or can't find it? Send us a request and we'll remove you right away.
              </p>
              <Button variant="hero" asChild>
                <a href={mailto}>Request to unsubscribe</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
