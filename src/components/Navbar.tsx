import { Music, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", isRoute: true },
    { href: "#services", label: "Services" },
    { href: "#packages", label: "Packages" },
    { href: "#addons", label: "Add-Ons" },
    { href: "/about", label: "About", isRoute: true },
    { href: "/auth", label: "Client Portal", isRoute: true },
    { href: "/install", label: "Get App", isRoute: true },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Music className="w-10 h-10 text-primary transition-all duration-300 group-hover:text-secondary" />
              <div className="absolute inset-0 bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="font-display text-2xl font-bold gradient-text">
              HERSKY DJ & AV
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="font-display text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-display text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  {link.label}
                </a>
              )
            ))}
            <Button variant="hero" size="default" asChild>
              <Link to="/book">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="font-display text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-300 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="font-display text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-300 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              ))}
              <Button variant="hero" size="default" className="mt-4" asChild>
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
