import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import PackagesSection from "@/components/PackagesSection";
import AddonsSection from "@/components/AddonsSection";
import FeaturedGallery from "@/components/home/FeaturedGallery";
import BookingPreview from "@/components/home/BookingPreview";
import GallerySection from "@/components/GallerySection";
import ContestBanner from "@/components/contest/ContestBanner";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <ContestBanner />
        <BookingPreview />
        <ServicesSection />
        <FeaturedGallery />
        <PackagesSection />

        {/* Mentorship teaser */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/15 via-card/60 to-secondary/15 backdrop-blur-xl border border-primary/30 rounded-2xl p-6 md:p-10 shadow-[0_0_40px_hsl(38,85%,55%,0.15)]">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-primary font-display mb-2">
                    New • DJ Mentorship
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">
                    Learn from a working professional DJ
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Two tracks — bring your own gear or learn on ours. Hobbyist to Pro
                    Entrepreneur, weekly 1-on-1 sessions starting at $350/month.
                  </p>
                </div>
                <Button variant="hero" size="lg" asChild className="shrink-0">
                  <Link to="/mentorship">
                    Explore Programs <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <AddonsSection />
        <GallerySection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
