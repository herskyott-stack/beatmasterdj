
Build a comprehensive DJ Lessons LMS inside the admin portal with student access control, 24 modules, video-based quiz lessons, progress tracking, and answer explanations.

## Scope

A full Learning Management System (LMS) with two surfaces:
- **Admin** (`/admin/lessons`) — author/manage curriculum, grant access to clients, track every student's progress.
- **Student** (`/lessons`) — granted clients see their assigned modules, watch YouTube videos, take quizzes, get explanations, take notes.

## Database (new tables)

1. **`lesson_modules`** — 24 top-level modules
   - `id`, `module_number` (1–24), `title`, `description`, `created_at`
2. **`lesson_lessons`** — 8–12 sub-lessons per module
   - `id`, `module_id` (FK), `lesson_number`, `title`, `description`, `youtube_url`, `youtube_video_id`, `additional_notes` (rich text)
3. **`lesson_questions`** — quiz questions per lesson
   - `id`, `lesson_id` (FK), `question_order`, `question_text`, `question_type` (`multiple_choice` | `true_false` | `short_answer`), `explanation` (the "why this is correct" text)
4. **`lesson_answers`** — answer choices per question
   - `id`, `question_id` (FK), `answer_text`, `is_correct`, `display_order`
5. **`lesson_access`** — which users can see lessons
   - `id`, `user_id` (FK auth.users), `granted_by` (admin uid), `granted_at`, `expires_at` (nullable), `is_active`
6. **`lesson_progress`** — per-user per-lesson state
   - `id`, `user_id`, `lesson_id`, `status` (`not_started`|`in_progress`|`completed`), `video_watched`, `quiz_score`, `quiz_attempts`, `completed_at`, `student_notes` (textarea)
7. **`lesson_quiz_attempts`** — every quiz submission for review
   - `id`, `user_id`, `lesson_id`, `question_id`, `selected_answer_id` (nullable for short answer), `short_answer_text`, `is_correct`, `attempted_at`

**RLS**: Students read/write only their own progress/attempts and only see lessons if they have an active row in `lesson_access`. Admins (via `has_role`) full read on everything.

## Admin section — `src/pages/admin/LessonsAdmin.tsx`

Linked from the existing AdminDashboard. Three tabs:

1. **Curriculum** — Tree view: 24 modules → expand → lessons → expand → questions. Inline create/edit/delete. Each lesson editor has: title, description, YouTube URL (auto-extract video ID + show preview), notes (Textarea). Each question editor: type selector, answers list with "mark correct" toggle, **explanation** field (mandatory).
2. **Student Access** — List of all profiles (reuses existing `profiles` query). Toggle switch per client to grant/revoke access, optional expiration date. Shows "Active" / "Inactive" badge.
3. **Progress Tracking** — Pick a student → see overall % complete, per-module completion, per-lesson quiz scores, all quiz attempts (question + their answer + correct answer + ✓/✗ + explanation), and their personal notes. Bulk export per-student CSV.

## Student section — `src/pages/Lessons.tsx` + `src/pages/LessonView.tsx`

- Linked from ClientPortal with a "DJ Lessons" card (only visible if `lesson_access` row exists for the user).
- **`/lessons`** — module grid showing progress bars, locked icons until granted.
- **`/lessons/:moduleId`** — lesson list with checkmarks for completed.
- **`/lessons/:moduleId/:lessonId`** — embedded YouTube player → "I've watched this" button → quiz appears → submit → results page showing each question with their answer, correct answer, ✓/✗, and the **explanation** of why it's correct. Personal notes textarea (auto-saves) on the side.

## Seed data

Create the 24 modules with sensible DJ curriculum titles (Beginner Basics → Equipment → Beatmatching → Mixing Theory → EQ & Filters → Phrasing → Harmonic Mixing → Loops & Hot Cues → Effects → Genres → Reading the Crowd → Wedding/Event Mixing → Business → etc.). Insert empty placeholder lessons (8–12 per module) so the admin sees the structure and just fills in YouTube URLs + questions. **Admin authors actual content** (videos/questions/explanations) — not auto-generated.

## Files

- **DB migration** for the 7 tables + RLS + indexes.
- **Add**: `src/pages/admin/LessonsAdmin.tsx`, `src/pages/Lessons.tsx`, `src/pages/LessonView.tsx`, `src/components/lessons/CurriculumEditor.tsx`, `src/components/lessons/QuestionEditor.tsx`, `src/components/lessons/StudentAccessManager.tsx`, `src/components/lessons/StudentProgressViewer.tsx`, `src/components/lessons/QuizPlayer.tsx`, `src/components/lessons/YouTubeEmbed.tsx`, `src/hooks/useLessonAccess.ts`.
- **Edit**: `src/App.tsx` (4 new routes), `src/pages/AdminDashboard.tsx` (link to Lessons admin), `src/pages/ClientPortal.tsx` (conditional "DJ Lessons" card).
- **Memory**: add `mem://features/dj-lessons-lms`, update index.

No new npm dependencies — uses existing shadcn (Tabs, Accordion, Card, Switch, RadioGroup, Progress, Textarea, Table) + native YouTube iframe embed.
