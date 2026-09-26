import { Heart, Building2, GraduationCap, Users, Zap, Mic2, Monitor, Sparkles, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import SectionHeader from "@/components/SectionHeader";
import { cn } from "@/lib/utils";

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
  route: string;
  image: string;
  span?: boolean;
}> = [
  {
    icon: Heart,
    title: "Weddings",
    description: "Ceremony to last dance — seamless MC, pro sound, and a dance floor that stays full all night.",
    route: "/packages/weddings",
    image: weddingImg,
    span: true,
  },
  {
    icon: Building2,
    title: "Corporate Events",
    description: "Polished, on-brand entertainment for galas, conferences and holiday parties. Always on time, always professional.",
    route: "/packages/corporate",
    image: corporateLiveImg,
  },
  {
    icon: GraduationCap,
    title: "School Events",
    description: "Age-appropriate music for proms, homecoming, and school functions.",
    route: "/packages/schools",
    image: schoolImg,
  },
  {
    icon: Users,
    title: "Private Events",
    description: "Birthdays, anniversaries and milestones — your playlist, your vibe, zero cheesy DJ clichés.",
    route: "/packages/private",
    image: privateLiveImg,
  },
  {
    icon: Zap,
    title: "EDM Events",
    description: "High-energy electronic dance music for clubs and festival-style parties.",
    route: "/packages/edm",
    image: edmLiveImg,
  },
  {
    icon: Mic2,
    title: "Karaoke",
    description: "Sing your heart out with 2 wireless microphones and projected lyrics on screen.",
    route: "/packages/karaoke",
    image: karaokeImg,
  },
  {
    icon: Monitor,
    title: "AV Production",
    description: "Pro lighting production — DMX-controlled moving heads, pixel bars, laser, and concert-grade sound.",
    route: "/packages/av",
    image: avLiveImg,
  },
  {
    icon: Sparkles,
    title: "DJ Mentorship",
    description: "1-on-1 weekly lessons with a working pro DJ. Hobbyist to Pro Entrepreneur tracks.",
    route: "/mentorship",
    image: mentorshipLiveImg,
  },
];

const ServicesSection = () => {
  const ref = useRevealOnScroll<HTMLElement>();
  return (
    <section ref={ref} id="services" className="py-20 md:py-28 relative overflow-hidden bass-drop">
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeader
          index="01"
          eyebrow="Our Services"
          title="Every event, dialed in"
          sub="From intimate gatherings to large-scale productions, we bring the perfect soundtrack to every occasion."
        />

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto stagger-fade-in">
          {services.map((service) => (
            <Link
              key={service.title}
              to={service.route}
              className={cn("block group", service.span && "lg:col-span-2")}
              aria-label={`${service.title} — view packages`}
            >
              <Card
                variant="glass"
                className="lift-hover h-full overflow-hidden hover:border-primary/40 cursor-pointer"
              >
                {/* Image Section */}
                <div className={cn("relative overflow-hidden", service.span ? "h-52 md:h-64" : "h-44")}>
                  <img
                    src={service.image}
                    alt={`${service.title} DJ services`}
                    loading="lazy"
                    className="w-full h-full object-cover image-zoom"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.06] transition-colors duration-500" />

                  {/* Icon Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/15 backdrop-blur-md flex items-center justify-center group-hover:border-primary/50 transition-colors duration-300">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Hover arrow affordance */}
                  <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-bold text-white mb-2 tracking-tight group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
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
