import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Layers, PlayCircle, ClipboardCheck, UserRound, CalendarClock } from "lucide-react";

const stats = [
  { icon: Layers, value: "12", label: "Modules" },
  { icon: PlayCircle, value: "144", label: "Lessons" },
  { icon: ClipboardCheck, value: "50", label: "Question Final Exam" },
  { icon: CalendarClock, value: "Monthly", label: "New Module Releases" },
];

const included = [
  "12 modules, 144 lessons",
  "Quizzes plus a 50-question final exam",
  "Presented by Jake's avatar, in his voice",
  "Trailer and first modules available now",
  "Every new module as it releases — monthly",
];

const AcademyPage = () => {
  useEffect(() => {
    document.title = "Beatmaster DJ Academy — Online DJ Course (Early Access) | Beatmaster DJ";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 md:pt-32 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 mb-12 md:mb-20 text-center">
          <Badge className="mb-4 bg-primary/15 border-primary/30 text-primary">
            <Sparkles className="w-3 h-3 mr-1" /> Early Access Now Open
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 gradient-text">
            Beatmaster DJ Academy
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-8">
            A complete DJ course — 12 modules, 144 lessons — presented by Jake's avatar in his
            own voice. The trailer and first modules are available now, and new module videos
            release every month for Early Access members.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/contact">Join Early Access</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/lessons">Browse the lessons</Link>
            </Button>
          </div>
        </section>

        {/* Stats strip */}
        <section className="container mx-auto px-4 mb-16 md:mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center"
              >
                <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-display text-2xl font-bold text-white">{value}</p>
                <p className="text-xs md:text-sm font-display uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="container mx-auto px-4 mb-16 md:mb-24">
          <Card variant="featured" className="max-w-md mx-auto flex flex-col">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Early Access</CardTitle>
              <CardDescription>One-time payment — includes every module as it releases</CardDescription>
              <div className="mt-4 flex items-baseline justify-center gap-2">
                <span className="font-display text-5xl font-bold gradient-text">$199</span>
                <span className="text-muted-foreground text-sm">CAD one-time</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Regular <span className="line-through">$349</span>
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {included.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button variant="hero" className="w-full" asChild>
                <Link to="/contact">Join Early Access</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/lessons">Browse the lessons</Link>
              </Button>
            </CardFooter>
          </Card>
        </section>

        {/* Honest Early Access note + mentorship */}
        <section className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto bg-card border-white/10">
            <CardContent className="p-8 text-center">
              <h2 className="font-display text-2xl font-bold text-white tracking-tight mb-2">
                What "Early Access" Means
              </h2>
              <p className="text-muted-foreground mb-6">
                The Academy is being released module by module. Not every video is finished yet —
                the trailer and first modules are live today, and new module videos drop monthly.
                Join now and you get each one the moment it releases, at the Early Access price.
              </p>
              <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <UserRound className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Want hands-on coaching instead?{" "}
                  <Link to="/mentorship" className="text-primary hover:underline">
                    Explore 1-on-1 mentorship
                  </Link>
                  .
                </span>
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AcademyPage;
