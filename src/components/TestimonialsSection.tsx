import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const testimonials = [
  {
    name: "Sarah & Mike Thompson",
    event: "Wedding Reception",
    quote: "Jacob and his team made our wedding unforgettable! The dance floor was packed all night. He read the crowd perfectly and even learned our special song request.",
    rating: 5,
    avatar: "ST",
  },
  {
    name: "David Chen",
    event: "Corporate Gala",
    quote: "We've used Hersky DJ & AV for 3 years running for our company events. Always professional, always on time, and the music selection is always on point.",
    rating: 5,
    avatar: "DC",
  },
  {
    name: "Emily Rodriguez",
    event: "Sweet 16 Party",
    quote: "My daughter's Sweet 16 was absolutely amazing! The lighting effects and music had all the kids dancing. Best party we've ever thrown!",
    rating: 5,
    avatar: "ER",
  },
  {
    name: "Marcus Williams",
    event: "Club Night",
    quote: "As a venue owner, I need DJs who can bring the energy. Hersky DJ & AV consistently delivers incredible EDM sets that keep the crowd coming back.",
    rating: 5,
    avatar: "MW",
  },
  {
    name: "Jennifer & Tom Blake",
    event: "Anniversary Party",
    quote: "From classic hits to modern tracks, they covered every generation at our 25th anniversary. Everyone from grandma to our teenagers loved it!",
    rating: 5,
    avatar: "JB",
  },
  {
    name: "Ottawa High School",
    event: "Prom Night",
    quote: "The students had a blast! Professional setup, age-appropriate music, and the light show was spectacular. Already booked for next year!",
    rating: 5,
    avatar: "OH",
  },
];

const TestimonialsSection = () => {
  const ref = useRevealOnScroll<HTMLElement>();
  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-muted/50 to-background relative overflow-hidden bass-drop">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="font-display text-sm uppercase tracking-widest text-primary mb-4 block">
            Testimonials
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 dj-heading glitch-text">
            <span className="text-foreground">WHAT OUR </span>
            <span className="gradient-text">CLIENTS SAY</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Over 10 years of creating unforgettable moments across Ottawa and beyond
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              variant="glass"
              className="group hover:border-primary/50 transition-all duration-300"
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/40 mb-4" />

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-primary text-primary"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-primary/30">
                    <AvatarFallback className="bg-primary/20 text-primary font-display font-bold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-display font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-primary">{testimonial.event}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
