import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const QUIZ_TOOL = {
  type: "function",
  function: {
    name: "emit_quiz",
    description: "Return exactly 5 multiple-choice questions grounded in the lesson notes.",
    parameters: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          minItems: 5,
          maxItems: 5,
          items: {
            type: "object",
            properties: {
              question_text: { type: "string" },
              explanation: { type: "string" },
              answers: {
                type: "array",
                minItems: 4,
                maxItems: 4,
                items: {
                  type: "object",
                  properties: {
                    answer_text: { type: "string" },
                    is_correct: { type: "boolean" },
                  },
                  required: ["answer_text", "is_correct"],
                  additionalProperties: false,
                },
              },
            },
            required: ["question_text", "explanation", "answers"],
            additionalProperties: false,
          },
        },
      },
      required: ["questions"],
      additionalProperties: false,
    },
  },
};

async function generateQuizForLesson(notes: string, title: string, apiKey: string) {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You write multiple-choice DJ-curriculum quizzes. Each question must be grounded in the lesson notes provided. 4 options per question, exactly 1 correct. Each question gets a 1-2 sentence explanation of why the right answer is right. Return via the emit_quiz tool only.",
        },
        {
          role: "user",
          content: `Lesson title: ${title}\n\nLesson notes:\n${notes}\n\nWrite 5 multiple-choice questions covering the most important concepts from these notes.`,
        },
      ],
      tools: [QUIZ_TOOL],
      tool_choice: { type: "function", function: { name: "emit_quiz" } },
    }),
  });
  if (!resp.ok) throw new Error(`AI ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("No tool call in response");
  return JSON.parse(args).questions;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { limit = 10 } = await req.json().catch(() => ({}));
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
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
        const questions = await generateQuizForLesson(lesson.notes, lesson.title, apiKey);
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
