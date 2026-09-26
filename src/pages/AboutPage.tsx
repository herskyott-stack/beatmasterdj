import { Music, Users, Calendar, Award, Heart, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Real photos of DJ Hersky performing
import aboutJakeImg from "@/assets/real/about-jake.jpg";
import aboutCrewImg from "@/assets/real/about-crew.jpg";

const stats = [
  { number: "15+", label: "Years Experience", icon: Calendar },
  { number: "500+", label: "Events Completed", icon: Music },
  { number: "97%", label: "Client Satisfaction", icon: Heart },
  { number: "2+", label: "Pro DJ Team", icon: Users },
];

const teamMembers: Array<{
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  photo: string;
  photoAlt: string;
  credit?: string;
}> = [
  {
    name: "Jake Herscovitch",
    role: "Founder & Master DJ",
    bio: "DJing since the age of 13, Jake founded Beatmaster DJ in 2012 with a vision to bring world-class entertainment to every event. A true master of reading the crowd, he's performed at hundreds of weddings, corporate events, and clubs across Canada.",
    specialties: ["Weddings", "Corporate Events", "EDM"],
    photo: aboutJakeImg,
    photoAlt: "DJ Hersky performing live on stage",
  },
  {
    name: "The Hersky Crew",
    role: "Professional DJ Team",
    bio: "Our handpicked team of professional DJs shares Jake's passion for music and commitment to excellence. Each member brings their unique style while maintaining our signature standard of quality.",
    specialties: ["All Event Types", "Multiple Genres", "Bilingual Services"],
    photo: aboutCrewImg,
    photoAlt: "The Hersky crew live in the DJ booth",
    credit: "@613digitalclicks",
  },
];

const values = [
  {
    icon: Headphones,
    title: "Musical Excellence",
    description: "We stay current with the latest hits while honoring timeless classics. Our extensive music library spans every genre and era.",
  },
  {
    icon: Users,
    title: "Client-Focused",
    description: "Your vision is our priority. We work closely with every client to understand their unique needs and exceed expectations.",
  },
  {
    icon: Award,
    title: "Professional Standards",
    description: "Premium equipment, punctual setup, and polished presentation. We treat every event like it's the most important one.",
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-16 relative overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <p className="eyebrow mb-4">
                Our Story
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
                About Beatmaster DJ
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Since 2012, we've been Ottawa's premier DJ service, bringing energy,
                professionalism, and unforgettable music experiences to 500+ events.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} variant="glass" className="text-center">
                  <CardContent className="p-6">
                    <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <p className="font-display text-4xl font-bold text-white tracking-tight mb-1">
                      {stat.number}
                    </p>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card variant="glass">
                <CardContent className="p-8 md:p-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">
                    Our Journey
                  </h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      Beatmaster DJ was founded in 2012 by Jake Herscovitch, a passionate DJ who
                      believed that every event deserves exceptional entertainment. What started as
                      a one-man operation quickly grew into Ottawa's most trusted DJ service.
                    </p>
                    <p>
                      Over the years, we've assembled a talented team of professional DJs who share
                      our commitment to excellence. From intimate wedding receptions to massive
                      corporate galas, school proms to high-energy club nights – we've done it all.
                    </p>
                    <p>
                      Today, with over 15 years of experience and 500+ successful events
                      under our belt, we continue to innovate and elevate the standard of DJ
                      entertainment in the Ottawa region and beyond.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14 md:mb-20">
              <p className="eyebrow mb-4">The Crew</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Meet the Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-base md:text-lg">
                Our experienced professionals are dedicated to making your event extraordinary
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {teamMembers.map((member, index) => (
                <Card key={index} variant={index === 0 ? "featured" : "glass"} className="transition-all duration-300 hover:border-primary/40 hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-6">
                      <img
                        src={member.photo}
                        alt={member.photoAlt}
                        className="w-full h-full object-cover image-zoom"
                      />
                      {member.credit && (
                        <span className="absolute bottom-2 right-2 text-[10px] text-white/80 bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                          {member.credit}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white tracking-tight mb-2">{member.name}</h3>
                    <p className="text-primary font-display uppercase tracking-wider text-sm mb-4">
                      {member.role}
                    </p>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{member.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((specialty, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold uppercase tracking-wider"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14 md:mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Our Values</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {values.map((value, index) => (
                <Card key={index} variant="glass" className="transition-all duration-300 hover:border-primary/40 hover:-translate-y-1">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white tracking-tight mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <Card className="max-w-3xl mx-auto bg-card border-white/10">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="font-display text-3xl font-bold text-white tracking-tight mb-4">
                  Ready to Work With Us?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Let's create an unforgettable experience for your next event
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/book">Book Now</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/contact">Contact Us</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
