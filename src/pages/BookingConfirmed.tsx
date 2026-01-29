import { CheckCircle, Calendar, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BookingConfirmed = () => {
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
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">BOOKING </span>
              <span className="gradient-text">CONFIRMED!</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Thank you for choosing Hersky DJ & AV! Your booking request has been submitted successfully.
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
                      <p className="font-medium">Send Your Deposit</p>
                      <p className="text-sm text-muted-foreground">
                        Send your 50% deposit via e-Transfer to <span className="text-primary font-mono">jacob.herscovitch@gmail.com</span> to secure your date.
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
                        You'll receive a confirmation email within 24 hours once we receive your deposit.
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
