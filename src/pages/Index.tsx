import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";

import AddonsSection from "@/components/AddonsSection";
import FeaturedGallery from "@/components/home/FeaturedGallery";
import BookingPreview from "@/components/home/BookingPreview";
import GallerySection from "@/components/GallerySection";
import VideoReels from "@/components/home/VideoReels";
import ContestBanner from "@/components/contest/ContestBanner";
import TrustBar from "@/components/home/TrustBar";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import mentorshipImg from "@/assets/real/mentorship.jpg";

const MentorshipTeaser = () => {
  const ref = useRevealOnScroll<HTMLElement>();
  return (
    <section ref={ref} className="py-20 md:py-28 bass-drop">
      <div className="container mx-auto px-4">
        <SectionHeader
          index="08"
          eyebrow="DJ Mentorship"
          title="Go from bedroom DJ to booked & paid"
          sub="Weekly 1-on-1 mentorship with a working pro. Two tracks — bring your own gear or learn on ours — from hobbyist to DJ entrepreneur."
        />
        <div className="max-w-5xl mx-auto overflow-hidden rounded-2xl border border-white/10 bg-card grid md:grid-cols-2">
          <div className="relative min-h-[240px] md:min-h-[320px]">
            <img
              src={mentorshipImg}
              alt="DJ Hersky mentoring on professional DJ gear"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/30" />
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight mb-3 text-balance">
              Learn from someone who actually does this for a living
            </h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8">
              Real technique, real business — bookings, branding, and getting paid. Not YouTube theory.
            </p>
            <div>
              <Button variant="hero" size="lg" asChild>
                <Link to="/mentorship">
                  Explore Programs <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

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
        <VideoReels />
        <TestimonialsSection />

        <MentorshipTeaser />

        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
