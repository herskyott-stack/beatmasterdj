## 1. Show booking packages on the home page

Add a new "Book Your Event" section to `src/pages/Index.tsx` that surfaces the booking packages directly on the landing page (currently users must navigate to `/booking`).

Approach:
- Create a new component `src/components/home/BookingPreview.tsx` that reuses the same `packageData` and category tabs from `src/pages/BookingPage.tsx` (extract shared data to `src/data/packages.ts` so both stay in sync).
- Render the Tabs + package grid identically to `BookingPage`, with the same "Select Package" behavior (adds to cart → navigates to `/checkout`).
- Insert `<BookingPreview />` in `Index.tsx` between `PackagesSection` and the Mentorship teaser (or replace `PackagesSection` if it duplicates content — will confirm during build by reading `PackagesSection.tsx`).
- Include an "Explore all packages" link to `/booking` at the bottom of the section.

Nothing else on the home page changes.

## 2. Email setup status check

Verified current state via the email domain tool:

- **Domain**: `notify.beatmasterdj.ca` — still **Pending** ("Verifying your domain"). All 3 DNS records were detected earlier; Lovable's verifier is still finalizing.
- **Code**: All previously agreed work is already in place — Resend fully removed, contest signup enqueues customer + admin emails immediately, 10-email drip via `send-contest-email` on a 15-min cron, admin DNS status page at `/admin/email-status`, auth email templates scaffolded, all transactional templates (booking, music, event reminder, contest) registered.
- **Blocker**: Delivery is still gated on the domain flipping from Pending → Active. No new code work is required for emails; once the domain verifies, sends will start flowing automatically.

No email code changes will be made in this plan. If verification stays stuck after a few more minutes, next step (separate turn) would be to re-inspect DNS with `dig` and, if needed, click "Rerun Setup" on the admin status page.

## Files touched (build phase)

- `src/data/packages.ts` (new) — shared package data + type
- `src/components/home/BookingPreview.tsx` (new)
- `src/pages/BookingPage.tsx` — import shared data instead of inline
- `src/pages/Index.tsx` — mount `<BookingPreview />`
