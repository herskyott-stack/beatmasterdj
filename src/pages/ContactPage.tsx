import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-20 md:py-28">
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
