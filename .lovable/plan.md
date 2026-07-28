## Problem
`src/pages/Index.tsx` renders both `BookingPreview` (packages with tabs) and `PackagesSection` (same packages with tabs). Users see the identical package grid twice on the home page.

## Fix
Remove the duplicate `PackagesSection` from the home page. Keep `BookingPreview` since it's the newer interactive booking version and links out to the full `/book` page.

### Changes to `src/pages/Index.tsx`
- Remove `import PackagesSection from "@/components/PackagesSection"`
- Remove `<PackagesSection />` from the `<main>` render

No other files touched. `PackagesSection` component stays in the repo (still used on `/packages` route if applicable) — only the home-page duplicate is removed.