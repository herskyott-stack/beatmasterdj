import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Question = {
  id: string;
  question_order: number;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  explanation: string;
};
type Answer = {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  display_order: number;
};

const QuestionEditor = ({ lessonId }: { lessonId: string }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: qs } = await supabase
      .from("lesson_questions")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("question_order");
    setQuestions((qs as Question[]) || []);
    if (qs && qs.length > 0) {
      const { data: as } = await supabase
        .from("lesson_answers")
        .select("*")
        .in("question_id", qs.map((q) => q.id))
        .order("display_order");
      const grouped: Record<string, Answer[]> = {};
      (as || []).forEach((a: any) => {
        grouped[a.question_id] = grouped[a.question_id] || [];
        grouped[a.question_id].push(a);
      });
      setAnswers(grouped);
    } else {
      setAnswers({});
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [lessonId]);

  const addQuestion = async () => {
    const { data, error } = await supabase
      .from("lesson_questions")
      .insert({
        lesson_id: lessonId,
        question_text: "New question",
        question_type: "multiple_choice",
        question_order: questions.length + 1,
        explanation: "",
      })
      .select()
      .single();
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    // Add 4 default answers
    await supabase.from("lesson_answers").insert([
      { question_id: data.id, answer_text: "Option A", is_correct: true, display_order: 1 },
      { question_id: data.id, answer_text: "Option B", is_correct: false, display_order: 2 },
      { question_id: data.id, answer_text: "Option C", is_correct: false, display_order: 3 },
      { question_id: data.id, answer_text: "Option D", is_correct: false, display_order: 4 },
    ]);
    load();
  };

  const saveQuestion = async (q: Question) => {
    const { error } = await supabase
      .from("lesson_questions")
      .update({
        question_text: q.question_text,
        question_type: q.question_type,
        explanation: q.explanation,
        question_order: q.question_order,
      })
      .eq("id", q.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Saved", description: "Question updated." });
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await supabase.from("lesson_questions").delete().eq("id", id);
    load();
  };

  const saveAnswer = async (a: Answer) => {
    await supabase
      .from("lesson_answers")
      .update({ answer_text: a.answer_text, is_correct: a.is_correct })
      .eq("id", a.id);
  };

  const toggleCorrect = async (qId: string, aId: string, qType: string) => {
    const list = answers[qId] || [];
    if (qType === "multiple_choice" || qType === "true_false") {
      // single correct
      for (const a of list) {
        await supabase.from("lesson_answers").update({ is_correct: a.id === aId }).eq("id", a.id);
      }
    } else {
      const target = list.find((a) => a.id === aId);
      if (target) await supabase.from("lesson_answers").update({ is_correct: !target.is_correct }).eq("id", aId);
    }
    load();
  };

  const addAnswer = async (qId: string) => {
    const list = answers[qId] || [];
    await supabase.from("lesson_answers").insert({
      question_id: qId,
      answer_text: "New option",
      is_correct: false,
      display_order: list.length + 1,
    });
    load();
  };

  const deleteAnswer = async (id: string) => {
    await supabase.from("lesson_answers").delete().eq("id", id);
    load();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading questions…</p>;

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <Card key={q.id} className="p-4 bg-background/40">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-sm">Question {qi + 1}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => saveQuestion(q)}>
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
              <Button size="sm" variant="destructive" onClick={() => deleteQuestion(q.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Question text</Label>
              <Textarea
                value={q.question_text}
                onChange={(e) => setQuestions((s) => s.map((x) => x.id === q.id ? { ...x, question_text: e.target.value } : x))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select
                  value={q.question_type}
                  onValueChange={(v: any) =>
                    setQuestions((s) => s.map((x) => x.id === q.id ? { ...x, question_type: v } : x))
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple choice</SelectItem>
                    <SelectItem value="true_false">True / False</SelectItem>
                    <SelectItem value="short_answer">Short answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Order</Label>
                <Input
                  type="number"
                  value={q.question_order}
                  onChange={(e) => setQuestions((s) => s.map((x) => x.id === q.id ? { ...x, question_order: parseInt(e.target.value) || 1 } : x))}
                />
              </div>
            </div>

            <div>
              <Label>Explanation (why the correct answer is correct)</Label>
              <Textarea
                value={q.explanation}
                onChange={(e) => setQuestions((s) => s.map((x) => x.id === q.id ? { ...x, explanation: e.target.value } : x))}
                placeholder="Explain the reasoning so the student learns from their answer."
                rows={3}
              />
            </div>

            {q.question_type !== "short_answer" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Answer choices</Label>
                  <Button size="sm" variant="outline" onClick={() => addAnswer(q.id)}>
                    <Plus className="w-3 h-3 mr-1" /> Add option
                  </Button>
                </div>
                <div className="space-y-2">
                  {(answers[q.id] || []).map((a) => (
                    <div key={a.id} className="flex items-center gap-2 p-2 border border-white/10 rounded-md">
                      <Switch
                        checked={a.is_correct}
                        onCheckedChange={() => toggleCorrect(q.id, a.id, q.question_type)}
                      />
                      <Input
                        value={a.answer_text}
                        onChange={(e) =>
                          setAnswers((s) => ({
                            ...s,
                            [q.id]: s[q.id].map((x) => x.id === a.id ? { ...x, answer_text: e.target.value } : x),
                          }))
                        }
                        onBlur={() => saveAnswer(a)}
                      />
                      <span className="text-xs text-muted-foreground w-16">{a.is_correct ? "Correct" : "Wrong"}</span>
                      <Button size="sm" variant="ghost" onClick={() => deleteAnswer(a.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {q.question_type === "short_answer" && (
              <p className="text-xs text-muted-foreground">
                Short answers are reviewed by you in the Progress tab. The "expected answer" can be entered as a single answer choice marked correct.
              </p>
            )}
          </div>
        </Card>
      ))}

      <Button onClick={addQuestion} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Add question
      </Button>
    </div>
  );
};

export default QuestionEditor;
