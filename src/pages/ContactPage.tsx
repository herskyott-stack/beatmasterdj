import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { usePageMeta } from "@/hooks/usePageMeta";

const ContactPage = () => {
  usePageMeta({ title: "Contact | Beatmaster DJ", description: "Questions about your date, packages or add-ons? Contact Beatmaster DJ in Ottawa — replies within 24 hours." });
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-20 md:py-28">
        <ContactSection headingAs="h1" />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
