
Add a new **DJ Mentorship** section to the site with the two-track pricing structure and an Apply Now flow.

## Scope
- New page **`/mentorship`** (follows the project's "dedicated routes, never anchors" rule).
- Add navigation link in `Navbar` (desktop + mobile menu) and a Footer link.
- Add a card/teaser on the homepage (below `PackagesSection`) linking to the page.

## Page structure: `src/pages/MentorshipPage.tsx`

1. **Hero** — "DJ Mentorship Programs" headline, sub-copy about turning passion into a career, two CTAs: "View Pathways" / "Apply Now".

2. **Track Toggle** — A sleek `Switch`-style toggle at the top: **"I Have My Own Gear"** ↔ **"I Need Gear"**. Default: "Have Gear". State managed via `useState`. Toggle styled to match brand (gold/rose pills, not the raw shadcn switch).

3. **Pathways grid** — 3 cards per track (Hobbyist / Performer / Pro Entrepreneur), middle card "featured" (Performer) with "Most Popular" badge. Each card shows:
   - Pathway name + tagline
   - Price (large, gradient text) + "/month"
   - Duration badge
   - Goal, Focus, Outcome (or Setup/Benefit for All-In)
   - "Apply for this Pathway" button → scrolls to Apply form with pathway pre-selected

4. **What's Included / Why Choose Us** — short trust strip (4 icons): Industry-Standard Gear, 1-on-1 Weekly Sessions, Real Gig Prep, Business & Marketing Coaching.

5. **Apply Now form** (anchor `#apply` on same page, server-backed):
   - First name, Last name (stack on mobile)
   - Email, Phone
   - Age (number) — flag if under 18 → optional parent/guardian name + email
   - Current skill level: radio (`Complete Beginner`, `Some Experience`, `Intermediate`, `Advanced`)
   - Gear status: radio (`I own a controller`, `I need gear provided`) — auto-syncs with the toggle
   - Pathway interested in: select (6 options, pre-filled from card click)
   - Music genres of interest: multi-checkbox (House, Hip-Hop, EDM, Top 40, Latin, Other)
   - Goals (textarea, 500 char limit)
   - Preferred start month
   - Submission via `FormSubmit.co` (matches existing project pattern in `mem://tech/form-submission`) routed to `hersky.ott@gmail.com`.
   - Validate with **zod** (per project security standard): trimmed strings, email format, max lengths.

6. **FAQ accordion** (4–5 Qs): Do I need gear to start? Where are lessons held? Are sessions in-person or online? Refund policy? Do you teach kids?

## Pricing data
Hardcoded in the page file, structured as:
```ts
const tracks = {
  haveGear: [Hobbyist $400, Performer $375 (featured), Pro $350],
  needGear: [Hobbyist $525, Performer $495 (featured), Pro $485],
}
```
Pro "Need Gear" card highlights "Pro DJ controller included — yours to keep".

## Other touches
- Reveal-on-scroll using existing `useRevealOnScroll` hook.
- Glass cards matching `PackagesSection` style.
- Mobile: cards stack single-column, toggle full-width, form inputs full-width.
- Add `<Route path="/mentorship" element={<MentorshipPage />} />` to `App.tsx`.
- Add memory entry `mem://features/mentorship-program` documenting the two tracks + pricing, and update `mem://index.md`.

## Files
- **Add**: `src/pages/MentorshipPage.tsx`
- **Edit**: `src/App.tsx` (route), `src/components/Navbar.tsx` (nav link), `src/components/Footer.tsx` (footer link), `src/pages/Index.tsx` (teaser card), `mem://index.md`
- **Add memory**: `mem://features/mentorship-program`

No new dependencies (zod, react-hook-form, FormSubmit.co already in use).
