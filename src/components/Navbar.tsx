import { Home, Menu, X, Music, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin } = useAdminCheck();

  const navLinks = [
    { href: "/", label: "Home", isRoute: true },
    { href: "#services", label: "Services" },
    { href: "/book", label: "Packages", isRoute: true },
    { href: "#addons", label: "Add-Ons" },
    { href: "/mentorship", label: "Mentorship", isRoute: true },
    { href: "/pricing-guide", label: "Pricing Guide", isRoute: true },
    { href: "/web-design", label: "Web Design", isRoute: true },
    { href: "/giveaway", label: "Giveaway", isRoute: true },
    { href: "/about", label: "About", isRoute: true },
    { href: "/auth", label: "Client Portal", isRoute: true },
    { href: "/install", label: "Get App", isRoute: true },
    { href: "/contact", label: "Contact", isRoute: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40 transition-colors duration-300">
              <Music className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <span className="font-display text-lg xl:text-xl font-bold text-white whitespace-nowrap">
              BEATMASTER DJ
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-4">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="font-display text-xs uppercase tracking-[0.15em] whitespace-nowrap text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-display text-xs uppercase tracking-[0.15em] whitespace-nowrap text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  {link.label}
                </a>
              )
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 font-display text-xs uppercase tracking-[0.15em] whitespace-nowrap text-primary hover:text-primary/80 transition-colors duration-200"
              >
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            )}
            <Button variant="hero" size="default" asChild>
              <Link to="/book">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Buttons */}
          <div className="xl:hidden flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/10 hover:border-primary/40 transition-colors duration-200"
              aria-label="Home"
            >
              <Home className="w-4 h-4 text-primary" />
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="xl:hidden max-h-[calc(100vh-4rem)] overflow-y-auto py-4 border-t border-white/10 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="font-display text-xs uppercase tracking-[0.15em] whitespace-nowrap text-muted-foreground hover:text-primary transition-colors duration-200 py-1.5"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="font-display text-xs uppercase tracking-[0.15em] whitespace-nowrap text-muted-foreground hover:text-primary transition-colors duration-200 py-1.5"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 border-t border-white/10 pt-4 font-display text-xs uppercase tracking-[0.15em] text-primary transition-colors hover:text-primary/80"
                  onClick={() => setIsOpen(false)}
                >
                  <ShieldCheck className="h-4 w-4" /> Admin Portal
                </Link>
              )}
              <Button variant="hero" size="default" className="mt-2" asChild>
                <Link to="/book">Book Now</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
