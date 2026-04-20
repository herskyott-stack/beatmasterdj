
The user wants every lesson across all 24 modules to have substantially longer, in-depth text content with cited sources at the bottom.

## Current state
- 24 modules, each with ~10 lessons + 1 module overview lesson (lesson_number=0)
- Most lessons have short or empty `additional_notes`
- Need to fill `additional_notes` with rich, sourced content

## Plan

**Single AI generation pass** to populate `lesson_lessons.additional_notes` for every lesson (regular + module overviews) across Modules 1–24.

For each lesson, generate:
1. **Intro** — what this lesson covers + why it matters (2-3 sentences)
2. **Core concepts** — 4–8 detailed sections with headings, ~600–900 words each lesson total
3. **Practical tips / common mistakes** — bulleted, actionable
4. **Practice exercise** — concrete drill the student can do
5. **Sources** — 3–6 cited references (DJcityTV, Digital DJ Tips, Crossfader, Pioneer DJ Academy, Native Instruments docs, Mixmag, DJ Mag, Serato blog, Wikipedia for theory)

Stored as Markdown in `additional_notes` (already rendered as `whitespace-pre-wrap` in `LessonView`; will switch to a lightweight markdown renderer so headings/links look professional).

## Approach (one run)

1. Use Lovable AI script (`google/gemini-2.5-pro` for quality) via `/tmp/lovable_ai.py` to generate content for all ~264 lessons in batches by module (24 batches × ~11 lessons each).
2. Build a SQL UPDATE script writing `additional_notes` per lesson_id.
3. Run via the data insert tool.
4. Add `react-markdown` rendering to `LessonView.tsx` so the new long-form notes display with proper headings, lists, and clickable source links. Same for the curriculum editor preview.

## Files

**Edited**
- `src/pages/LessonView.tsx` — render `additional_notes` with `react-markdown` instead of plain `<p>`
- `package.json` — add `react-markdown` + `remark-gfm` (auto via npm install)

**Data writes**
- ~264 UPDATE statements on `lesson_lessons.additional_notes`

## Caveats
- AI-generated content needs your spot-check; you can edit any lesson in the curriculum editor
- Sources are real publications but the AI picks article titles plausibly — you may want to verify any specific URL before relying on it in marketing
- Will take 2–4 minutes of generation time
- Skips lessons that already have substantial notes (>500 chars) so your existing edits aren't overwritten — say "overwrite everything" if you want a full reset
