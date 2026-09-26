import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";

import AddonsSection from "@/components/AddonsSection";
import FeaturedGallery from "@/components/home/FeaturedGallery";
import BookingPreview from "@/components/home/BookingPreview";
import GallerySection from "@/components/GallerySection";
import ContestBanner from "@/components/contest/ContestBanner";
import TrustBar from "@/components/home/TrustBar";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <ContestBanner />
        <HeroSection />
        <TrustBar />
        <ServicesSection />
        <BookingPreview />
        <FeaturedGallery />

        <AddonsSection />
        <GallerySection />
        <TestimonialsSection />

        {/* Mentorship teaser */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-card border border-white/10 rounded-xl p-6 md:p-10">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="eyebrow mb-2">
                    New • DJ Mentorship
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
                    Go from bedroom DJ to booked &amp; paid
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Weekly 1-on-1 mentorship with a working pro. Two tracks — bring your own gear or learn on ours — from hobbyist to DJ entrepreneur.
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

        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
