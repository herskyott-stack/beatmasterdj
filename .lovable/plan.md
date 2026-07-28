## Fix cramped spacing between hero stats and contest banner (mobile)

The circled area on the home page shows the hero stats (500+/15+/97%) sitting flush against the contest banner with no breathing room, and the "Satisfaction Rate" text getting clipped at the right edge on 360px screens.

### Changes

**1. `src/components/HeroSection.tsx`**
- Add bottom padding to the section (`pb-16 md:pb-24`) so stats don't crash into the next section.
- Tighten the stats grid on mobile: reduce `gap-8` → `gap-4 md:gap-8` and shrink stat values on mobile (`text-2xl md:text-4xl`) so "97%" + "Satisfaction Rate" no longer clip at 360px.
- Reduce top margin of stats (`mt-16` → `mt-12 md:mt-16`).

**2. `src/components/contest/ContestBanner.tsx`**
- Increase vertical padding (`py-10 md:py-14` → `py-12 md:py-16`) and ensure the sparkle icon + text stack has clear spacing from the hero above.

**3. `src/pages/Index.tsx`**
- No structural change, but verify the flow hero → contest → booking has consistent rhythm (all sections use matching `py-*`).

### Out of scope
No color, copy, or component logic changes — spacing/typography only.
