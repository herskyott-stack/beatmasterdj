import { useState, useRef } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CreditCard, Check, FileText, PenTool, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import BookingAddons from "@/components/BookingAddons";

const CheckoutPage = () => {
  const { items, eventDetails, updateEventDetails, removeItem, getSubtotal, getTax, getTotal, getDeposit, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [contractAgreed, setContractAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [step, setStep] = useState<"addons" | "details" | "contract" | "payment">("addons");

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const deposit = getDeposit();
  const pkg = items.find(i => i.type === "package");
  const addons = items.filter(i => i.type === "addon");

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventDetails.firstName || !eventDetails.lastName || !eventDetails.email || 
        !eventDetails.phone || !eventDetails.eventDate || !eventDetails.eventLocation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setStep("contract");
  };

  const handleContractSign = () => {
    if (!contractAgreed) {
      toast({
        title: "Agreement Required",
        description: "Please read and agree to the contract terms",
        variant: "destructive",
      });
      return;
    }
    
    if (!signature.trim()) {
      toast({
        title: "Signature Required",
        description: "Please type your full name as your signature",
        variant: "destructive",
      });
      return;
    }
    
    setStep("payment");
  };

  const handleFinalSubmit = async () => {
    // Submit booking details via FormSubmit

    // Create hidden form and submit to FormSubmit.co
    const form = document.createElement("form");
    form.action = "https://formsubmit.co/hersky.ott@gmail.com";
    form.method = "POST";
    // No target="_blank" - stays on same page flow

    const addField = (name: string, value: string) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    // Configure FormSubmit - redirect back to site after submission
    addField("_subject", `🎉 NEW BOOKING - ${pkg?.category || "Event"} ${pkg?.name || "Package"} - ${eventDetails.firstName} ${eventDetails.lastName}`);
    addField("_template", "table");
    addField("_captcha", "false");
    addField("_next", window.location.origin + "/booking-confirmed");
    
    // Customer Information
    addField("1. First Name", eventDetails.firstName);
    addField("2. Last Name", eventDetails.lastName);
    addField("3. Email Address", eventDetails.email);
    addField("4. Phone Number", eventDetails.phone);
    
    // Event Details
    addField("5. Event Date", eventDetails.eventDate);
    addField("6. Event Time", eventDetails.eventTime || "TBD");
    addField("7. Event Location", eventDetails.eventLocation);
    addField("8. Event Type", eventDetails.eventType || (pkg?.category || "Not specified"));
    
    // Package Information
    if (pkg) {
      addField("9. Package Category", pkg.category || "N/A");
      addField("10. Package Name", pkg.name);
      addField("11. Package Price", `$${pkg.price}`);
      if (pkg.features && pkg.features.length > 0) {
        addField("12. Package Includes", pkg.features.join(" | "));
      }
    }
    
    // Add-ons
    if (addons.length > 0) {
      addField("13. Add-ons Selected", addons.map(a => `${a.name} ($${a.price})`).join(" | "));
      const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
      addField("14. Add-ons Total", `$${addonsTotal}`);
    } else {
      addField("13. Add-ons Selected", "None");
    }
    
    // Pricing
    addField("15. Subtotal", `$${subtotal.toFixed(2)}`);
    addField("16. HST (13%)", `$${tax.toFixed(2)}`);
    addField("17. Total Amount", `$${total.toFixed(2)}`);
    addField("18. Deposit Required (50%)", `$${deposit.toFixed(2)}`);
    addField("19. Balance Due on Event Day", `$${(total - deposit).toFixed(2)}`);
    
    // Contract
    addField("20. Contract Signed", "Yes");
    addField("21. Digital Signature", signature);
    addField("22. Signature Date", new Date().toLocaleDateString());
    
    // Notes
    addField("23. Customer Notes/Messages", eventDetails.notes || "None provided");

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    toast({
      title: "Booking Confirmed!",
      description: "Your booking has been submitted.",
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-3xl font-bold mb-4">No Package Selected</h1>
            <p className="text-muted-foreground mb-8">Please select a package to proceed with your booking.</p>
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

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className={`flex items-center gap-2 ${step === "addons" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "addons" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"}`}>
                  1
                </div>
                <span className="font-display text-sm hidden sm:block">Add-ons</span>
              </div>
              <div className="w-8 sm:w-12 h-px bg-white/20" />
              <div className={`flex items-center gap-2 ${step === "details" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "details" ? "bg-primary text-primary-foreground" : step === "contract" || step === "payment" ? "bg-primary/20 text-primary" : "bg-muted"}`}>
                  2
                </div>
                <span className="font-display text-sm hidden sm:block">Details</span>
              </div>
              <div className="w-8 sm:w-12 h-px bg-white/20" />
              <div className={`flex items-center gap-2 ${step === "contract" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "contract" ? "bg-primary text-primary-foreground" : step === "payment" ? "bg-primary/20 text-primary" : "bg-muted"}`}>
                  3
                </div>
                <span className="font-display text-sm hidden sm:block">Contract</span>
              </div>
              <div className="w-8 sm:w-12 h-px bg-white/20" />
              <div className={`flex items-center gap-2 ${step === "payment" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "payment" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  4
                </div>
                <span className="font-display text-sm hidden sm:block">Payment</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Step 1: Add-ons */}
              {step === "addons" && (
                <div className="space-y-6">
                  <BookingAddons />
                  <Button variant="hero" size="lg" className="w-full" onClick={() => setStep("details")}>
                    Continue to Event Details
                  </Button>
                </div>
              )}

              {/* Step 2: Event Details */}
              {step === "details" && (
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl flex items-center gap-2">
                      <FileText className="w-6 h-6 text-primary" />
                      Event Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDetailsSubmit} className="space-y-6">
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
                        <label className="block text-sm font-medium mb-2">Additional Notes / Special Requests</label>
                        <Textarea
                          value={eventDetails.notes}
                          onChange={(e) => updateEventDetails({ notes: e.target.value })}
                          placeholder="Any special requests, song preferences, or details about your event..."
                          rows={4}
                          className="bg-card/50 border-white/10"
                        />
                      </div>

                      <Button type="submit" variant="hero" size="lg" className="w-full">
                        Continue to Contract
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Contract */}
              {step === "contract" && (
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl flex items-center gap-2">
                      <FileText className="w-6 h-6 text-primary" />
                      Service Agreement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Contract Content */}
                    <div className="bg-card/30 rounded-lg p-6 max-h-96 overflow-y-auto border border-white/10">
                      <h3 className="font-display text-lg font-bold mb-4 text-primary">HERSKY DJ & AV SERVICES AGREEMENT</h3>
                      
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <p><strong className="text-foreground">Event Details:</strong></p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Client: {eventDetails.firstName} {eventDetails.lastName}</li>
                          <li>Event Date: {eventDetails.eventDate}</li>
                          <li>Event Time: {eventDetails.eventTime || "TBD"}</li>
                          <li>Location: {eventDetails.eventLocation}</li>
                          <li>Package: {pkg?.category} - {pkg?.name} (${pkg?.price})</li>
                          {addons.length > 0 && (
                            <li>Add-ons: {addons.map(a => a.name).join(", ")}</li>
                          )}
                          <li>Total: ${total}</li>
                        </ul>

                        <p className="pt-4"><strong className="text-foreground">1. DEPOSIT & PAYMENT</strong></p>
                        <p>A non-refundable deposit of 50% (${deposit}) is required to secure the booking date. The remaining balance (${total - deposit}) is due on the day of the event, prior to the start of services.</p>

                        <p><strong className="text-foreground">2. CANCELLATION POLICY</strong></p>
                        <p>If the Client cancels the event more than 30 days before the event date, the deposit may be applied to a future booking within 12 months. Cancellations within 30 days of the event date will result in forfeiture of the deposit. If Hersky DJ & AV cancels, a full refund will be provided.</p>

                        <p><strong className="text-foreground">3. EQUIPMENT & SETUP</strong></p>
                        <p>Hersky DJ & AV will provide all necessary equipment as outlined in the selected package. The Client agrees to provide adequate space and access to electrical outlets (standard 110V). Setup will begin approximately 1-2 hours before the event start time.</p>

                        <p><strong className="text-foreground">4. MUSIC & CONTENT</strong></p>
                        <p>The Client may provide song requests and do-not-play lists. Hersky DJ & AV reserves the right to modify selections to maintain appropriate event atmosphere and comply with venue policies.</p>

                        <p><strong className="text-foreground">5. LIABILITY</strong></p>
                        <p>Hersky DJ & AV is not responsible for any injuries or damages caused by guests or third parties. The Client is responsible for ensuring the venue permits amplified music and agrees to indemnify Hersky DJ & AV against any claims arising from the event.</p>

                        <p><strong className="text-foreground">6. FORCE MAJEURE</strong></p>
                        <p>Neither party shall be liable for failure to perform due to circumstances beyond their control, including but not limited to: natural disasters, pandemics, government restrictions, or venue cancellations.</p>

                        <p><strong className="text-foreground">7. OVERTIME</strong></p>
                        <p>If the Client requests DJ services beyond the contracted hours, overtime will be charged at $200 per hour, billed in 30-minute increments.</p>

                        <p className="pt-4"><strong className="text-foreground">8. AGREEMENT</strong></p>
                        <p>By signing below, both parties agree to the terms and conditions outlined in this agreement.</p>
                      </div>
                    </div>

                    {/* Agreement Checkbox */}
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="contract-agree"
                        checked={contractAgreed}
                        onCheckedChange={(checked) => setContractAgreed(checked as boolean)}
                        className="mt-1"
                      />
                      <label htmlFor="contract-agree" className="text-sm cursor-pointer">
                        I have read and agree to the terms and conditions outlined in this service agreement. I understand that the 50% deposit is non-refundable.
                      </label>
                    </div>

                    {/* Signature */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-primary" />
                        Digital Signature (Type your full name)
                      </label>
                      <Input
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        placeholder="Type your full legal name"
                        className="bg-card/50 border-white/10 font-serif text-lg italic"
                      />
                      {signature && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Signed on: {new Date().toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/10">
                      <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
                        Back
                      </Button>
                      <Button variant="hero" size="lg" onClick={handleContractSign} className="flex-1">
                        Sign & Continue to Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Payment */}
              {step === "payment" && (
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-primary" />
                      Payment - 50% Deposit Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Online Payment Option */}
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
                      <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Pay Online with Stripe
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Secure online payment. Pay your <span className="text-primary font-bold">${deposit} deposit</span> instantly with credit card.
                      </p>
                      <Button
                        variant="hero"
                        size="lg"
                        className="w-full"
                        onClick={async () => {
                          setIsProcessingPayment(true);
                          try {
                            const { data, error } = await supabase.functions.invoke('create-payment', {
                              body: {
                                amount: deposit,
                                customerEmail: eventDetails.email,
                                customerName: `${eventDetails.firstName} ${eventDetails.lastName}`,
                                eventDetails: `${eventDetails.eventDate} at ${eventDetails.eventLocation}`,
                                packageName: `${pkg?.category} - ${pkg?.name}`,
                              },
                            });
                            
                            if (error) throw error;
                            if (data?.url) {
                              // Also submit the booking info via form before redirecting
                              handleFinalSubmit();
                              window.open(data.url, '_blank');
                            } else {
                              throw new Error('No checkout URL returned');
                            }
                          } catch (error: any) {
                            console.error('Payment error:', error);
                            toast({
                              title: "Payment Error",
                              description: error.message || "Failed to create payment session. Please try e-transfer instead.",
                              variant: "destructive",
                            });
                          } finally {
                            setIsProcessingPayment(false);
                          }
                        }}
                        disabled={isProcessingPayment}
                      >
                        {isProcessingPayment ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Pay ${deposit} Now
                          </>
                        )}
                      </Button>
                    </div>


                    <Separator className="bg-white/10" />

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Package ({pkg?.name})</span>
                        <span>${pkg?.price}</span>
                      </div>
                      {addons.map(addon => (
                        <div key={addon.id} className="flex justify-between text-muted-foreground">
                          <span>{addon.name}</span>
                          <span>${addon.price}</span>
                        </div>
                      ))}
                      <Separator className="bg-white/10" />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${total}</span>
                      </div>
                      <div className="flex justify-between text-lg text-primary font-bold">
                        <span>Deposit Due Now (50%)</span>
                        <span>${deposit}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Balance Due on Event Day</span>
                        <span>${total - deposit}</span>
                      </div>
                    </div>

                    <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4">
                      <p className="text-sm text-secondary">
                        <strong>Note:</strong> Your booking will be confirmed once we receive your payment. 
                        You will receive a confirmation email within 24 hours.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep("contract")} className="flex-1">
                        Back
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              <Card variant="glass" className="sticky top-24">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pkg && (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-primary text-sm font-medium">{pkg.category}</p>
                          <p className="font-display font-bold text-lg">{pkg.name} Package</p>
                        </div>
                        <span className="font-display font-bold">${pkg.price.toFixed(2)}</span>
                      </div>
                      {pkg.features && (
                        <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                          {pkg.features.slice(0, 4).map((feature, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Check className="w-3 h-3 text-primary" />
                              {feature}
                            </li>
                          ))}
                          {pkg.features.length > 4 && (
                            <li className="text-primary">+ {pkg.features.length - 4} more</li>
                          )}
                        </ul>
                      )}
                    </div>
                  )}

                  {addons.length > 0 && (
                    <>
                      <Separator className="bg-white/10" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Add-ons</p>
                        {addons.map((addon) => (
                          <div key={addon.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{addon.name}</span>
                            <span>${addon.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <Separator className="bg-white/10" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">HST (13%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="font-display">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span className="font-bold">Deposit (50%)</span>
                      <span className="font-display font-bold">${deposit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Balance Due on Event Day</span>
                      <span>${(total - deposit).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card variant="neon">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">Questions about your booking?</p>
                  <p className="font-display text-primary">(613) 837-4488</p>
                  <p className="text-sm text-muted-foreground">hersky.ott@gmail.com</p>
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
