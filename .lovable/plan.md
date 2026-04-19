
You want every lesson to have a real (non-blank) YouTube video and quizzes restructured to **1 quiz per 5 lessons**. Quick reality check before I commit:

## The honest scope
- 24 modules × ~10 lessons = **~240 lessons** needing videos
- 1 quiz per 5 lessons = **~48 quizzes** × 5 questions = **240 questions** with explanations

I can't *guarantee* every YouTube ID I write is live and exactly on-topic without verifying each one against the YouTube API — which would need a key from you. So I need to know your preference before generating content.

## What I'll change either way

**Schema:** add `quiz_group` int column to `lesson_lessons`, backfilled as `ceil(lesson_number / 5)`. Quiz questions stay attached to the **last lesson** of each group of 5 (lesson 5, 10, 15…).

**Student UI (`Lessons.tsx` / `LessonView.tsx`):**
- Lessons visually grouped: "Chapter 1 — Lessons 1–5 → Quiz 1"
- Quiz only unlocks when all 5 videos in the group are marked watched
- Passing the quiz (≥70%) marks all 5 lessons complete

**Admin UI (`CurriculumEditor.tsx`):** group lessons by `quiz_group`, move `QuestionEditor` from per-lesson to per-group.

**Memory:** update `mem://features/dj-lessons-lms.md` to reflect new quiz model.

## The content question

Pick one — I need your call:

**A) Full seed, all 24 modules** — I write a curated YouTube URL for all ~240 lessons (using stable channels: Crossfader, DJcityTV, Digital DJ Tips, Pioneer DJ, Phil Harris) plus all 48 quizzes × 5 questions. Fast coverage. **You must spot-check links before granting student access** — I'll add a banner in admin reminding you.

**B) Verified first 6 modules only** — I carefully populate modules 1–6 (~60 lessons, 12 quizzes) with high-confidence links and quality questions. Modules 7–24 stay placeholders. Higher quality, less risk of dead links.

**C) Build a YouTube auto-fill tool** — I add an admin button "Search YouTube for this lesson" that lets you pick the right video. Needs you to add a `YOUTUBE_API_KEY` secret. Highest quality; you co-author.

Reply **A**, **B**, or **C** and I'll build it. (I recommend **B + C**: ship verified first 6 modules now, then add the auto-fill tool so you can finish the rest yourself with confidence.)
