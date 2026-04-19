import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLessonAccess } from "@/hooks/useLessonAccess";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Lock, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Lessons = () => {
  const navigate = useNavigate();
  const { hasAccess, loading, userId } = useLessonAccess();
  const [modules, setModules] = useState<any[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState<Record<string, number>>({});

  useEffect(() => {
    if (loading) return;
    if (!userId) {
      navigate("/auth");
      return;
    }
    if (!hasAccess) return;
    (async () => {
      const [{ data: ms }, { data: ls }, { data: prog }] = await Promise.all([
        supabase.from("lesson_modules").select("*").order("module_number"),
        supabase.from("lesson_lessons").select("id, module_id"),
        supabase.from("lesson_progress").select("lesson_id, status").eq("user_id", userId).eq("status", "completed"),
      ]);
      setModules(ms || []);
      const counts: Record<string, number> = {};
      const lessonToModule: Record<string, string> = {};
      (ls || []).forEach((l: any) => {
        counts[l.module_id] = (counts[l.module_id] || 0) + 1;
        lessonToModule[l.id] = l.module_id;
      });
      setLessonCounts(counts);
      const done: Record<string, number> = {};
      (prog || []).forEach((p: any) => {
        const mid = lessonToModule[p.lesson_id];
        if (mid) done[mid] = (done[mid] || 0) + 1;
      });
      setCompleted(done);
    })();
  }, [hasAccess, loading, userId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GraduationCap className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-3xl font-bold mb-3">DJ Lessons</h1>
            <p className="text-muted-foreground mb-6">
              You don't have access to the DJ Lessons program yet. Contact us to enroll in mentorship and unlock 24 modules of step-by-step DJ training.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/mentorship")}>View Mentorship Program</Button>
              <Button variant="outline" onClick={() => navigate("/client-portal")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-3">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                <span className="gradient-text">DJ Lessons</span>
              </h1>
              <p className="text-muted-foreground">24 modules. Watch, learn, take the quiz, master the craft.</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/client-portal")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Client Portal
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m) => {
              const total = lessonCounts[m.id] || 0;
              const done = completed[m.id] || 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <Card
                  key={m.id}
                  variant="neon"
                  className="cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => navigate(`/lessons/${m.id}`)}
                >
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Module {m.module_number}</Badge>
                      <span className="text-xs text-muted-foreground">{done}/{total}</span>
                    </div>
                    <h3 className="font-display font-semibold text-lg">{m.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{m.description}</p>
                    <Progress value={pct} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Lessons;
