import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, GraduationCap, Youtube, AlertTriangle, Save } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import YouTubeEmbed from "@/components/lessons/YouTubeEmbed";
import UploadedVideoPlayer from "@/components/lessons/UploadedVideoPlayer";
import QuizPlayer from "@/components/lessons/QuizPlayer";
import LessonVideoUploader from "@/components/lessons/LessonVideoUploader";
import LessonFilesList from "@/components/lessons/LessonFilesList";
import RecordSidebar, { type SidebarModule } from "@/components/lessons/admin/RecordSidebar";
import Teleprompter from "@/components/lessons/admin/Teleprompter";
import { buildScript, hasThinNotes } from "@/lib/lessonScript";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const LessonsRecordStudio = () => {
  const navigate = useNavigate();
  const { lessonId: routeLessonId } = useParams();
  const { isAdmin, loading: adminLoading, userId } = useAdminCheck();

  const [modules, setModules] = useState<any[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, any[]>>({});
  const [activeLessonId, setActiveLessonId] = useState<string | null>(routeLessonId || null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<any>(null);
  const [youtubeInput, setYoutubeInput] = useState("");
  const [savingYt, setSavingYt] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate("/auth");
  }, [adminLoading, isAdmin, navigate]);

  // Load all modules + lessons once
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { data: ms } = await supabase
        .from("lesson_modules")
        .select("*")
        .order("module_number");
      const { data: ls } = await supabase
        .from("lesson_lessons")
        .select("*")
        .order("lesson_number");
      setModules(ms || []);
      const grouped: Record<string, any[]> = {};
      (ls || []).forEach((l: any) => {
        grouped[l.module_id] = grouped[l.module_id] || [];
        grouped[l.module_id].push(l);
      });
      setLessonsByModule(grouped);

      // Default to first lesson if none chosen
      if (!routeLessonId && ms && ms.length && grouped[ms[0].id]?.length) {
        const first = grouped[ms[0].id][0];
        setActiveLessonId(first.id);
      }
    })();
  }, [isAdmin, routeLessonId]);

  // Load active lesson detail
  useEffect(() => {
    if (!activeLessonId) return;
    (async () => {
      const { data } = await supabase
        .from("lesson_lessons")
        .select("*")
        .eq("id", activeLessonId)
        .maybeSingle();
      setActiveLesson(data);
      setYoutubeInput(data?.youtube_url || "");
      const m = modules.find((mod) => mod.id === data?.module_id);
      setActiveModule(m || null);
    })();
  }, [activeLessonId, modules]);

  const sidebarModules: SidebarModule[] = useMemo(
    () =>
      modules.map((m) => ({
        id: m.id,
        module_number: m.module_number,
        title: m.title,
        lessons: (lessonsByModule[m.id] || []).map((l) => ({
          id: l.id,
          lesson_number: l.lesson_number,
          title: l.title,
          hasVideo: !!(l.youtube_video_id || l.video_file_path),
        })),
      })),
    [modules, lessonsByModule]
  );

  const script = useMemo(() => {
    if (!activeLesson || !activeModule) return "";
    const total = (lessonsByModule[activeModule.id] || []).length;
    return buildScript(
      {
        lesson_number: activeLesson.lesson_number,
        title: activeLesson.title,
        description: activeLesson.description,
        additional_notes: activeLesson.additional_notes,
      },
      { module_number: activeModule.module_number, title: activeModule.title },
      total
    );
  }, [activeLesson, activeModule, lessonsByModule]);

  const refreshActiveLesson = async () => {
    if (!activeLessonId) return;
    const { data } = await supabase
      .from("lesson_lessons")
      .select("*")
      .eq("id", activeLessonId)
      .maybeSingle();
    setActiveLesson(data);
    // Patch sidebar status
    if (data) {
      setLessonsByModule((prev) => {
        const list = prev[data.module_id] || [];
        return {
          ...prev,
          [data.module_id]: list.map((l) => (l.id === data.id ? data : l)),
        };
      });
    }
  };

  const saveYouTube = async () => {
    if (!activeLessonId) return;
    const id = extractYouTubeId(youtubeInput.trim());
    if (youtubeInput && !id) {
      return toast({
        title: "Invalid YouTube URL",
        description: "Use a youtube.com or youtu.be link.",
        variant: "destructive",
      });
    }
    setSavingYt(true);
    const { error } = await supabase
      .from("lesson_lessons")
      .update({
        youtube_url: youtubeInput || null,
        youtube_video_id: id,
      })
      .eq("id", activeLessonId);
    setSavingYt(false);
    if (error) {
      return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    }
    toast({ title: "YouTube link saved" });
    refreshActiveLesson();
  };

  const onPickLesson = (moduleId: string, lessonId: string) => {
    setActiveLessonId(lessonId);
    navigate(`/admin/lessons/record/${lessonId}`, { replace: true });
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GraduationCap className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }
  if (!isAdmin) return null;

  const filename = activeLesson && activeModule
    ? `Module-${activeModule.module_number}-Lesson-${activeLesson.lesson_number}.txt`
    : "lesson-script.txt";

  const thinNotes = hasThinNotes(activeLesson?.additional_notes ?? null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                <span className="gradient-text">Record Studio</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Walk through each lesson, read the script, and upload your video — all in one place.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/admin/lessons")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to LMS
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_400px] gap-4">
            {/* LEFT: lesson nav */}
            <aside className="lg:sticky lg:top-24 lg:self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
              <RecordSidebar
                modules={sidebarModules}
                activeLessonId={activeLessonId || undefined}
                onPick={onPickLesson}
              />
            </aside>

            {/* CENTER: student preview */}
            <section className="space-y-4 min-w-0">
              {!activeLesson ? (
                <Card variant="glass">
                  <CardContent className="pt-6 text-muted-foreground">
                    Pick a lesson on the left to start.
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div>
                    <Badge variant="outline">
                      Module {activeModule?.module_number} · Lesson {activeLesson.lesson_number}
                    </Badge>
                    <h2 className="font-display text-2xl md:text-3xl font-bold mt-2">
                      {activeLesson.title}
                    </h2>
                    {activeLesson.description && (
                      <p className="text-muted-foreground mt-2">{activeLesson.description}</p>
                    )}
                  </div>

                  {activeLesson.video_file_path ? (
                    <UploadedVideoPlayer path={activeLesson.video_file_path} />
                  ) : activeLesson.youtube_video_id ? (
                    <YouTubeEmbed
                      videoId={activeLesson.youtube_video_id}
                      title={activeLesson.title}
                    />
                  ) : (
                    <div className="aspect-video w-full rounded-lg border border-dashed border-primary/40 bg-card/30 flex items-center justify-center text-sm text-muted-foreground">
                      No video uploaded yet — use the panel on the right.
                    </div>
                  )}

                  {activeLesson.additional_notes && (
                    <Card>
                      <CardContent className="pt-6">
                        <article className="prose prose-invert prose-sm md:prose-base max-w-none
                          prose-headings:font-display prose-headings:text-foreground
                          prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-primary
                          prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-secondary
                          prose-p:text-muted-foreground prose-p:leading-relaxed
                          prose-strong:text-foreground
                          prose-a:text-primary hover:prose-a:text-primary/80 prose-a:underline
                          prose-ul:text-muted-foreground prose-li:my-1
                          prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {activeLesson.additional_notes}
                          </ReactMarkdown>
                        </article>
                      </CardContent>
                    </Card>
                  )}

                  <LessonFilesList lessonId={activeLesson.id} />

                  <Card variant="neon">
                    <CardContent className="pt-6">
                      <h3 className="font-display text-xl font-bold mb-4">Quiz preview</h3>
                      {userId ? (
                        <QuizPlayer
                          lessonId={activeLesson.id}
                          userId={userId}
                          onComplete={() => {}}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">Sign in to test the quiz.</p>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </section>

            {/* RIGHT: record panel */}
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start max-h-[calc(100vh-7rem)] overflow-y-auto">
              {activeLesson && (
                <>
                  <Card variant="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Teleprompter script</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {thinNotes && (
                        <div className="flex items-start gap-2 rounded-md border border-yellow-500/40 bg-yellow-500/10 p-2 text-xs text-yellow-200">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            Thin notes — script is mostly placeholder. Add detailed notes in the
                            curriculum editor for a richer script.
                          </span>
                        </div>
                      )}
                      <Teleprompter script={script} filename={filename} />
                    </CardContent>
                  </Card>

                  <Card variant="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Video sources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <LessonVideoUploader
                        lessonId={activeLesson.id}
                        currentPath={activeLesson.video_file_path}
                        onChange={() => refreshActiveLesson()}
                      />
                      <div className="space-y-2 rounded-md border border-white/10 p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Youtube className="w-4 h-4 text-primary" /> YouTube link
                        </div>
                        <Input
                          value={youtubeInput}
                          onChange={(e) => setYoutubeInput(e.target.value)}
                          placeholder="https://youtu.be/..."
                        />
                        <Button size="sm" onClick={saveYouTube} disabled={savingYt} className="w-full">
                          <Save className="w-3 h-3 mr-1" />
                          {savingYt ? "Saving…" : "Save YouTube link"}
                        </Button>
                        {activeLesson.youtube_video_id && !activeLesson.video_file_path && (
                          <p className="text-xs text-primary">✓ YouTube active (ID: {activeLesson.youtube_video_id})</p>
                        )}
                        {activeLesson.video_file_path && (
                          <p className="text-xs text-muted-foreground">
                            Uploaded video takes priority over YouTube.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LessonsRecordStudio;
