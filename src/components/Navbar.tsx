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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
            <div className="relative">
              <Music className="w-8 h-8 md:w-10 md:h-10 text-primary transition-all duration-300 group-hover:text-secondary" />
              <div className="absolute inset-0 bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="font-display text-lg xl:text-xl font-bold gradient-text whitespace-nowrap glitch-text">
              HERSKY DJ & AV
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden 2xl:flex items-center gap-4">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="font-display text-xs uppercase tracking-[0.15em] whitespace-nowrap text-zinc-400 hover:text-primary transition-all duration-500 ease-out"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-display text-xs uppercase tracking-[0.15em] whitespace-nowrap text-zinc-400 hover:text-primary transition-all duration-500 ease-out"
                >
                  {link.label}
                </a>
              )
            ))}
            <Button variant="hero" size="default" asChild>
              <Link to="/book">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Buttons */}
          <div className="2xl:hidden flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 border border-primary/40 hover:from-primary/25 hover:to-secondary/25 hover:border-primary/60 hover:shadow-[0_0_12px_hsl(var(--primary)_/_0.25)] transition-all duration-300"
            >
              <Home className="w-4 h-4 text-primary" />
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="2xl:hidden max-h-[calc(100vh-4rem)] overflow-y-auto py-4 border-t border-white/10 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="font-display text-xs uppercase tracking-[0.15em] whitespace-nowrap text-zinc-400 hover:text-primary transition-all duration-500 ease-out py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="font-display text-xs uppercase tracking-[0.15em] whitespace-nowrap text-zinc-400 hover:text-primary transition-all duration-500 ease-out py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 border-t border-white/10 pt-4 font-display text-xs uppercase tracking-[0.15em] text-primary transition-colors hover:text-secondary"
                  onClick={() => setIsOpen(false)}
                >
                  <ShieldCheck className="h-4 w-4" /> Admin Portal
                </Link>
              )}
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
