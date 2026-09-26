import { Mail, Phone, MapPin, Send, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import SectionHeader from "@/components/SectionHeader";

const inputClasses =
  "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

const ContactSection = () => {
  const ref = useRevealOnScroll<HTMLElement>();
  return (
    <section ref={ref} id="contact" className="py-20 md:py-28 relative overflow-hidden bg-card/40 border-y border-white/5 bass-drop">
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeader
          index="08"
          eyebrow="Get in touch"
          title="Lock in your date"
          sub="Tell us about your event and get a personalized quote within 24 hours. Dates book fast — especially wedding season."
        />

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="p-2">
            <CardContent className="p-6 md:p-8">
              <h3 className="font-display text-2xl font-bold text-white mb-6">Send a Message</h3>
              <form action="https://formsubmit.co/hersky.ott@gmail.com" method="POST" className="space-y-6">
                <input type="hidden" name="_subject" value="New DJ Booking Inquiry!" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_autoresponse" value="Thanks for reaching out to Beatmaster DJ! I got your inquiry and will get back to you within 24 hours. — Jake" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      className={inputClasses}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      className={inputClasses}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    className={inputClasses}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Event Type</label>
                  <select 
                    name="event_type"
                    className={inputClasses}
                    required
                  >
                    <option value="">Select event type or package</option>
                    <optgroup label="Wedding">
                      <option value="Wedding - General Inquiry">Wedding — General Inquiry</option>
                      <option value="Wedding - Essential Package">Wedding — Essential ($1,800)</option>
                      <option value="Wedding - Classic Package">Wedding — Classic ($2,500)</option>
                      <option value="Wedding - Premium Package">Wedding — Premium ($3,500)</option>
                      <option value="Wedding - Ultimate Package">Wedding — Ultimate ($5,000)</option>
                    </optgroup>
                    <optgroup label="Corporate Event">
                      <option value="Corporate - General Inquiry">Corporate — General Inquiry</option>
                      <option value="Corporate - Starter Package">Corporate — Starter ($1,800)</option>
                      <option value="Corporate - Professional Package">Corporate — Professional ($2,800)</option>
                      <option value="Corporate - Executive Package">Corporate — Executive ($3,500)</option>
                      <option value="Corporate - Enterprise Package">Corporate — Enterprise ($5,000)</option>
                    </optgroup>
                    <optgroup label="School Event">
                      <option value="School - General Inquiry">School — General Inquiry</option>
                      <option value="School - Basic Package">School — Basic ($1,200)</option>
                      <option value="School - Standard Package">School — Standard ($1,600)</option>
                      <option value="School - Prom Package">School — Prom ($2,160)</option>
                      <option value="School - Homecoming Package">School — Homecoming ($3,000)</option>
                    </optgroup>
                    <optgroup label="Private Party">
                      <option value="Private - General Inquiry">Private Party — General Inquiry</option>
                      <option value="Private - Party Starter Package">Private — Party Starter ($1,500)</option>
                      <option value="Private - Celebration Package">Private — Celebration ($1,800)</option>
                      <option value="Private - VIP Party Package">Private — VIP Party ($2,500)</option>
                      <option value="Private - Extravaganza Package">Private — Extravaganza ($4,000)</option>
                    </optgroup>
                    <optgroup label="EDM Event">
                      <option value="EDM - General Inquiry">EDM — General Inquiry</option>
                      <option value="EDM - Club Night Package">EDM — Club Night ($1,500)</option>
                      <option value="EDM - Rave Ready Package">EDM — Rave Ready ($2,500)</option>
                      <option value="EDM - Festival Package">EDM — Festival ($4,000)</option>
                      <option value="EDM - Ultra Package">EDM — Ultra ($5,000)</option>
                    </optgroup>
                    <optgroup label="Karaoke">
                      <option value="Karaoke - General Inquiry">Karaoke — General Inquiry</option>
                    </optgroup>
                    <optgroup label="AV Production">
                      <option value="AV Production - General Inquiry">AV Production — General Inquiry</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    name="message"
                    rows={4}
                    className={`${inputClasses} resize-none`}
                    placeholder="Tell us about your event..."
                    required
                  />
                </div>
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  type="submit"
                  formAction="https://formsubmit.co/hersky.ott@gmail.com"
                  formMethod="POST"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-6">Contact Information</h3>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: "Phone", value: "(613) 837-4488", href: "tel:+16138374488" },
                  { icon: Mail, label: "Email", value: "hersky.ott@gmail.com", href: "mailto:hersky.ott@gmail.com" },
                  { icon: MapPin, label: "Location", value: "Ottawa, Ontario, Canada", href: "https://maps.google.com/?q=Ottawa,Ontario,Canada" },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-white/10 hover:border-primary/50 transition-colors duration-300 group lift-hover"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">{item.label}</div>
                      <div className="font-medium text-white">{item.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="font-display text-xl font-bold text-white mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {[
                  { icon: Instagram, href: "https://instagram.com/hersky.ott", label: "Instagram" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-12 h-12 rounded-full bg-card border border-white/10 flex items-center justify-center hover:border-primary/50 transition-colors duration-300 group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <Card className="p-6 border-primary/30">
              <div className="text-center">
                <h4 className="font-display text-lg font-bold text-white mb-2">Quick Response Guarantee</h4>
                <p className="text-muted-foreground text-sm">
                  We respond to all inquiries within 24 hours. Book your consultation today!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
