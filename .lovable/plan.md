
User wants AI-generated multiple-choice quizzes for every lesson based on the long-form content I just wrote into `additional_notes`.

## Current state
- 244 lessons across 24 modules now have rich Markdown content in `additional_notes`
- Module overview lessons (lesson_number=0) already have 5-question quizzes
- Regular lessons (lesson_number 1+) mostly have NO questions, or just placeholder ones

## Plan

**Generate 5 multiple-choice questions per regular lesson** (skip module overviews — they already have quizzes), grounded in the actual `additional_notes` content of each lesson.

For each lesson:
- 5 multiple-choice questions, 4 options each, exactly 1 correct
- Each question includes an `explanation` (why the right answer is right) so students learn from mistakes
- Questions reference specific concepts from that lesson's notes (not generic DJ trivia)

## Approach (one batch run)

1. Fetch all lessons with `lesson_number > 0` and non-empty `additional_notes` (~220 lessons).
2. Skip lessons that already have 3+ questions (preserves any manual edits).
3. Use Lovable AI (`google/gemini-2.5-flash`) with structured tool-calling output to generate `{questions: [{question_text, explanation, answers: [{text, is_correct}]}]}` per lesson.
4. Bulk-insert into `lesson_questions` + `lesson_answers` via a temporary `SECURITY DEFINER` RPC (same pattern used for the notes update), then drop the helper.
5. Run via `code--exec` using the `ai-gateway` skill script.

## Files

**New (temporary)**
- migration: create + drop `bulk_insert_lesson_quizzes(jsonb)` helper
- `/tmp/gen_quizzes.py` — generation script (ephemeral)

**No frontend changes** — `QuizPlayer.tsx` already loads from `lesson_questions` / `lesson_answers` and renders correctly.

## Data writes
- ~220 lessons × 5 questions = ~1,100 new `lesson_questions` rows
- ~1,100 × 4 options = ~4,400 new `lesson_answers` rows

## Caveats
- Generation takes ~5–8 minutes
- AI quizzes need spot-check; editable in the curriculum editor's Question Editor
- Lessons with very short notes (<300 chars) are skipped — they don't have enough material for a good quiz
- I won't touch existing module-overview quizzes or any lesson that already has questions
