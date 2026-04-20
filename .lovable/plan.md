
Three asks on the LMS at `/admin/lessons`:

1. **"Fix issues in picture"** — no image came through on this message, so I'll need you to re-attach it before I can address that part. I'll proceed with the other two.

2. **Admin can take the course themselves** — currently `/lessons` is locked behind a row in `lesson_access`. I'll update `src/hooks/useLessonAccess.ts` so anyone with the `admin` role auto-passes the gate (no row needed). I'll also add a **"Preview as student"** button on the admin Curriculum tab that opens `/lessons` in a new tab.

3. **Every lesson gets a real DJ video + visual explanation** — there are 24 modules × ~10 lessons = ~240 placeholder lessons. I'll fill every one with:
   - A YouTube link from a known **DJ tutorial channel** (Crossfader, Digital DJ Tips, DJcityTV, Phil Harris, Carlo Atendido, Pioneer DJ, Native Instruments, Serato, DJ TechTools).
   - A 250-400 word **in-depth `additional_notes`** write-up with markdown headings, bullet points, and ASCII/emoji visuals so even when a video is imperfect there's a strong visual/written explanation under the player.

   Method: pull all lessons from the DB → run them through Lovable AI (Gemini) with a strict DJ-only sourcing prompt → bulk-update `lesson_lessons.youtube_url`, `youtube_video_id`, and `additional_notes`.

   Honest caveat: I cannot live-verify every YouTube URL is reachable or perfectly on-topic. The rich notes are the safety net — every lesson will look complete in the student view either way, and you can swap any URL from the Curriculum editor in seconds.

## Files / changes
- `src/hooks/useLessonAccess.ts` — bypass for admin role.
- `src/components/lessons/CurriculumEditor.tsx` (or `src/pages/admin/LessonsAdmin.tsx`) — add "Preview as student" button linking to `/lessons`.
- DB data update — populate `youtube_url`, `youtube_video_id`, `additional_notes` for every row in `lesson_lessons` (data only, no schema change).

## Question before I start
Please re-upload the screenshot for item #1, or tell me to skip it and just do items #2 and #3.
