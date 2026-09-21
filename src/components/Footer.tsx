import { Music } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-white/10 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <Music className="w-8 h-8 text-primary" />
            <span className="font-display text-xl font-bold gradient-text">
              HERSKY DJ & AV
            </span>
          </Link>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Hersky DJ & AV. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-5">
            <a href="/pricing-guide" className="drumpad-link text-sm text-muted-foreground transition-colors">
              Pricing Guide
            </a>
            <a href="/web-design" className="drumpad-link text-sm text-muted-foreground transition-colors">
              Web Design
            </a>
            <a href="/mentorship" className="drumpad-link text-sm text-muted-foreground transition-colors">
              Mentorship
            </a>
            <Link to="/privacy" className="drumpad-link text-sm text-muted-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="drumpad-link text-sm text-muted-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
