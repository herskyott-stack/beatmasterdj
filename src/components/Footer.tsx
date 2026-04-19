import { Music } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-white/10 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <Music className="w-8 h-8 text-primary" />
            <span className="font-display text-xl font-bold gradient-text">
              HERSKY DJ & AV
            </span>
          </a>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Hersky DJ & AV. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a href="/mentorship" className="drumpad-link text-sm text-muted-foreground transition-colors">
              Mentorship
            </a>
            <a href="#" className="drumpad-link text-sm text-muted-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="drumpad-link text-sm text-muted-foreground transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
