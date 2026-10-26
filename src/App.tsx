import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { FXProvider } from "@/contexts/FXContext";
import { useEffect, lazy, Suspense } from "react";
import { initializeNativeFeatures } from "@/lib/native";
import FXLayer from "@/components/fx/FXLayer";
import Index from "./pages/Index";
import BookingPage from "./pages/BookingPage";
import NotFound from "./pages/NotFound";
import CookieConsent from "./components/CookieConsent";
import ScrollToTop from "./components/ScrollToTop";

// Heavy / rarely-visited pages are code-split so the public pages load fast.
// (The 1.7 MB single bundle was the site's biggest performance risk.)
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const BookingConfirmed = lazy(() => import("./pages/BookingConfirmed"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const PackagesPage = lazy(() => import("./pages/PackagesPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const LessonsAdmin = lazy(() => import("./pages/admin/LessonsAdmin"));
const LessonsRecordStudio = lazy(() => import("./pages/admin/LessonsRecordStudio"));
const Lessons = lazy(() => import("./pages/Lessons"));
const LessonView = lazy(() => import("./pages/LessonView"));
const InstallPage = lazy(() => import("./pages/InstallPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AddonDetailPage = lazy(() => import("./pages/AddonDetailPage"));
const MentorshipPage = lazy(() => import("./pages/MentorshipPage"));
const ProductionPage = lazy(() => import("./pages/ProductionPage"));
const AcademyPage = lazy(() => import("./pages/AcademyPage"));
const EmailStatus = lazy(() => import("./pages/admin/EmailStatus"));
const PaymentsOverview = lazy(() => import("./pages/admin/PaymentsOverview"));
const UnsubscribePage = lazy(() => import("./pages/UnsubscribePage"));
const PricingGuidePage = lazy(() => import("./pages/PricingGuidePage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));

// Per-route document title + meta description (the SPA previously served one
// generic title for every route).
const ROUTE_META: { match: (p: string) => boolean; title: string; description?: string }[] = [
  {
    match: (p) => p === "/book",
    title: "Book Your Event — Beatmaster DJ · Ottawa DJ for Weddings & Events",
    description:
      "Book DJ Hersky (Beatmaster DJ) for your wedding, corporate or private event in Ottawa. Packages from $1,800, 500+ events, 15+ years. Check your date today.",
  },
  {
    match: (p) => p.startsWith("/packages"),
    title: "DJ Packages & Prices — Beatmaster DJ Ottawa",
    description:
      "Wedding DJ packages from $1,800 (Essential, reception only) to $5,000, corporate packages, and more — Ottawa's Beatmaster DJ, DJ Hersky. Ceremony coverage starts with Classic.",
  },
  {
    match: (p) => p === "/contact",
    title: "Contact — Beatmaster DJ Ottawa",
    description:
      "Get a personalized quote within 24 hours. Call (613) 837-4488 or send an inquiry — weddings, corporate, private parties, EDM and karaoke across Ottawa–Gatineau.",
  },
  {
    match: (p) => p === "/production",
    title: "Event Production — Beatmaster DJ Ottawa",
    description:
      "Full event production: sound, lighting, staging and DJ services for corporate and large events in Ottawa, from Beatmaster DJ.",
  },
  {
    match: (p) => p === "/mentorship",
    title: "DJ Mentorship — Beatmaster DJ Academy",
    description:
      "1-on-1 DJ mentorship with DJ Hersky: go from bedroom DJ to booked and paid. Real technique and real business, weekly sessions in Ottawa or online.",
  },
  {
    match: (p) => p === "/academy" || p.startsWith("/lessons"),
    title: "DJ Academy & Lessons — Beatmaster DJ",
    description:
      "24 modules of step-by-step DJ training from a working pro — DJ lessons with Beatmaster DJ Academy, Ottawa.",
  },
  {
    match: (p) => p === "/pricing-guide",
    title: "Pricing Guide — Beatmaster DJ Ottawa",
    description:
      "What does a wedding or event DJ cost in Ottawa? Get the Beatmaster DJ pricing guide with real package prices and what's included.",
  },
  { match: (p) => p === "/about", title: "About DJ Hersky — Beatmaster DJ Ottawa" },
  { match: (p) => p === "/privacy", title: "Privacy Policy — Beatmaster DJ" },
  { match: (p) => p === "/terms", title: "Terms — Beatmaster DJ" },
  { match: (p) => p === "/cookies", title: "Cookie Policy — Beatmaster DJ" },
  { match: (p) => p === "/auth", title: "Sign In — Beatmaster DJ" },
  { match: (p) => p.startsWith("/admin"), title: "Admin — Beatmaster DJ" },
];

function RouteMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const entry = ROUTE_META.find((r) => r.match(pathname));
    if (entry) {
      document.title = entry.title;
      if (entry.description) {
        let tag = document.querySelector('meta[name="description"]');
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("name", "description");
          document.head.appendChild(tag);
        }
        tag.setAttribute("content", entry.description);
      }
    }
  }, [pathname]);
  return null;
}

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <p className="text-muted-foreground font-display tracking-wider uppercase text-sm">Loading…</p>
  </div>
);

function App() {
  useEffect(() => {
    initializeNativeFeatures();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <FXProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <RouteMeta />
              <FXLayer />
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/book" element={<BookingPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/booking-confirmed" element={<BookingConfirmed />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/packages/:category" element={<PackagesPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/lessons" element={<LessonsAdmin />} />
                  <Route path="/admin/lessons/record" element={<LessonsRecordStudio />} />
                  <Route path="/admin/lessons/record/:lessonId" element={<LessonsRecordStudio />} />
                  <Route path="/lessons" element={<Lessons />} />
                  <Route path="/lessons/:moduleId" element={<LessonView />} />
                  <Route path="/lessons/:moduleId/:lessonId" element={<LessonView />} />
                  <Route path="/install" element={<InstallPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/addons/:addonId" element={<AddonDetailPage />} />
                  <Route path="/mentorship" element={<MentorshipPage />} />
                  <Route path="/production" element={<ProductionPage />} />
                  <Route path="/academy" element={<AcademyPage />} />
                  <Route path="/admin/email-status" element={<EmailStatus />} />
                  <Route path="/admin/payments" element={<PaymentsOverview />} />
                  <Route path="/unsubscribe" element={<UnsubscribePage />} />
                  <Route path="/email-unsubscribe" element={<UnsubscribePage />} />
                  <Route path="/pricing-guide" element={<PricingGuidePage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/cookies" element={<CookiePolicyPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <CookieConsent />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </FXProvider>
    </QueryClientProvider>
  );
}

export default App;
