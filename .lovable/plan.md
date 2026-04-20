
Do the first half (Modules 1–12, ~120 lessons) this run. You'll trigger the second half (Modules 13–24) in a follow-up.

## Scope this run
For every lesson in Modules 1–12:
1. Set `youtube_url` + `youtube_video_id` to a real DJ tutorial video (Crossfader, Digital DJ Tips, DJcityTV, Phil Harris, Carlo Atendido, Pioneer DJ, Native Instruments, Serato, DJ TechTools).
2. Set `additional_notes` to a 250–400 word markdown write-up with headings, bullets, and ASCII/emoji visuals so the lesson reads complete even if a video isn't perfect.
3. Add a **per-lesson quiz** (4 multiple-choice questions, 1 correct, with explanations) into `lesson_questions` + `lesson_answers`. Skip lessons that already have questions.
4. Add a **module TEST** as a hidden 11th lesson per module (`lesson_number = 99`, title `"Module N TEST"`) holding 10 multiple-choice questions covering the whole module.

## How
- Pull Modules 1–12 + their lessons via `supabase--read_query`.
- Run Lovable AI (Gemini) in batches of ~20 lessons to generate `{video_url, notes, quiz[]}` JSON, plus one call per module for the 10-Q test.
- Apply with INSERT/UPDATE through the data tool.

## Files
- Data only — no code/schema changes.
- Schema already supports it (`lesson_lessons.quiz_group`, `lesson_questions`, `lesson_answers` all exist).

## Caveat
Can't live-verify each YouTube URL is reachable; the rich notes are the safety net and you can swap any link from the Curriculum editor.

After this finishes, say "do the other half" and I'll run Modules 13–24 the same way.
