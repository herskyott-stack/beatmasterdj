
Add file upload capability to the admin LMS so you can attach supporting materials (PDFs, images, audio, slides, etc.) to lessons. Files persist in storage and stay attached after refresh.

## Scope

**Per-lesson file attachments** in the Curriculum editor. Each lesson can have multiple files (cheat sheets, sample tracks, slide decks, reference images). Students with access see them on the lesson page as a downloadable "Resources" list.

## Database

New table `lesson_files`:
- `id`, `lesson_id` (FK), `file_name`, `file_path` (storage key), `file_size`, `mime_type`, `uploaded_by`, `created_at`

RLS:
- Admins: full ALL
- Granted students: SELECT only (via `has_lesson_access`)

## Storage

New private bucket `lesson-files` (not public — served via signed URLs).

Storage RLS policies on `storage.objects`:
- Admin INSERT/UPDATE/DELETE on `lesson-files`
- Admin + granted students SELECT on `lesson-files`

## UI changes

**`CurriculumEditor.tsx`** — under each lesson editor, add a "Resources" panel:
- Drag-and-drop / file picker (multi-file, 20 MB cap each)
- Upload progress indicator
- List of attached files with name, size, delete button, and download link
- Files save immediately to storage + `lesson_files` row on upload (no separate "save" click needed)

**`LessonView.tsx`** (student) — add a "Resources" card above the quiz showing each file with a download button (uses signed URL via `supabase.storage.from('lesson-files').createSignedUrl`).

**New component**: `src/components/lessons/LessonFilesManager.tsx` (admin upload UI) and `src/components/lessons/LessonFilesList.tsx` (student-facing list).

## Files

- **Migration**: create `lesson_files` table + RLS, create `lesson-files` storage bucket + storage RLS policies
- **Add**: `src/components/lessons/LessonFilesManager.tsx`, `src/components/lessons/LessonFilesList.tsx`
- **Edit**: `src/components/lessons/CurriculumEditor.tsx` (mount manager per lesson), `src/pages/LessonView.tsx` (mount student list)

No new dependencies — uses native `<input type="file">` and Supabase Storage SDK already imported.
