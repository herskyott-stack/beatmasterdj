## Contest System — full rebuild (additive)

Rebuilds the contest as a proper two-step flow at `/giveaway` with DB-driven settings, admin controls, and auto-stop. Nothing else on the site changes except the banner already on the homepage (repointed to `/giveaway`).

### 1. Database (migration)

New tables + columns, all with RLS:

- `contest_settings` (single row seeded): `contest_name`, `start_date`, `end_date` (default 2026-09-01 23:59 America/Toronto), `auto_stop_enabled`, `winner_entry_id`, `announcement_date`. Public SELECT, admin-only UPDATE. Status derived in code from dates + auto-stop.
- `contest_event_inquiries`: `entry_id`, `event_type`, `event_date`, `venue_location`, `guest_count`, `special_requests`, `interested_package_id`, `interested_package_name`, `interested_package_price`. Anon INSERT, admin SELECT/UPDATE/DELETE.
- Extend `contest_entries` with: `agreed_to_rules`, `event_inquiry_id`, `bonus_followed_instagram`, `bonus_shared_story`, `bonus_tagged_account`, `bonus_verified`, `instagram_handle`. Add UNIQUE(lower(email)). Add public UPDATE-by-id-only policy scoped to bonus columns so a fresh entrant can submit their bonus form (guarded by row id returned at insert).

### 2. Public pages

- `/giveaway` (new route; keep `/contest` alias redirecting here):
  - Live countdown pulled from `contest_settings.end_date`.
  - Step 1: name, email, phone, rules checkbox. Duplicate email → friendly "Looks like you're already entered — good luck!".
  - Step 2 (same page, no reload): event type, event date (must be future), venue, guest count, special requests, **package selection with ALL packages from the site catalog** (weddings, corporate, schools, private — full list from `PackagesPage`).
  - Confirmation: gold checkmark + "Your entry has been received — good luck!" + bonus entries section (3 IG checkboxes + IG handle input), saves to entry.
  - Autosave form state to `localStorage` on every change; restore on mount.
  - When status is closed → tasteful "This contest has ended" screen.
- `/giveaway/rules` (new route; keep `/contest-rules` alias): rules rewritten plain-language, dates pulled live from settings, includes bonus-verification note.
- Homepage banner: keep existing component, repoint CTA to `/giveaway`, and hide when settings say closed (already driven by dates).

### 3. Admin

- `/admin/contest` dashboard:
  - Status pill (Active/Closed + days remaining).
  - Stat cards: total entries, bonus claimed, bonus verified, total tickets in draw (1 base + 3 if all 3 IG boxes AND `bonus_verified`).
  - Entries table with search/sort, row click opens full detail incl. linked inquiry.
  - Per-row "Verify bonus" toggle.
  - CSV export (all fields incl. inquiry).
  - "Pick Winner" random weighted draw (tickets 1 or 4), confirm before save, redraw option, sets `is_winner` + `winner_entry_id`, triggers existing `send-contest-email` with `type: "winner"`.
- `/admin/contest/settings` new page: edit name/start/end/announcement, auto-stop toggle, "Close contest now" button.

### 4. Auto-stop

All UI reads `contest_settings` at runtime via a small hook (`useContestSettings`) — no hardcoded date in components. `isActive = auto_stop_enabled ? (now in [start,end]) : true` combined with a manual override (setting `end_date` to past = closed).

### 5. Edge function

Extend `submit-contest-entry` to accept optional inquiry payload + package, insert the inquiry row, link `event_inquiry_id`, and return the new entry id so the client can PATCH bonus fields. Keep honeypot + rate-limit.

### Technical notes
- Backend = Lovable Cloud (Supabase). Tables include GRANT + RLS per project rules.
- Bonus update RLS: allow anon UPDATE on `contest_entries` **only** for columns `bonus_*` and `instagram_handle`, matched by row id (using column list grant + trigger that reverts protected fields).
- Timezone: store UTC, display via `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto' })`.
- Mobile: sticky bottom CTA on `/giveaway` forms at ≤640px.
- No changes to unrelated pages, nav, or styling.
