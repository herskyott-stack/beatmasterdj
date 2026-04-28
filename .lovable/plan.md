## Two improvements

### 1. Click a package card → it lights up (selection state)

**File:** `src/pages/PackagesPage.tsx`

Right now only the `featured` (Most Popular) package gets the gold "lit" treatment with the `featured` Card variant + ring. Clicking "Select Package" immediately sends you to checkout with no visual confirmation.

**Change:** Track a locally-selected package and highlight it. Then "Select Package" on the highlighted card adds to cart + navigates.

- Add `const [selectedName, setSelectedName] = useState<string | null>(null)`
- Clicking anywhere on a card (or a new "Select" toggle) sets `selectedName = pkg.name`
- The selected card gets:
  - `variant="featured"` styling override (gold gradient border + glow)
  - An extra ring: `ring-2 ring-primary shadow-[0_0_40px_hsl(var(--primary)/0.4)]`
  - Slight scale bump
- The "Most Popular" badge still only shows on `pkg.featured` (unchanged)
- Button label becomes "Continue to Checkout" when selected, "Select Package" otherwise
- Clicking the button when selected → existing `handleSelectPackage` flow (add to cart + navigate)
- First click selects, second click checks out — prevents accidental cart adds

This makes any clicked package light up like the recommended one, while keeping the "Most Popular" star badge for `Classic`, `Professional`, etc.

### 2. Add-ons get dedicated detail pages

**New route:** `/addons/:addonId` → new page `src/pages/AddonDetailPage.tsx`

**Files touched:**
- New: `src/pages/AddonDetailPage.tsx`
- New: `src/data/addons.ts` (extract shared addon data so both Home `AddonsSection` and the detail page read from one source)
- Edit: `src/components/AddonsSection.tsx` — wrap each card in a `<Link to={/addons/${addon.id}}>` and change "Add to Package" → "Learn More"
- Edit: `src/components/BookingAddons.tsx` — add a small "Details" link below each card pointing to `/addons/:id` (keep existing Add/Remove behavior intact)
- Edit: `src/App.tsx` — register the new route

**Addon data shape (in `src/data/addons.ts`):**

```ts
{
  id: "cold-sparklers",
  name: "Cold Sparklers",
  price: 300,
  priceDisplay: "$300",
  shortDescription: "...",      // current 1-liner
  longDescription: "...",       // 2-3 paragraph deep dive
  whatsIncluded: string[],      // bullet list
  perfectFor: string[],         // event types
  technicalDetails: string[],   // setup time, power needs, safety, etc.
  faq: { q: string; a: string }[],
  image: ...,
  icon: ...,
  popular: boolean,
}
```

**Detail page layout:**
```text
[ Back to Add-ons ]
[ Hero image w/ overlay title + price ]
[ Long description ]
[ What's Included | Perfect For ]   (two-column on desktop)
[ Technical / Logistics ]
[ FAQ accordion ]
[ Sticky-ish CTA: "Add to Booking" → adds via CartContext + toast ]
[ "Back to Packages" + "Contact Us" buttons ]
```

Uses existing primitives: `Card`, `Button`, `Accordion`, `Navbar`, `Footer`. Same gold/lavender theme. No new dependencies.

**Detailed copy will be written for all 7 add-ons:**
Cold Sparklers, Photo Booth (No Prints), Photo Booth (Unlimited Prints), Extra Hours, Karaoke Package, Dry Ice Effects, Custom Add-On (Custom routes to `/contact` instead of a detail page).

## Out of scope (say the word and I'll add)
- Persisting "selected package" across page reloads
- A comparison view (side-by-side package compare)
- Real photos for each add-on detail page beyond the existing thumbnail
- Editing add-on copy through the admin dashboard
