import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/real/hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-28 md:pt-32 pb-20 md:pb-24">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="DJ Hersky performing live for a packed dance floor"
          className="w-full h-full object-cover ken-burns"
          fetchPriority="high"
        />
        {/* Layered cinematic grade: legibility up top, melt into page at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Eyebrow */}
          <p className="mb-6 animate-fade-in flex items-center justify-center gap-4">
            <span aria-hidden="true" className="inline-block h-px w-10 md:w-16 bg-gradient-to-r from-transparent to-primary/70" />
            <span className="eyebrow">Ottawa DJ &amp; Event Production</span>
            <span aria-hidden="true" className="inline-block h-px w-10 md:w-16 bg-gradient-to-l from-transparent to-primary/70" />
          </p>

          {/* Main Heading */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-8 leading-[0.95] text-white animate-fade-in text-balance" style={{ animationDelay: "0.1s" }}>
            OTTAWA&rsquo;S DJ FOR
            <br />
            <span className="text-primary">PACKED DANCE FLOORS</span>
          </h1>

          {/* Subheading */}
          <p className="text-base md:text-lg text-zinc-300 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in text-balance" style={{ animationDelay: "0.2s" }}>
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
          <dl className="grid grid-cols-3 mt-12 md:mt-16 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "500+", label: "Events Performed" },
              { value: "15+", label: "Years Experience" },
              { value: "97%", label: "Satisfaction Rate" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col text-center min-w-0 px-2 ${i > 0 ? "border-l border-white/10" : ""}`}
              >
                <dt className="order-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2 leading-tight">
                  {stat.label}
                </dt>
                <dd className="order-1 font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tabular-nums">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-3 animate-fade-in" style={{ animationDelay: "0.8s" }} aria-hidden="true">
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
        <span className="block w-px h-10 bg-white/15 overflow-hidden">
          <span className="scroll-cue-line block w-px h-10 bg-primary/80" />
        </span>
      </div>
    </section>
  );
};

export default HeroSection;
