import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Save, Trash2, Youtube } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import YouTubeEmbed, { extractYouTubeId } from "./YouTubeEmbed";
import QuestionEditor from "./QuestionEditor";

type Module = { id: string; module_number: number; title: string; description: string | null };
type Lesson = {
  id: string;
  module_id: string;
  lesson_number: number;
  title: string;
  description: string | null;
  youtube_url: string | null;
  youtube_video_id: string | null;
  additional_notes: string | null;
};

const CurriculumEditor = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: ms } = await supabase
      .from("lesson_modules")
      .select("*")
      .order("module_number");
    setModules((ms as Module[]) || []);
    const { data: ls } = await supabase
      .from("lesson_lessons")
      .select("*")
      .order("lesson_number");
    const grouped: Record<string, Lesson[]> = {};
    (ls || []).forEach((l: any) => {
      grouped[l.module_id] = grouped[l.module_id] || [];
      grouped[l.module_id].push(l);
    });
    setLessonsByModule(grouped);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateModule = (id: string, patch: Partial<Module>) => {
    setModules((s) => s.map((m) => m.id === id ? { ...m, ...patch } : m));
  };

  const saveModule = async (m: Module) => {
    const { error } = await supabase
      .from("lesson_modules")
      .update({ title: m.title, description: m.description })
      .eq("id", m.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Saved", description: `Module ${m.module_number} updated.` });
  };

  const addLesson = async (moduleId: string) => {
    const list = lessonsByModule[moduleId] || [];
    const { error } = await supabase.from("lesson_lessons").insert({
      module_id: moduleId,
      lesson_number: list.length + 1,
      title: `Lesson ${list.length + 1} — New`,
      description: "",
    });
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    load();
  };

  const updateLesson = (id: string, moduleId: string, patch: Partial<Lesson>) => {
    setLessonsByModule((s) => ({
      ...s,
      [moduleId]: s[moduleId].map((l) => l.id === id ? { ...l, ...patch } : l),
    }));
  };

  const saveLesson = async (l: Lesson) => {
    const videoId = l.youtube_url ? extractYouTubeId(l.youtube_url) : null;
    const { error } = await supabase
      .from("lesson_lessons")
      .update({
        title: l.title,
        description: l.description,
        youtube_url: l.youtube_url,
        youtube_video_id: videoId,
        additional_notes: l.additional_notes,
        lesson_number: l.lesson_number,
      })
      .eq("id", l.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Saved", description: `Lesson updated.` });
    load();
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Delete this lesson and all its questions?")) return;
    await supabase.from("lesson_lessons").delete().eq("id", id);
    load();
  };

  if (loading) return <p className="text-muted-foreground">Loading curriculum…</p>;

  return (
    <Accordion type="multiple" className="space-y-2">
      {modules.map((m) => (
        <AccordionItem key={m.id} value={m.id} className="border border-white/10 rounded-lg bg-card/40 px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <span className="text-primary font-bold">M{m.module_number}</span>
              <span className="font-display">{m.title}</span>
              <span className="text-xs text-muted-foreground">
                ({lessonsByModule[m.id]?.length || 0} lessons)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <Label>Module title</Label>
                    <Input value={m.title} onChange={(e) => updateModule(m.id, { title: e.target.value })} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={m.description || ""}
                      onChange={(e) => updateModule(m.id, { description: e.target.value })}
                    />
                  </div>
                  <Button size="sm" onClick={() => saveModule(m)}>
                    <Save className="w-3 h-3 mr-1" /> Save module
                  </Button>
                </CardContent>
              </Card>

              <Accordion type="multiple" className="space-y-2">
                {(lessonsByModule[m.id] || []).map((l) => (
                  <AccordionItem key={l.id} value={l.id} className="border border-white/10 rounded-lg bg-background/40 px-3">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2 text-left">
                        <span className="text-secondary text-sm">L{l.lesson_number}</span>
                        <span className="text-sm">{l.title}</span>
                        {l.youtube_video_id && <Youtube className="w-3 h-3 text-primary" />}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-3">
                          <div>
                            <Label>Title</Label>
                            <Input value={l.title} onChange={(e) => updateLesson(l.id, m.id, { title: e.target.value })} />
                          </div>
                          <div>
                            <Label>Order</Label>
                            <Input
                              type="number"
                              value={l.lesson_number}
                              onChange={(e) => updateLesson(l.id, m.id, { lesson_number: parseInt(e.target.value) || 1 })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={l.description || ""}
                            onChange={(e) => updateLesson(l.id, m.id, { description: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>YouTube URL</Label>
                          <Input
                            value={l.youtube_url || ""}
                            onChange={(e) => updateLesson(l.id, m.id, { youtube_url: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                          />
                        </div>
                        {l.youtube_url && extractYouTubeId(l.youtube_url) && (
                          <YouTubeEmbed videoId={extractYouTubeId(l.youtube_url)!} title={l.title} />
                        )}
                        <div>
                          <Label>Additional notes / lesson content</Label>
                          <Textarea
                            value={l.additional_notes || ""}
                            onChange={(e) => updateLesson(l.id, m.id, { additional_notes: e.target.value })}
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveLesson(l)}>
                            <Save className="w-3 h-3 mr-1" /> Save lesson
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteLesson(l.id)}>
                            <Trash2 className="w-3 h-3 mr-1" /> Delete
                          </Button>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                          <p className="font-semibold mb-3">Quiz questions</p>
                          <QuestionEditor lessonId={l.id} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <Button variant="outline" size="sm" onClick={() => addLesson(m.id)}>
                <Plus className="w-3 h-3 mr-1" /> Add lesson to this module
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default CurriculumEditor;
