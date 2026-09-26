import { Music, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-card/40">
      <div className="container mx-auto px-4 py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                BEATMASTER DJ
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Ottawa&rsquo;s high-energy DJ for weddings, corporate events, and EDM nights — pro sound, lighting and AV included.
            </p>
            <a
              href="https://instagram.com/hersky.ott"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center hover:border-primary/50 hover:text-primary text-muted-foreground transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white mb-5">
              Services
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Weddings", href: "/packages/weddings" },
                { label: "Corporate Events", href: "/packages/corporate" },
                { label: "EDM Events", href: "/packages/edm" },
                { label: "Private Events", href: "/packages/private" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { label: "About", href: "/about" },
                { label: "Pricing Guide", href: "/pricing-guide" },
                { label: "Mentorship", href: "/mentorship" },
                { label: "Web Design", href: "/web-design" },
                { label: "Giveaway", href: "/giveaway" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white mb-5">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+16138374488"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  (613) 837-4488
                </a>
              </li>
              <li>
                <a
                  href="mailto:hersky.ott@gmail.com"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  hersky.ott@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                Ottawa, Ontario, Canada
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Beatmaster DJ. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
