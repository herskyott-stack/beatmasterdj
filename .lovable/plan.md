
Add "DJ Mentorship" as the 8th service card on the homepage Services grid, linking to `/mentorship`. Generate a brand image for it.

## Changes

**1. Generate image** `src/assets/services/mentorship.jpg`
Use Lovable AI image gen (google/gemini-3.1-flash-image-preview) to create: a DJ instructor wearing a black t-shirt with "HERSKY DJ & AV" text in gold, teaching a student at a Pioneer DJ controller in a warmly-lit studio. Cinematic, gold/amber lighting to match brand palette.

**2. `src/components/ServicesSection.tsx`**
- Import `mentorshipImg` and `GraduationCap` (already imported elsewhere — verify).
- Append 8th entry to `services` array:
  - icon: `GraduationCap`
  - title: "DJ Mentorship"
  - description: "1-on-1 weekly lessons with a working pro DJ. Hobbyist to Pro Entrepreneur tracks."
  - color: `text-primary`
  - gradient: `from-primary/20 to-secondary/20`
  - route: `/mentorship`
  - image: mentorshipImg
- Remove the special `index === 4` col-span hack (with 8 cards the 3-col grid balances naturally: 3+3+2, or change to make last row centered). Simpler: drop the conditional so all cards are uniform.

**3. `src/pages/Index.tsx`** (homepage)
- The dedicated mentorship teaser card between Packages and Addons becomes redundant once mentorship is in Services. Keep it OR remove it — I'll **keep** it (it's a stronger CTA with pricing) but you can tell me to remove.

## Files touched
- `src/assets/services/mentorship.jpg` (new, AI-generated)
- `src/components/ServicesSection.tsx` (add card, drop col-span hack)

That's it — `/mentorship` route already exists.
