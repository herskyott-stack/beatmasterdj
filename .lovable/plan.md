# Mobile & Desktop Layout Cleanup

## Confirmed problem
On a 393px phone the homepage scrolls sideways (content is 420px wide). The cause is the contest banner at the very top: the four countdown tiles and the "Enter Now" button sit on one row that is wider than the screen, so the button gets pushed half off the right edge. Every other page measured clean at both phone and desktop widths, but several sections still need visual polish.

## What will change

### 1. Contest banner (the off-centre "Enter Now")
- On phone: stack the layout — icon + headline, then the countdown row centred, then a full-width "Enter Now" button underneath.
- Let the countdown tiles shrink and share the row evenly instead of using a fixed minimum width, so four tiles always fit.
- Keep the current single-row desktop layout untouched.

### 2. Global overflow guard
- Add a page-level rule that prevents any element from causing horizontal scroll on small screens, so a future wide element degrades gracefully instead of shifting the whole page.

### 3. Full-site pass (phone + desktop)
Walk every route — home, book, packages, add-ons and add-on detail, mentorship, giveaway and rules, about, contact, install, auth, client portal, booking confirmed, 404 — and correct:
- Sections whose inner content isn't horizontally centred or is missing consistent container padding.
- Headings, stat rows and button groups that clip, wrap awkwardly, or crowd the section above/below on phone.
- Inconsistent vertical rhythm between sections (keep the established large spacing, applied evenly).
- Buttons that should be full-width on phone but currently sit at odd widths.

Admin-only screens get the same overflow check but no restyle.

### 4. Verification
Re-measure every route at 393px and 1280px, confirm no page scrolls sideways, and capture screenshots of the corrected pages.

## Technical notes
- Primary edits: `src/components/contest/ContestBanner.tsx`, `src/components/contest/ContestCountdown.tsx`, `src/index.css` (overflow guard), plus targeted class fixes in page/section components found during the pass.
- Presentation only — no changes to booking, contest, email, or auth logic.
