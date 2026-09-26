import { Heart, Building2, GraduationCap, Users, Zap, Mic2, Monitor, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

// Real wedding photo from DJ Hersky's own wedding gigs
import weddingImg from "@/assets/real/weddings/wedding-forest-ceremony.jpg";
// Generic school-crowd photo (stock, not DJ Hersky)
import schoolImg from "@/assets/services/school-event.jpg";
// Real product photo: Denon MCX8000 — the controller behind karaoke nights
import karaokeImg from "@/assets/gear/denon-mcx8000.jpg";

// Real photos of DJ Hersky performing
import privateLiveImg from "@/assets/real/private.jpg";
import edmLiveImg from "@/assets/real/edm.jpg";
// Real product photo: ADJ WMX1 — DJ Hersky's own lighting controller
import avLiveImg from "@/assets/gear/wmx1.webp";
import mentorshipLiveImg from "@/assets/real/mentorship.jpg";

// Real photo: DJ Hersky live at Desert Oasis, Canadian Museum of Nature
import corporateLiveImg from "@/assets/corporate/desert-oasis-3.jpg";

const services: Array<{
  icon: typeof Building2;
  title: string;
  description: string;
  color: string;
  gradient: string;
  route: string;
  image: string;
  credit?: string;
}> = [
  {
    icon: Heart,
    title: "Weddings",
    description: "Ceremony to last dance — seamless MC, pro sound, and a dance floor that stays full all night.",
    color: "text-secondary",
    gradient: "from-secondary/20 to-accent/20",
    route: "/packages/weddings",
    image: weddingImg,
  },
  {
    icon: Building2,
    title: "Corporate Events",
    description: "Polished, on-brand entertainment for galas, conferences and holiday parties. Always on time, always professional.",
    color: "text-primary",
    gradient: "from-primary/20 to-accent/20",
    route: "/packages/corporate",
    image: corporateLiveImg,
    credit: "Tim Skinner © Canadian Museum of Nature",
  },
  {
    icon: GraduationCap,
    title: "School Events",
    description: "Age-appropriate music for proms, homecoming, and school functions.",
    color: "text-accent",
    gradient: "from-accent/20 to-primary/20",
    route: "/packages/schools",
    image: schoolImg,
  },
  {
    icon: Users,
    title: "Private Events",
    description: "Birthdays, anniversaries and milestones — your playlist, your vibe, zero cheesy DJ clichés.",
    color: "text-secondary",
    gradient: "from-secondary/20 to-primary/20",
    route: "/packages/private",
    image: privateLiveImg,
    credit: "© LMF",
  },
  {
    icon: Zap,
    title: "EDM Events",
    description: "High-energy electronic dance music for clubs and festival-style parties.",
    color: "text-primary",
    gradient: "from-primary/20 to-secondary/20",
    route: "/packages/edm",
    image: edmLiveImg,
  },
  {
    icon: Mic2,
    title: "Karaoke",
    description: "Sing your heart out with 2 wireless microphones and projected lyrics on screen.",
    color: "text-accent",
    gradient: "from-accent/20 to-secondary/20",
    route: "/packages/karaoke",
    image: karaokeImg,
  },
  {
    icon: Monitor,
    title: "AV Production",
    description: "Pro lighting production — DMX-controlled moving heads, pixel bars, laser, and concert-grade sound.",
    color: "text-secondary",
    gradient: "from-secondary/20 to-accent/20",
    route: "/packages/av",
    image: avLiveImg,
  },
  {
    icon: Sparkles,
    title: "DJ Mentorship",
    description: "1-on-1 weekly lessons with a working pro DJ. Hobbyist to Pro Entrepreneur tracks.",
    color: "text-primary",
    gradient: "from-primary/20 to-secondary/20",
    route: "/mentorship",
    image: mentorshipLiveImg,
  },
];

const ServicesSection = () => {
  const ref = useRevealOnScroll<HTMLElement>();
  return (
    <section ref={ref} id="services" className="py-24 md:py-32 relative overflow-hidden bass-drop">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 dj-heading glitch-text">
            <span className="text-foreground">OUR </span>
            <span className="gradient-text">SERVICES</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From intimate gatherings to large-scale productions, we bring the perfect soundtrack to every occasion.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service) => (
            <Link
              key={service.title}
              to={service.route}
              className="block"
            >
              <Card
                variant="glass"
                className="group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_hsl(var(--primary)/0.2)] h-full overflow-hidden"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden turntable-hover">
                  <img
                    src={service.image}
                    alt={`${service.title} DJ services`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  
                  {/* Icon Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${service.gradient} backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-none`}>
                      <service.icon className={`w-6 h-6 ${service.color}`} />
                    </div>
                  </div>

                  {/* Photo credit */}
                  {service.credit && (
                    <div className="absolute bottom-4 right-4">
                      <span className="text-[10px] text-white/80 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                        {service.credit}
                      </span>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="font-display text-xl font-bold mb-3 group-hover:gradient-text transition-all duration-300">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
