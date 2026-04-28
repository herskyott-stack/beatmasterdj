## Two small polish changes

### 1. Hover glow on package cards

**File:** `src/pages/PackagesPage.tsx` (the package card `className`, around lines 595-599)

Right now non-selected, non-featured cards only do `hover:scale-[1.02]` — no glow. I'll add a gold glow + subtle border tint on hover so every package "lights up" when the cursor is over it (separate from the persistent gold ring that appears once you actually click/select it).

Updated `className` for the card:
```tsx
className={`relative transition-all duration-500 cursor-pointer ${
  isSelected
    ? "scale-[1.04] ring-2 ring-primary shadow-[0_0_50px_hsl(var(--primary)/0.45)]"
    : "hover:scale-[1.02] hover:shadow-[0_0_35px_hsl(var(--primary)/0.35)] hover:ring-1 hover:ring-primary/50"
} ${pkg.featured && !isSelected ? "lg:-mt-4 lg:mb-4" : ""}`}
```

Behavior:
- Hover any card → soft gold glow + thin gold ring (same color family as the "selected" state but lighter).
- Click a card → upgrades to the full bright gold ring + bigger glow + scale bump (existing behavior).
- "Most Popular" card keeps its gold `featured` variant + badge.

### 2. Add-on "continuing page" — already wired, just confirming routes

Good news: the add-on detail page already exists from the previous change. I'll verify all paths to it actually work end-to-end, since the previous update touched several entry points:

- `/addons/:addonId` route is registered in `src/App.tsx`.
- `src/pages/AddonDetailPage.tsx` renders: hero image + price, long description, What's Included, Perfect For, Logistics, FAQ accordion, and an "Add to Booking / Remove from Booking / Checkout / Ask a Question" CTA block.
- Home page `AddonsSection` cards are wrapped in `<Link to="/addons/:id">` (or `/contact` for Custom).
- Booking flow `BookingAddons` cards have a small "Details" link → `/addons/:id`.
- Data lives in `src/data/addons.ts`.

What I'll do for this part:
- Spot-check that every `addon.id` in `src/data/addons.ts` resolves to a working detail page (no broken IDs) and that the "Custom Add-On" card correctly redirects to `/contact` instead of a dead detail page.
- Make the "Back to Add-ons" button on the detail page reliably scroll to the home `#addons` section (it currently uses `to="/#addons"` which works thanks to the existing `ScrollToTop` setup — I'll confirm and only adjust if it doesn't land you on the section).

If anything is missing (e.g., an add-on entry without long-form copy, or a detail link that 404s), I'll fix it inline — no new routes or DB changes needed.

## Out of scope (say the word and I'll add)
- Animated glow pulse on hover (currently a static glow on hover).
- Different glow color per category (e.g. lavender for private, gold for weddings).
- Photo galleries / video on add-on detail pages beyond the single hero image.
- Persisting the selected package between visits.
