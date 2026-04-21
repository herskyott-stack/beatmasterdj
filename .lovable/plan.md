

## Admin "Record Mode" for Lessons

A dedicated admin-only studio view where you can go through each lesson exactly like a student, with a side panel for uploading the video for that lesson and a teleprompter-style script generated from the lesson content.

## What you'll get

**New route: `/admin/lessons/record`**
- Sidebar listing all 24 modules → all lessons, with a ✓ badge next to lessons that already have a video uploaded (YouTube ID or `video_file_path`).
- Click any lesson to open it in the main pane.

**Main pane (3-column layout on desktop):**

```text
┌────────────────────┬──────────────────────────┬────────────────────┐
│ Lesson nav         │ Lesson preview (student  │ Record panel       │
│ Module 1           │ view: title, video slot, │ ┌────────────────┐ │
│  • Lesson 1 ✓      │ markdown notes, quiz)    │ │ Teleprompter   │ │
│  • Lesson 2        │                          │ │ (auto-scroll,  │ │
│  • Lesson 3 ✓      │                          │ │ font size +/-) │ │
│ Module 2           │                          │ └────────────────┘ │
│  • …               │                          │ [Upload video]     │
│                    │                          │ [Paste YouTube URL]│
│                    │                          │ [Copy script .txt] │
└────────────────────┴──────────────────────────┴────────────────────┘
```

**Center pane** = exact student rendering (YouTubeEmbed / UploadedVideoPlayer + Markdown notes + QuizPlayer) so you see what students see.

**Right panel:**
1. **Teleprompter** — large, readable script auto-generated from the lesson's `additional_notes` + title + description. Controls: play/pause auto-scroll, speed slider, font-size +/-, mirror toggle (for teleprompter glass).
2. **Video upload** — reuses existing `LessonVideoUploader` (200 MB MP4/WebM → `lesson-videos` bucket).
3. **YouTube URL** — paste field that extracts the ID and saves to `youtube_video_id` (same logic already in `CurriculumEditor`).
4. **Copy script** button — copies the full teleprompter text to clipboard so you can paste into a real teleprompter app.
5. **Download .txt** — saves the script as `Module-X-Lesson-Y.txt`.

**Script generation (no AI call needed — we already have rich `additional_notes`):**
The script is built deterministically from each lesson:
```text
[Intro]
"Welcome back to the Hersky DJ Mentorship. I'm Hersky, and in this lesson —
Module {X}, Lesson {Y}: {title} — we're going to cover {description}."

[Main content]
{additional_notes converted from markdown to spoken plain text:
 - headings become section pauses ("Let's talk about ___")
 - bullet lists become "First, ... Second, ... Third, ..."
 - code/inline formatting stripped
 - sources section trimmed off the end}

[Outro]
"That wraps up this lesson. Hit the quiz below to lock it in,
and I'll see you in Lesson {Y+1}."
```

If a lesson has empty notes, the script falls back to a short outline based on the title only and shows a yellow "thin notes — consider expanding first" warning.

## Access

- Route guarded by `useAdminCheck` — redirects non-admins to `/auth`.
- Entry point: new "Record Mode" button on `/admin/lessons` next to the existing "Preview as student" button.

## Files to create / change

**New**
- `src/pages/admin/LessonsRecordStudio.tsx` — the page.
- `src/components/lessons/admin/RecordSidebar.tsx` — module/lesson tree with upload status.
- `src/components/lessons/admin/Teleprompter.tsx` — auto-scroll script viewer with controls.
- `src/lib/lessonScript.ts` — pure function `buildScript(lesson, module)` that converts markdown notes → spoken script.

**Edited**
- `src/App.tsx` — add `/admin/lessons/record` and `/admin/lessons/record/:lessonId` routes.
- `src/pages/admin/LessonsAdmin.tsx` — add "Record Mode" button.

## No DB changes
Everything reuses existing tables (`lesson_modules`, `lesson_lessons`) and the existing `lesson-videos` storage bucket. No migrations.

## Out of scope (say the word and I'll add)
- In-browser webcam recording (would need MediaRecorder + bigger upload pipeline).
- AI-rewritten conversational scripts (current plan is deterministic from your notes).
- Saving custom edited scripts back to the DB.

