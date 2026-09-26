import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/real/hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-28 md:pt-32 pb-16 md:pb-24">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="DJ Hersky performing live for a packed dance floor"
          className="w-full h-full object-cover ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-background" />
        <span className="absolute bottom-3 right-4 text-[10px] text-white/50 z-10">© LMF</span>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Eyebrow */}
          <p className="eyebrow mb-6 animate-fade-in">
            Ottawa DJ &amp; Event Production
          </p>

          {/* Main Heading */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-8 leading-[0.95] text-white animate-fade-in" style={{ animationDelay: "0.1s" }}>
            OTTAWA&rsquo;S DJ FOR
            <br />
            <span className="text-primary">PACKED DANCE FLOORS</span>
          </h1>

          {/* Subheading */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            500+ events. 15+ years. One packed dance floor. Wedding, corporate and party DJ services across Ottawa — pro sound, lighting and AV included.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/book">
                <Calendar className="w-5 h-5" />
                Book Your Event
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/pricing-guide">
                See Pricing
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 md:gap-8 mt-12 md:mt-16 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "500+", label: "Events Performed" },
              { value: "15+", label: "Years Experience" },
              { value: "97%", label: "Satisfaction Rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center min-w-0">
                <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2 leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
