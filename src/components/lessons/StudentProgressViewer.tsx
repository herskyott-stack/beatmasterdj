import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Download } from "lucide-react";

type Profile = { user_id: string; first_name: string; last_name: string; email: string };

const StudentProgressViewer = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [progress, setProgress] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [questions, setQuestions] = useState<Record<string, any>>({});
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [lessons, setLessons] = useState<Record<string, any>>({});
  const [totalLessons, setTotalLessons] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email")
        .order("first_name");
      setProfiles((data as Profile[]) || []);
      const { count } = await supabase.from("lesson_lessons").select("*", { count: "exact", head: true });
      setTotalLessons(count || 0);
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      const [{ data: prog }, { data: att }, { data: ls }, { data: qs }, { data: ans }] = await Promise.all([
        supabase.from("lesson_progress").select("*").eq("user_id", selected),
        supabase.from("lesson_quiz_attempts").select("*").eq("user_id", selected).order("attempted_at", { ascending: false }),
        supabase.from("lesson_lessons").select("id, title, lesson_number, module_id"),
        supabase.from("lesson_questions").select("id, question_text, explanation"),
        supabase.from("lesson_answers").select("id, answer_text, is_correct, question_id"),
      ]);
      setProgress(prog || []);
      setAttempts(att || []);
      const lMap: Record<string, any> = {};
      (ls || []).forEach((l: any) => { lMap[l.id] = l; });
      setLessons(lMap);
      const qMap: Record<string, any> = {};
      (qs || []).forEach((q: any) => { qMap[q.id] = q; });
      setQuestions(qMap);
      const aMap: Record<string, any> = {};
      (ans || []).forEach((a: any) => { aMap[a.id] = a; });
      setAnswers(aMap);
    })();
  }, [selected]);

  const completed = progress.filter((p) => p.status === "completed").length;
  const pct = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

  const exportCsv = () => {
    const rows = [["Lesson", "Question", "Their Answer", "Correct?", "Attempted At"]];
    attempts.forEach((a) => {
      const q = questions[a.question_id];
      const lesson = lessons[a.lesson_id];
      const selectedAnswer = a.selected_answer_id ? answers[a.selected_answer_id]?.answer_text : a.short_answer_text;
      rows.push([
        lesson?.title || "",
        q?.question_text || "",
        selectedAnswer || "",
        a.is_correct ? "Yes" : "No",
        new Date(a.attempted_at).toLocaleString(),
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${(c || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-${selected}-progress.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="text-sm text-muted-foreground">Choose a student</label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger><SelectValue placeholder="Select a student…" /></SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.user_id} value={p.user_id}>
                  {p.first_name} {p.last_name} — {p.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selected && (
          <Button variant="outline" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        )}
      </div>

      {selected && (
        <>
          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between">
                <p className="font-semibold">Overall progress</p>
                <p className="text-sm">{completed} / {totalLessons} lessons ({pct}%)</p>
              </div>
              <Progress value={pct} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="font-semibold mb-4">Lesson progress</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {progress.length === 0 && <p className="text-sm text-muted-foreground">No lessons started yet.</p>}
                {progress.map((p) => {
                  const l = lessons[p.lesson_id];
                  return (
                    <div key={p.id} className="flex items-center justify-between p-2 border border-white/10 rounded-md">
                      <div>
                        <p className="text-sm font-medium">{l?.title || "Lesson"}</p>
                        {p.student_notes && (
                          <p className="text-xs text-muted-foreground italic mt-1">"{p.student_notes}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {p.quiz_score !== null && <Badge variant="outline">{p.quiz_score}%</Badge>}
                        <Badge variant={p.status === "completed" ? "default" : "secondary"}>
                          {p.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="font-semibold mb-4">Quiz attempts (latest first)</p>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {attempts.length === 0 && <p className="text-sm text-muted-foreground">No quiz attempts yet.</p>}
                {attempts.map((a) => {
                  const q = questions[a.question_id];
                  const correctAns = Object.values(answers).find((x: any) => x.question_id === a.question_id && x.is_correct);
                  const theirAns = a.selected_answer_id ? answers[a.selected_answer_id] : null;
                  return (
                    <div key={a.id} className="p-3 border border-white/10 rounded-md bg-background/40">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{q?.question_text || "Question"}</p>
                        {a.is_correct ? <Check className="w-4 h-4 text-green-500 shrink-0" /> : <X className="w-4 h-4 text-destructive shrink-0" />}
                      </div>
                      <p className="text-xs mt-2">
                        <span className="text-muted-foreground">Their answer: </span>
                        <span className={a.is_correct ? "text-green-500" : "text-destructive"}>
                          {theirAns?.answer_text || a.short_answer_text || "—"}
                        </span>
                      </p>
                      {!a.is_correct && correctAns && (
                        <p className="text-xs">
                          <span className="text-muted-foreground">Correct answer: </span>
                          <span className="text-green-500">{(correctAns as any).answer_text}</span>
                        </p>
                      )}
                      {q?.explanation && (
                        <p className="text-xs mt-2 italic text-muted-foreground border-l-2 border-primary pl-2">
                          {q.explanation}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(a.attempted_at).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default StudentProgressViewer;
