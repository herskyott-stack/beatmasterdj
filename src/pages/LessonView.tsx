import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLessonAccess } from "@/hooks/useLessonAccess";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import YouTubeEmbed from "@/components/lessons/YouTubeEmbed";
import QuizPlayer from "@/components/lessons/QuizPlayer";
import { toast } from "@/hooks/use-toast";

const LessonView = () => {
  const { moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { hasAccess, loading, userId } = useLessonAccess();

  const [module, setModule] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [videoWatched, setVideoWatched] = useState(false);
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    if (!moduleId || !userId) return;
    const [{ data: m }, { data: ls }, { data: prog }] = await Promise.all([
      supabase.from("lesson_modules").select("*").eq("id", moduleId).maybeSingle(),
      supabase.from("lesson_lessons").select("*").eq("module_id", moduleId).order("lesson_number"),
      supabase.from("lesson_progress").select("*").eq("user_id", userId),
    ]);
    setModule(m);
    setLessons(ls || []);
    const map: Record<string, any> = {};
    (prog || []).forEach((p: any) => { map[p.lesson_id] = p; });
    setProgress(map);

    if (lessonId) {
      const cur = (ls || []).find((l: any) => l.id === lessonId);
      setCurrentLesson(cur || null);
      const lp = map[lessonId];
      setVideoWatched(!!lp?.video_watched);
      setNotes(lp?.student_notes || "");
    } else {
      setCurrentLesson(null);
    }
  }, [moduleId, lessonId, userId]);

  useEffect(() => {
    if (!loading && !hasAccess) navigate("/lessons");
  }, [loading, hasAccess, navigate]);

  useEffect(() => { load(); }, [load]);

  const markVideoWatched = async () => {
    if (!userId || !lessonId) return;
    const existing = progress[lessonId];
    if (existing) {
      await supabase
        .from("lesson_progress")
        .update({ video_watched: true, status: existing.status === "not_started" ? "in_progress" : existing.status })
        .eq("id", existing.id);
    } else {
      await supabase.from("lesson_progress").insert({
        user_id: userId,
        lesson_id: lessonId,
        video_watched: true,
        status: "in_progress",
      });
    }
    setVideoWatched(true);
    toast({ title: "Marked as watched", description: "Now take the quiz to complete this lesson." });
    load();
  };

  const saveNotes = async () => {
    if (!userId || !lessonId) return;
    const existing = progress[lessonId];
    if (existing) {
      await supabase.from("lesson_progress").update({ student_notes: notes }).eq("id", existing.id);
    } else {
      await supabase.from("lesson_progress").insert({
        user_id: userId,
        lesson_id: lessonId,
        student_notes: notes,
        status: "in_progress",
      });
    }
  };

  // Auto-save notes (debounced)
  useEffect(() => {
    if (!lessonId || !userId) return;
    const t = setTimeout(() => { if (notes) saveNotes(); }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  if (loading || !module) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GraduationCap className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  // Module overview view (no lessonId)
  if (!lessonId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <Button variant="outline" onClick={() => navigate("/lessons")} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> All Modules
            </Button>
            <div className="mb-6">
              <Badge variant="outline">Module {module.module_number}</Badge>
              <h1 className="font-display text-3xl font-bold mt-2">{module.title}</h1>
              <p className="text-muted-foreground mt-2">{module.description}</p>
            </div>
            <div className="space-y-2">
              {lessons.map((l) => {
                const p = progress[l.id];
                const done = p?.status === "completed";
                return (
                  <Card
                    key={l.id}
                    className="cursor-pointer hover:bg-primary/5 transition-colors"
                    onClick={() => navigate(`/lessons/${moduleId}/${l.id}`)}
                  >
                    <CardContent className="pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {done ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                        <div>
                          <p className="font-medium">Lesson {l.lesson_number}: {l.title}</p>
                          {p?.quiz_score !== null && p?.quiz_score !== undefined && (
                            <p className="text-xs text-muted-foreground">Best score: {p.quiz_score}%</p>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
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
  }

  // Single lesson view
  const idx = lessons.findIndex((l) => l.id === lessonId);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Button variant="outline" onClick={() => navigate(`/lessons/${moduleId}`)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to {module.title}
          </Button>

          {currentLesson ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              <div className="space-y-6">
                <div>
                  <Badge variant="outline">Module {module.module_number} · Lesson {currentLesson.lesson_number}</Badge>
                  <h1 className="font-display text-2xl md:text-3xl font-bold mt-2">{currentLesson.title}</h1>
                  {currentLesson.description && (
                    <p className="text-muted-foreground mt-2">{currentLesson.description}</p>
                  )}
                </div>

                <YouTubeEmbed videoId={currentLesson.youtube_video_id || ""} title={currentLesson.title} />

                {currentLesson.additional_notes && (
                  <Card>
                    <CardContent className="pt-4">
                      <p className="font-semibold mb-2">Lesson notes</p>
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{currentLesson.additional_notes}</p>
                    </CardContent>
                  </Card>
                )}

                {!videoWatched ? (
                  <Button onClick={markVideoWatched} className="w-full" disabled={!currentLesson.youtube_video_id}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {currentLesson.youtube_video_id ? "I've watched this — start quiz" : "No video assigned yet"}
                  </Button>
                ) : (
                  <Card variant="neon">
                    <CardContent className="pt-6">
                      <h2 className="font-display text-xl font-bold mb-4">Quiz</h2>
                      <QuizPlayer
                        lessonId={lessonId}
                        userId={userId!}
                        onComplete={() => load()}
                      />
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between">
                  {prev ? (
                    <Button variant="outline" onClick={() => navigate(`/lessons/${moduleId}/${prev.id}`)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                    </Button>
                  ) : <div />}
                  {next && (
                    <Button variant="outline" onClick={() => navigate(`/lessons/${moduleId}/${next.id}`)}>
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>

              <aside>
                <Card>
                  <CardContent className="pt-4">
                    <p className="font-semibold mb-2">Your notes</p>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Jot down what you learned…"
                      rows={10}
                    />
                    <p className="text-xs text-muted-foreground mt-2">Auto-saves as you type.</p>
                  </CardContent>
                </Card>
              </aside>
            </div>
          ) : (
            <p className="text-muted-foreground">Lesson not found.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LessonView;
