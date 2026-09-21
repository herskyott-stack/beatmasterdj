import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// COST CUT (2026-09-21): replaced the metered Lovable AI Gateway
// (ai.gateway.lovable.dev — burns Lovable credits per call) with the FREE
// Pollinations text API (text.pollinations.ai — no key, no signup). Tool-calling
// was swapped for a strict "respond with JSON only" prompt plus shape
// validation below. Same DB read/write logic and same response contract.
// Revert via git history if needed.
// Honest caveats: free community service (no SLA, 10-60s per lesson); long
// lesson notes are truncated to ~6000 chars for URL length safety.

type QuizQuestion = {
  question_text: string;
  explanation: string;
  answers: { answer_text: string; is_correct: boolean }[];
};

function extractJson(text: string): unknown {
  // Strip markdown code fences if the model wraps the JSON.
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("No JSON object in AI response");
  return JSON.parse(candidate.slice(start, end + 1));
}

function validateQuestions(raw: unknown): QuizQuestion[] {
  const obj = raw as { questions?: unknown };
  if (!obj || !Array.isArray(obj.questions) || obj.questions.length !== 5) {
    throw new Error("AI did not return exactly 5 questions");
  }
  return obj.questions.map((q: unknown, i: number) => {
    const qq = q as QuizQuestion;
    if (typeof qq.question_text !== "string" || typeof qq.explanation !== "string") {
      throw new Error(`Question ${i} missing text/explanation`);
    }
    if (!Array.isArray(qq.answers) || qq.answers.length !== 4) {
      throw new Error(`Question ${i} does not have exactly 4 answers`);
    }
    const correct = qq.answers.filter((a) => a && a.is_correct === true).length;
    if (correct !== 1) throw new Error(`Question ${i} does not have exactly 1 correct answer`);
    for (const a of qq.answers) {
      if (typeof a.answer_text !== "string") throw new Error(`Question ${i} has malformed answer`);
    }
    return qq;
  });
}

async function generateQuizForLesson(notes: string, title: string): Promise<QuizQuestion[]> {
  const prompt = `You write multiple-choice DJ-curriculum quizzes. Each question must be grounded in the lesson notes provided. 4 options per question, exactly 1 correct. Each question gets a 1-2 sentence explanation of why the right answer is right.

Lesson title: ${title}

Lesson notes:
${notes.slice(0, 6000)}

Write 5 multiple-choice questions covering the most important concepts from these notes.

Respond with ONLY a JSON object, no other text, in exactly this shape:
{"questions":[{"question_text":"...","explanation":"...","answers":[{"answer_text":"...","is_correct":true},{"answer_text":"...","is_correct":false},{"answer_text":"...","is_correct":false},{"answer_text":"...","is_correct":false}]}]}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  let text: string;
  try {
    const resp = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, {
      headers: { Accept: "text/plain" },
      signal: controller.signal,
    });
    if (!resp.ok) throw new Error(`AI ${resp.status}: ${await resp.text()}`);
    text = await resp.text();
  } finally {
    clearTimeout(timeout);
  }
  return validateQuestions(extractJson(text));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { limit = 10 } = await req.json().catch(() => ({}));
    // No API key needed anymore (free Pollinations API).
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch eligible lessons
    const { data: lessons, error: lErr } = await supabase
      .from("lesson_lessons")
      .select("id, title, additional_notes")
      .gt("lesson_number", 0)
      .not("additional_notes", "is", null);
    if (lErr) throw lErr;

    const eligible: { id: string; title: string; notes: string }[] = [];
    for (const l of lessons || []) {
      if (!l.additional_notes || l.additional_notes.length < 300) continue;
      const { count } = await supabase
        .from("lesson_questions")
        .select("*", { count: "exact", head: true })
        .eq("lesson_id", l.id);
      if ((count ?? 0) < 3) eligible.push({ id: l.id, title: l.title, notes: l.additional_notes });
      if (eligible.length >= limit) break;
    }

    const results: any[] = [];
    const payload: any[] = [];
    for (const lesson of eligible) {
      try {
        const questions = await generateQuizForLesson(lesson.notes, lesson.title);
        payload.push({ lesson_id: lesson.id, questions });
        results.push({ id: lesson.id, ok: true, count: questions.length });
      } catch (e) {
        results.push({ id: lesson.id, ok: false, error: String(e) });
      }
    }

    if (payload.length > 0) {
      const { error: rpcErr } = await supabase.rpc("bulk_insert_lesson_quizzes", {
        _payload: payload,
      });
      if (rpcErr) throw rpcErr;
    }

    // Recount remaining
    const { data: allLessons } = await supabase
      .from("lesson_lessons")
      .select("id, additional_notes")
      .gt("lesson_number", 0);
    let remaining = 0;
    for (const l of allLessons || []) {
      if (!l.additional_notes || l.additional_notes.length < 300) continue;
      const { count } = await supabase
        .from("lesson_questions")
        .select("*", { count: "exact", head: true })
        .eq("lesson_id", l.id);
      if ((count ?? 0) < 3) remaining++;
    }

    return new Response(JSON.stringify({ processed: payload.length, results, remaining }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
