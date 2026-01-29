import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Trash2, CreditCard, Mail, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CheckoutPage = () => {
  const { items, eventDetails, updateEventDetails, removeItem, getTotal, getDeposit, clearCart } = useCart();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const etransferEmail = "jacob.herscovitch@gmail.com";
  const total = getTotal();
  const deposit = getDeposit();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(etransferEmail);
    setCopied(true);
    toast({
      title: "Email Copied",
      description: "E-transfer email copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add a package to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!eventDetails.firstName || !eventDetails.lastName || !eventDetails.email || 
        !eventDetails.phone || !eventDetails.eventDate || !eventDetails.eventLocation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Create hidden form and submit to FormSubmit.co
    const form = document.createElement("form");
    form.action = "https://formsubmit.co/hersky.ott@gmail.com";
    form.method = "POST";
    form.target = "_blank";

    const addField = (name: string, value: string) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    // Get package info
    const pkg = items.find(i => i.type === "package");
    const addons = items.filter(i => i.type === "addon");

    addField("_subject", `New Booking Request - ${pkg?.category || "Event"} - ${pkg?.name || "Package"}`);
    addField("_template", "table");
    addField("_captcha", "false");
    
    addField("Customer Name", `${eventDetails.firstName} ${eventDetails.lastName}`);
    addField("Email", eventDetails.email);
    addField("Phone", eventDetails.phone);
    addField("Event Date", eventDetails.eventDate);
    addField("Event Time", eventDetails.eventTime || "TBD");
    addField("Event Location", eventDetails.eventLocation);
    addField("Event Type", eventDetails.eventType || (pkg?.category || "Not specified"));
    
    if (pkg) {
      addField("Package Selected", `${pkg.category} - ${pkg.name} ($${pkg.price})`);
    }
    
    if (addons.length > 0) {
      addField("Add-ons", addons.map(a => `${a.name} ($${a.price})`).join(", "));
    }
    
    addField("Total Amount", `$${total}`);
    addField("Deposit Required (50%)", `$${deposit}`);
    addField("Additional Notes", eventDetails.notes || "None");

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    toast({
      title: "Booking Submitted!",
      description: "Your booking request has been sent. Please send your e-transfer deposit to confirm.",
    });

    setIsSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">Add a package to get started with your booking.</p>
            <Button variant="hero" onClick={() => navigate("/book")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Packages
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="mb-8" onClick={() => navigate("/book")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Packages
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name *</label>
                        <Input
                          required
                          value={eventDetails.firstName}
                          onChange={(e) => updateEventDetails({ firstName: e.target.value })}
                          placeholder="John"
                          className="bg-card/50 border-white/10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name *</label>
                        <Input
                          required
                          value={eventDetails.lastName}
                          onChange={(e) => updateEventDetails({ lastName: e.target.value })}
                          placeholder="Doe"
                          className="bg-card/50 border-white/10"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <Input
                          type="email"
                          required
                          value={eventDetails.email}
                          onChange={(e) => updateEventDetails({ email: e.target.value })}
                          placeholder="john@example.com"
                          className="bg-card/50 border-white/10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone *</label>
                        <Input
                          type="tel"
                          required
                          value={eventDetails.phone}
                          onChange={(e) => updateEventDetails({ phone: e.target.value })}
                          placeholder="(613) 000-0000"
                          className="bg-card/50 border-white/10"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Event Date *</label>
                        <Input
                          type="date"
                          required
                          value={eventDetails.eventDate}
                          onChange={(e) => updateEventDetails({ eventDate: e.target.value })}
                          className="bg-card/50 border-white/10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Event Time</label>
                        <Input
                          type="time"
                          value={eventDetails.eventTime}
                          onChange={(e) => updateEventDetails({ eventTime: e.target.value })}
                          className="bg-card/50 border-white/10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Event Location *</label>
                      <Input
                        required
                        value={eventDetails.eventLocation}
                        onChange={(e) => updateEventDetails({ eventLocation: e.target.value })}
                        placeholder="Venue name and address"
                        className="bg-card/50 border-white/10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Notes</label>
                      <Textarea
                        value={eventDetails.notes}
                        onChange={(e) => updateEventDetails({ notes: e.target.value })}
                        placeholder="Any special requests or details about your event..."
                        rows={4}
                        className="bg-card/50 border-white/10"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      variant="hero" 
                      size="lg" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      {isSubmitting ? "Submitting..." : "Submit Booking Request"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium">
                          {item.type === "package" && item.category && (
                            <span className="text-primary text-sm">{item.category} • </span>
                          )}
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold">${item.price}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Separator className="bg-white/10" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-display">${total}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-primary">Deposit (50%)</span>
                      <span className="font-display font-bold text-primary">${deposit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* E-Transfer Instructions */}
              <Card variant="neon">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    To confirm your booking, please send a <span className="text-primary font-bold">50% deposit (${deposit})</span> via e-transfer to:
                  </p>
                  
                  <div className="bg-card/50 rounded-lg p-4 flex items-center justify-between">
                    <code className="text-primary font-mono text-sm">{etransferEmail}</code>
                    <Button variant="ghost" size="sm" onClick={handleCopyEmail}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Please include your name and event date in the e-transfer message. 
                    Your booking will be confirmed once we receive your deposit.
                  </p>

                  <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-3">
                    <p className="text-xs text-secondary">
                      <strong>Remaining Balance:</strong> ${total - deposit} due on event day
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
