
Three features. Let me scope cleanly.

## 1. Homepage Media Gallery (admin-uploaded)

**New table** `home_media`: id, type ('image'|'video'), file_path, title, caption, display_order, created_at, uploaded_by.
**New storage bucket** `home-media` (public, 50 MB cap for video).
**RLS**: anyone can SELECT; only admins INSERT/UPDATE/DELETE.

**Admin tab** in `/admin` (new tab "Home Media"):
- Upload images (jpg/png/webp) or videos (mp4/webm)
- Title + caption fields, drag-to-reorder
- Delete per item, preview thumbnails

**Homepage** (`Index.tsx`): new `<FeaturedGallery />` section between Services and Packages. Only renders if `home_media` has rows. Layout: masonry grid for images (3-col desktop, 1-col mobile), videos play inline with controls, lightbox on click. Gold border + glass card styling to match brand.

## 2. Lesson Videos — Already Exists + Polish

Lessons already have `youtube_url` field + working YouTube embed. The pain point you described is *uploading* videos. Two paths:

- **YouTube (current)**: paste URL → auto-embeds. Easy, free, no storage cost. Already works.
- **NEW: Direct video upload**: extend `lesson-files` bucket to accept video, OR add new `lesson_video_path` column on `lesson_lessons`. Player plays uploaded MP4 if present, falls back to YouTube.

I'll add **direct upload** to the curriculum editor:
- New "Upload video file" button in each lesson row (max 200 MB)
- Stored in existing `lesson-files` bucket under `videos/{lesson_id}/`
- Player in `LessonView` prefers uploaded file over YouTube
- Delete button right next to it

For the **"write a paragraph with pictures and arrows"** fallback — that's the existing `additional_notes` field + the `LessonFilesManager` (already supports image uploads). I'll just make it more obvious in the editor with a clear section label "No video? Write a guide here →".

## 3. Module Descriptions + Per-Module Quiz

For all 24 modules:
- AI-generate a 1-paragraph description (4-6 sentences, brand tone) → write to `lesson_modules.description`
- Generate a 5-question multiple-choice quiz per module covering the paragraph

**Quiz storage**: I'll add a special "module overview" lesson at `lesson_number = 0` for each module (or use `quiz_group = 0`) holding the paragraph as `additional_notes` and 5 questions in `lesson_questions`. Student sees it as "Module Intro & Quiz" at top of each module on `/lessons`.

This is a one-time AI generation pass via Lovable AI (`google/gemini-2.5-flash`). I'll do all 24 in one run.

## Files

**New**
- migration: `home_media` table + RLS + `home-media` bucket
- migration (optional): add `video_file_path` column to `lesson_lessons`
- `src/components/admin/HomeMediaManager.tsx`
- `src/components/home/FeaturedGallery.tsx`

**Edited**
- `src/pages/AdminDashboard.tsx` — add "Home Media" tab
- `src/pages/Index.tsx` — render `<FeaturedGallery />` conditionally
- `src/components/lessons/CurriculumEditor.tsx` — add direct video upload + clearer "no video?" guide section
- `src/pages/LessonView.tsx` — prefer uploaded video over YouTube
- `src/integrations/supabase/types.ts` — auto-regenerated

**Data writes**
- 24 module descriptions
- 24 × 5 = 120 quiz questions + answers

## Caveats
- Direct video uploads >200 MB will be rejected (Supabase storage practical limit for browser uploads)
- AI-generated quizzes need your review — easy to edit in the existing curriculum editor
- The runtime error showing in preview is from a browser extension, not the app — I'll ignore it

Approve and I'll build all 3 in one pass.
