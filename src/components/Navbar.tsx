import { Home, Menu, X, Music, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAdmin } = useAdminCheck();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the full-screen menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled || isOpen
            ? "bg-background/85 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.8)]"
            : "bg-gradient-to-b from-black/60 to-transparent border-b border-transparent"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 md:gap-3 group shrink-0" onClick={() => setIsOpen(false)}>
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40 transition-colors duration-300">
                <Music className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <span className="font-display text-lg xl:text-xl font-bold text-white whitespace-nowrap tracking-tight">
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
                onClick={() => setIsOpen(false)}
              >
                <Home className="w-4 h-4 text-primary" />
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isOpen}
                className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Full-screen mobile menu */}
      {isOpen && (
        <div className="xl:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl animate-fade-in">
          <div className="h-full overflow-y-auto pt-24 pb-10 px-6 flex flex-col">
            <nav aria-label="Mobile" className="flex flex-col">
              {navLinks.map((link, i) => (
                <div
                  key={link.href}
                  className="menu-link-in border-b border-white/5"
                  style={{ animationDelay: `${0.05 + i * 0.035}s` }}
                >
                  {link.isRoute ? (
                    <Link
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between py-3.5"
                    >
                      <span className="font-display text-2xl font-bold text-white tracking-tight group-active:text-primary transition-colors">
                        {link.label}
                      </span>
                      <ArrowRight className="w-5 h-5 text-primary opacity-0 -translate-x-2 group-active:opacity-100 group-active:translate-x-0 transition-all duration-300" />
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between py-3.5"
                    >
                      <span className="font-display text-2xl font-bold text-white tracking-tight group-active:text-primary transition-colors">
                        {link.label}
                      </span>
                      <ArrowRight className="w-5 h-5 text-primary opacity-0 -translate-x-2 group-active:opacity-100 group-active:translate-x-0 transition-all duration-300" />
                    </a>
                  )}
                </div>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="menu-link-in flex items-center gap-2 py-4 font-display text-sm uppercase tracking-[0.2em] text-primary"
                  style={{ animationDelay: `${0.05 + navLinks.length * 0.035}s` }}
                >
                  <ShieldCheck className="h-4 w-4" /> Admin Portal
                </Link>
              )}
            </nav>
            <div
              className="menu-link-in mt-auto pt-8"
              style={{ animationDelay: `${0.1 + navLinks.length * 0.035}s` }}
            >
              <Button variant="hero" size="lg" className="w-full" asChild>
                <Link to="/book" onClick={() => setIsOpen(false)}>
                  Book Now <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-5 tracking-wide">
                Ottawa · 500+ events · 15+ years
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
