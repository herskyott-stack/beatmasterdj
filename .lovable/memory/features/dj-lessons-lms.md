---
name: DJ Lessons LMS
description: Internal Learning Management System with 24 modules, video+quiz lessons, access control, and per-student progress tracking
type: feature
---
Full LMS at /admin/lessons (admin) and /lessons (students).

**Database tables**: lesson_modules, lesson_lessons, lesson_questions, lesson_answers, lesson_access (controls who can view), lesson_progress (per-user state + notes), lesson_quiz_attempts (full history for review).

**RLS**: students see lessons only when they have an active row in lesson_access; admins see everything via has_role.

**Admin (`/admin/lessons`)** has 3 tabs:
- Curriculum — accordion of 24 modules → lessons → questions; YouTube URL auto-extracts video ID; each question has mandatory explanation field.
- Access — toggle switch per client profile to grant/revoke, optional expiration date.
- Progress — pick a student → see overall %, per-lesson scores, all quiz attempts with their answer + correct answer + ✓/✗ + explanation, plus their personal notes; CSV export.

**Student (`/lessons`)**: locked screen if no access (CTA → /mentorship). Module grid with progress bars → lesson list with checkmarks → lesson view with embedded YouTube, "I've watched" gate, quiz, auto-saving notes sidebar. Pass mark = 70% to mark complete.

**Seed**: 24 starter modules (DJ Fundamentals → Advanced Career), 10 placeholder lessons each. Admin authors actual videos/questions.
