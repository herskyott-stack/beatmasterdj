import { Heart, Building2, GraduationCap, Users, Zap, Mic2, Monitor } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

// Import real stock photos
import weddingImg from "@/assets/services/wedding-dj.jpg";
import corporateImg from "@/assets/services/corporate-event.jpg";
import schoolImg from "@/assets/services/school-event.jpg";
import privateImg from "@/assets/services/private-party.jpg";
import edmImg from "@/assets/services/edm-event.jpg";
import karaokeImg from "@/assets/services/karaoke-service.jpg";
import avImg from "@/assets/services/av-service.jpg";

const services = [
  {
    icon: Heart,
    title: "Weddings",
    description: "Make your special day unforgettable with romantic melodies and dance floor hits.",
    color: "text-secondary",
    gradient: "from-secondary/20 to-accent/20",
    route: "/packages/weddings",
    image: weddingImg,
  },
  {
    icon: Building2,
    title: "Corporate Events",
    description: "Professional entertainment for galas, conferences, and company celebrations.",
    color: "text-primary",
    gradient: "from-primary/20 to-accent/20",
    route: "/packages/corporate",
    image: corporateImg,
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
    description: "Birthdays, anniversaries, and celebrations tailored to your taste.",
    color: "text-secondary",
    gradient: "from-secondary/20 to-primary/20",
    route: "/packages/private",
    image: privateImg,
  },
  {
    icon: Zap,
    title: "EDM Events",
    description: "High-energy electronic dance music for clubs and festival-style parties.",
    color: "text-primary",
    gradient: "from-primary/20 to-secondary/20",
    route: "/packages/edm",
    image: edmImg,
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
    description: "Full audio-visual production with LED walls, staging, and professional sound systems.",
    color: "text-secondary",
    gradient: "from-secondary/20 to-accent/20",
    route: "/packages/av",
    image: avImg,
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 relative overflow-hidden">
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
          {services.map((service, index) => (
            <Link
              key={service.title}
              to={service.route}
              className={`block ${index === 4 ? "md:col-span-2 lg:col-span-1" : ""}`}
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
                    <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${service.gradient} backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg`}>
                      <service.icon className={`w-6 h-6 ${service.color}`} />
                    </div>
                  </div>
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
