import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { FXProvider } from "@/contexts/FXContext";
import { lazy, Suspense, useEffect } from "react";
import { initializeNativeFeatures } from "@/lib/native";
import FXLayer from "@/components/fx/FXLayer";
import Index from "./pages/Index";
const BookingPage = lazy(() => import("./pages/BookingPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const BookingConfirmed = lazy(() => import("./pages/BookingConfirmed"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const PackagesPage = lazy(() => import("./pages/PackagesPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
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
const GiveawayPage = lazy(() => import("./pages/GiveawayPage"));
const GiveawayRulesPage = lazy(() => import("./pages/GiveawayRulesPage"));
const ContestSignups = lazy(() => import("./pages/admin/ContestSignups"));
const ContestSettings = lazy(() => import("./pages/admin/ContestSettings"));
const EmailStatus = lazy(() => import("./pages/admin/EmailStatus"));
const PaymentsOverview = lazy(() => import("./pages/admin/PaymentsOverview"));
const UnsubscribePage = lazy(() => import("./pages/UnsubscribePage"));
const PricingGuidePage = lazy(() => import("./pages/PricingGuidePage"));
const WebDesignPage = lazy(() => import("./pages/WebDesignPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));
import CookieConsent from "./components/CookieConsent";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

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
              <FXLayer />
              {/* Every page except the homepage loads on demand, so visitors
                  don't download the admin, academy and checkout code up front. */}
              <Suspense fallback={<PageLoading />}>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/book" element={<BookingPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/booking-confirmed" element={<BookingConfirmed />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/packages/:category" element={<PackagesPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/client-portal" element={<ClientPortal />} />
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
              <Route path="/giveaway" element={<GiveawayPage />} />
              <Route path="/giveaway/rules" element={<GiveawayRulesPage />} />
              <Route path="/contest" element={<GiveawayPage />} />
              <Route path="/contest-rules" element={<GiveawayRulesPage />} />
              <Route path="/admin/contest" element={<ContestSignups />} />
              <Route path="/admin/contest/settings" element={<ContestSettings />} />
              <Route path="/admin/email-status" element={<EmailStatus />} />
              <Route path="/admin/payments" element={<PaymentsOverview />} />
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
              <Route path="/email-unsubscribe" element={<UnsubscribePage />} />
               <Route path="/pricing-guide" element={<PricingGuidePage />} />
               <Route path="/web-design" element={<WebDesignPage />} />
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
