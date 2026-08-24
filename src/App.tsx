import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { FXProvider } from "@/contexts/FXContext";
import { useEffect } from "react";
import { initializeNativeFeatures } from "@/lib/native";
import FXLayer from "@/components/fx/FXLayer";
import Index from "./pages/Index";
import BookingPage from "./pages/BookingPage";
import CheckoutPage from "./pages/CheckoutPage";
import BookingConfirmed from "./pages/BookingConfirmed";
import AboutPage from "./pages/AboutPage";
import PackagesPage from "./pages/PackagesPage";
import AuthPage from "./pages/AuthPage";
import ClientPortal from "./pages/ClientPortal";
import AdminDashboard from "./pages/AdminDashboard";
import LessonsAdmin from "./pages/admin/LessonsAdmin";
import LessonsRecordStudio from "./pages/admin/LessonsRecordStudio";
import Lessons from "./pages/Lessons";
import LessonView from "./pages/LessonView";
import InstallPage from "./pages/InstallPage";
import ContactPage from "./pages/ContactPage";
import AddonDetailPage from "./pages/AddonDetailPage";
import MentorshipPage from "./pages/MentorshipPage";
import GiveawayPage from "./pages/GiveawayPage";
import GiveawayRulesPage from "./pages/GiveawayRulesPage";
import ContestSignups from "./pages/admin/ContestSignups";
import ContestSettings from "./pages/admin/ContestSettings";
import EmailStatus from "./pages/admin/EmailStatus";
import PaymentsOverview from "./pages/admin/PaymentsOverview";
import UnsubscribePage from "./pages/UnsubscribePage";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </FXProvider>
    </QueryClientProvider>
  );
}

export default App;
