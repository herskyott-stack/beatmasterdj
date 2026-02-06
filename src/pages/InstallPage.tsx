import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Monitor, Apple, Share, Plus, CheckCircle, ExternalLink, Music } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const InstallPage = () => {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    await installApp();
    setInstalling(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Music className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">GET THE </span>
              <span className="gradient-text">APP</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Install Hersky DJ & AV on your device for the best experience. Access our services anytime, even offline.
            </p>
          </div>

          {/* Installation Status */}
          {isInstalled && (
            <Card className="glass-card max-w-2xl mx-auto mb-8 border-green-500/30">
              <CardContent className="p-6 flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="font-display font-bold text-lg">App Already Installed!</h3>
                  <p className="text-muted-foreground">You can find Hersky DJ on your home screen.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Install Options */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Direct Install (Chrome/Android) */}
            <Card className="glass-card">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-display">Android / Chrome</CardTitle>
                <CardDescription>
                  One-tap install directly from your browser
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isInstallable && !isInstalled ? (
                  <Button 
                    variant="hero" 
                    className="w-full" 
                    onClick={handleInstall}
                    disabled={installing}
                  >
                    <Download className="w-4 h-4" />
                    {installing ? "Installing..." : "Install App"}
                  </Button>
                ) : isInstalled ? (
                  <Button variant="outline" className="w-full" disabled>
                    <CheckCircle className="w-4 h-4" />
                    Installed
                  </Button>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">Open in Chrome browser and look for:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• "Install app" in browser menu</li>
                      <li>• Install icon in address bar</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* iOS Install */}
            <Card className="glass-card">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                  <Apple className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="font-display">iPhone / iPad</CardTitle>
                <CardDescription>
                  Add to Home Screen from Safari
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tap the <Share className="inline w-4 h-4 mx-1" /> Share button
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scroll and tap <Plus className="inline w-4 h-4 mx-1" /> "Add to Home Screen"
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tap "Add" to confirm
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Install */}
            <Card className="glass-card">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                  <Monitor className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="font-display">Desktop</CardTitle>
                <CardDescription>
                  Install as a desktop application
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isInstallable && !isInstalled ? (
                  <Button 
                    variant="hero" 
                    className="w-full" 
                    onClick={handleInstall}
                    disabled={installing}
                  >
                    <Download className="w-4 h-4" />
                    {installing ? "Installing..." : "Install App"}
                  </Button>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">Look for the install icon in your browser's address bar, or:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Chrome: Menu → Install Hersky DJ</li>
                      <li>• Edge: Settings → Apps → Install</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* App Store Links (Coming Soon) */}
          <div className="mt-16 text-center">
            <h2 className="font-display text-2xl font-bold mb-6">
              <span className="gradient-text">NATIVE APPS</span>
              <span className="text-foreground"> COMING SOON</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="glass" size="lg" disabled className="opacity-50">
                <Apple className="w-5 h-5" />
                App Store
              </Button>
              <Button variant="glass" size="lg" disabled className="opacity-50">
                <Smartphone className="w-5 h-5" />
                Google Play
              </Button>
            </div>
            <p className="text-muted-foreground mt-4 text-sm">
              Native iOS and Android apps are in development and will be available soon.
            </p>
          </div>

          {/* Features */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-center mb-8">
              <span className="text-foreground">APP </span>
              <span className="gradient-text">FEATURES</span>
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "⚡", title: "Fast", desc: "Instant loading" },
                { icon: "📱", title: "Native Feel", desc: "Smooth experience" },
                { icon: "📶", title: "Offline", desc: "Works without internet" },
                { icon: "🔔", title: "Updates", desc: "Always current" },
              ].map((feature) => (
                <div key={feature.title} className="glass-card p-4 text-center">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h3 className="font-display font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">Ready to book your event?</p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/book">
                Book Now
                <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InstallPage;
