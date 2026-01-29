import { Heart, Building2, GraduationCap, Users, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Heart,
    title: "Weddings",
    description: "Make your special day unforgettable with romantic melodies and dance floor hits.",
    color: "text-secondary",
    gradient: "from-secondary/20 to-accent/20",
    route: "/packages/weddings",
  },
  {
    icon: Building2,
    title: "Corporate Events",
    description: "Professional entertainment for galas, conferences, and company celebrations.",
    color: "text-primary",
    gradient: "from-primary/20 to-accent/20",
    route: "/packages/corporate",
  },
  {
    icon: GraduationCap,
    title: "School Events",
    description: "Age-appropriate music for proms, homecoming, and school functions.",
    color: "text-accent",
    gradient: "from-accent/20 to-primary/20",
    route: "/packages/schools",
  },
  {
    icon: Users,
    title: "Private Events",
    description: "Birthdays, anniversaries, and celebrations tailored to your taste.",
    color: "text-secondary",
    gradient: "from-secondary/20 to-primary/20",
    route: "/packages/private",
  },
  {
    icon: Zap,
    title: "EDM Events",
    description: "High-energy electronic dance music for clubs and festival-style parties.",
    color: "text-primary",
    gradient: "from-primary/20 to-secondary/20",
    route: "/packages/edm",
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
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
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
                className="group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_hsl(199,89%,48%,0.2)] h-full"
              >
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${service.gradient} flex items-center justify-center`}>
                      <service.icon className={`w-8 h-8 ${service.color}`} />
                    </div>
                  </div>
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
