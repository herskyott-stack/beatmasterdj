import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAddonById } from "@/data/addons";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

const AddonDetailPage = () => {
  const { addonId } = useParams<{ addonId: string }>();
  const navigate = useNavigate();
  const { addItem, removeItem, isInCart } = useCart();
  const addon = addonId ? getAddonById(addonId) : undefined;

  useEffect(() => {
    if (addon) {
      document.title = `${addon.name} | Beatmaster DJ`;
    }
  }, [addon]);

  if (!addon) {
    return <Navigate to="/" replace />;
  }

  if (addon.customQuoteOnly) {
    return <Navigate to="/contact" replace />;
  }

  const inCart = isInCart(addon.id);
  const Icon = addon.icon;

  const handleToggle = () => {
    if (inCart) {
      removeItem(addon.id);
      toast({
        title: "Add-on Removed",
        description: `${addon.name} removed from your cart`,
      });
    } else {
      addItem({
        id: addon.id,
        type: "addon",
        name: addon.name,
        price: addon.price,
        description: addon.shortDescription,
      });
      toast({
        title: "Add-on Added",
        description: `${addon.name} added to your cart`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-16">
        {/* Back Button */}
        <div className="container mx-auto px-4 mb-6">
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/#addons">
              <ArrowLeft className="w-4 h-4" />
              Back to Add-ons
            </Link>
          </Button>
        </div>

        {/* Hero */}
        <div className="container mx-auto px-4 mb-12">
          <div className="relative h-72 md:h-96 rounded-md overflow-hidden">
            {addon.image ? (
              <img
                src={addon.image}
                alt={addon.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center backdrop-blur-sm">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                {addon.popular && (
                  <span className="px-3 py-1 text-xs font-display uppercase tracking-wider bg-gradient-to-r from-secondary to-accent rounded-full">
                    Popular
                  </span>
                )}
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
                <span className="gradient-text">{addon.name}</span>
              </h1>
              <p className="font-display text-2xl md:text-3xl font-bold text-primary">
                {addon.priceDisplay}
                <span className="ml-2 text-sm text-muted-foreground font-normal">+ 13% tax</span>
              </p>
            </div>
          </div>
        </div>

        {/* Long description */}
        <div className="container mx-auto px-4 mb-12 max-w-4xl">
          <Card variant="glass">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-bold mb-4">Overview</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {addon.longDescription}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What's included + Perfect for */}
        <div className="container mx-auto px-4 mb-12 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="glass">
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  What's Included
                </h2>
                <ul className="space-y-3">
                  {addon.whatsIncluded.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-bold mb-4">Perfect For</h2>
                <ul className="space-y-3">
                  {addon.perfectFor.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technical details */}
        {addon.technicalDetails.length > 0 && (
          <div className="container mx-auto px-4 mb-12 max-w-4xl">
            <Card variant="glass">
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-bold mb-4">
                  Logistics & Technical
                </h2>
                <ul className="space-y-2">
                  {addon.technicalDetails.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-muted-foreground border-l-2 border-primary/40 pl-4"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* FAQ */}
        {addon.faq.length > 0 && (
          <div className="container mx-auto px-4 mb-12 max-w-4xl">
            <h2 className="font-display text-2xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {addon.faq.map((item, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="border border-white/10 rounded-lg bg-card/50 px-4"
                >
                  <AccordionTrigger className="text-left font-display">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* CTA */}
        <div className="container mx-auto px-4 max-w-4xl">
          <Card variant="neon">
            <CardContent className="p-8 text-center">
              <h2 className="font-display text-2xl font-bold mb-2">
                Ready to add {addon.name}?
              </h2>
              <p className="text-muted-foreground mb-6">
                Add it to your booking now or talk to us about combining it with a package.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant={inCart ? "secondary" : "hero"}
                  size="lg"
                  onClick={handleToggle}
                >
                  {inCart ? "Remove from Booking" : "Add to Booking"}
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate("/checkout")}>
                  View Cart & Checkout
                </Button>
                <Button variant="ghost" size="lg" asChild>
                  <Link to="/contact">Ask a Question</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddonDetailPage;
