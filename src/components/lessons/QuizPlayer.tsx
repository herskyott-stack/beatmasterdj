import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Question = {
  id: string;
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

const QuizPlayer = ({
  lessonId,
  userId,
  onComplete,
}: {
  lessonId: string;
  userId: string;
  onComplete: (score: number) => void;
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
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
      }
      setLoading(false);
    })();
  }, [lessonId]);

  const submit = async () => {
    let correct = 0;
    const r: Record<string, boolean> = {};
    const inserts: any[] = [];

    for (const q of questions) {
      const list = answers[q.id] || [];
      const response = responses[q.id];
      let isCorrect = false;
      let selected_answer_id: string | null = null;
      let short_answer_text: string | null = null;

      if (q.question_type === "short_answer") {
        short_answer_text = response || "";
        const correctTexts = list.filter((a) => a.is_correct).map((a) => a.answer_text.toLowerCase().trim());
        isCorrect = correctTexts.includes((response || "").toLowerCase().trim());
      } else {
        selected_answer_id = response || null;
        const chosen = list.find((a) => a.id === response);
        isCorrect = !!chosen?.is_correct;
      }

      if (isCorrect) correct++;
      r[q.id] = isCorrect;
      inserts.push({
        user_id: userId,
        lesson_id: lessonId,
        question_id: q.id,
        selected_answer_id,
        short_answer_text,
        is_correct: isCorrect,
      });
    }

    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    await supabase.from("lesson_quiz_attempts").insert(inserts);

    // upsert progress
    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("id, quiz_attempts")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle();
    if (existing) {
      await supabase
        .from("lesson_progress")
        .update({
          quiz_score: score,
          quiz_attempts: (existing.quiz_attempts || 0) + 1,
          status: score >= 70 ? "completed" : "in_progress",
          completed_at: score >= 70 ? new Date().toISOString() : null,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("lesson_progress").insert({
        user_id: userId,
        lesson_id: lessonId,
        quiz_score: score,
        quiz_attempts: 1,
        status: score >= 70 ? "completed" : "in_progress",
        completed_at: score >= 70 ? new Date().toISOString() : null,
        video_watched: true,
      });
    }

    setResults(r);
    setSubmitted(true);
    onComplete(score);
    toast({
      title: `You scored ${score}%`,
      description: score >= 70 ? "Lesson completed!" : "Review the explanations and try again.",
    });
  };

  const retake = () => {
    setSubmitted(false);
    setResponses({});
    setResults({});
  };

  if (loading) return <p className="text-muted-foreground">Loading quiz…</p>;
  if (questions.length === 0) {
    return <p className="text-muted-foreground">No quiz available for this lesson yet.</p>;
  }

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => {
        const list = answers[q.id] || [];
        const isCorrect = results[q.id];
        const correctAns = list.find((a) => a.is_correct);
        return (
          <Card key={q.id}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">
                  {qi + 1}. {q.question_text}
                </p>
                {submitted && (isCorrect ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-destructive" />)}
              </div>

              {q.question_type === "short_answer" ? (
                <Input
                  value={responses[q.id] || ""}
                  onChange={(e) => setResponses((s) => ({ ...s, [q.id]: e.target.value }))}
                  disabled={submitted}
                  placeholder="Your answer…"
                />
              ) : (
                <RadioGroup
                  value={responses[q.id] || ""}
                  onValueChange={(v) => setResponses((s) => ({ ...s, [q.id]: v }))}
                  disabled={submitted}
                >
                  {list.map((a) => {
                    const showCorrect = submitted && a.is_correct;
                    const showWrong = submitted && responses[q.id] === a.id && !a.is_correct;
                    return (
                      <div
                        key={a.id}
                        className={`flex items-center gap-2 p-2 rounded-md border ${
                          showCorrect ? "border-green-500/50 bg-green-500/10" :
                          showWrong ? "border-destructive/50 bg-destructive/10" :
                          "border-white/10"
                        }`}
                      >
                        <RadioGroupItem value={a.id} id={a.id} />
                        <Label htmlFor={a.id} className="cursor-pointer flex-1">{a.answer_text}</Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              )}

              {submitted && (
                <div className={`text-sm p-3 rounded-md ${isCorrect ? "bg-green-500/10" : "bg-destructive/10"}`}>
                  <p className="font-semibold mb-1">
                    {isCorrect ? "Correct!" : "Not quite."}
                  </p>
                  {!isCorrect && correctAns && (
                    <p className="text-xs mb-1">
                      <span className="text-muted-foreground">Correct answer: </span>
                      <span className="text-green-500">{correctAns.answer_text}</span>
                    </p>
                  )}
                  {q.explanation && (
                    <p className="text-xs italic border-l-2 border-primary pl-2 mt-2">{q.explanation}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {!submitted ? (
        <Button onClick={submit} className="w-full" disabled={Object.keys(responses).length < questions.length}>
          Submit quiz
        </Button>
      ) : (
        <Button onClick={retake} variant="outline" className="w-full">
          Retake quiz
        </Button>
      )}
    </div>
  );
};

export default QuizPlayer;
