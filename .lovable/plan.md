## Goal

Give you a live DNS checklist in the admin area for `notify.beatmasterdj.ca`, then verify the full contest email pipeline (immediate customer + admin emails on signup, plus the automated drip) works the moment DNS goes green.

## Current state (verified)

- Sender domain `notify.beatmasterdj.ca` exists but is **pending** — the 3 DNS records (1 TXT `_lovable-email` + 2 NS on `notify`) are not detected yet.
- `submit-contest-entry` already enqueues both customer (`contest-confirmation`) and admin (`contest-admin-notification`) emails immediately on signup via the free internal queue.
- pg_cron job `contest-drip-followups` runs every 15 min and calls `send-contest-email` with `run_followups` — day 1/3/7/14/21/30/45 drip is wired.
- Recent `process-email-queue` logs show sends failing with `403 domain_not_verified` — confirming the ONLY blocker is DNS at the registrar.

## Plan

### 1. Admin DNS Status page (`/admin/email-status`)

New page + edge function that does live DNS-over-HTTPS lookups (Cloudflare `1.1.1.1/dns-query`) so you see real propagation, not cached state:

- New edge function `check-dns-status` (admin-only, JWT + `has_role` check):
  - Queries TXT `_lovable-email.beatmasterdj.ca` → expects `lovable_email_verify=2b7b3e1a…`
  - Queries NS `notify.beatmasterdj.ca` → expects `ns3.lovable.cloud` and `ns4.lovable.cloud`
  - Returns `{ txt: {found, value, ok}, ns: {found[], ok}, allGreen }`
- New page `src/pages/admin/EmailStatus.tsx`:
  - 3-row checklist with ✅/❌ per record, expected value shown, "Copy" button
  - "Re-check now" button + auto-refresh every 30s until all green
  - Once `allGreen`, unlocks a **"Send test emails"** panel with two buttons:
    - **Send to customer test** → prompts for an email, enqueues `contest-confirmation`
    - **Send to admin** → enqueues `contest-admin-notification` to `hersky.ott@gmail.com`
  - Live tail of the last 10 rows from `email_send_log` (deduped by `message_id`) with status badges
- Add route in `App.tsx` and a "DNS & Email Status" link in `AdminDashboard.tsx`.

### 2. Guarantee immediate signup emails

`submit-contest-entry` already fires both emails — I'll harden it so you can trust "immediately":

- Return the two enqueue results in the response so the client shows a real success/warning toast.
- On the giveaway success screen, add a one-line note: "A confirmation is on its way to <email>."
- Log every enqueue to `email_send_log` with `message_id = contest-confirmation-<entry_id>` (idempotency key already in place — verifying it lands as a row).

### 3. End-to-end verification (once DNS is green)

I'll run this from the admin page + query `email_send_log`:

1. Submit a real entry via the giveaway form using a test email you provide (or `hersky.ott+test@gmail.com`).
2. Confirm within seconds: customer row `status=sent`, admin row `status=sent`.
3. Manually invoke `send-contest-email` with `{type:"run_followups"}` to prove the drip path also sends (won't actually send anything for the fresh entry — the day-1 cutoff prevents that — but I'll temporarily backdate the test row's `created_at` to trigger `day_1`, then reset it).
4. Report back the exact `email_send_log` rows.

### 4. What you still need to do (one-time, ~5 min)

Only DNS at your registrar for `beatmasterdj.ca`. The admin page tells you exactly which of the 3 records is missing at any moment — no guessing.

## Technical notes

- DNS lookup via `https://cloudflare-dns.com/dns-query` with `Accept: application/dns-json` — no dependencies, works from Deno.
- Admin gate: `check-dns-status` verifies JWT and calls `has_role(auth.uid(), 'admin')` server-side; page also gated by `useAdminCheck`.
- Test-send buttons reuse existing `send-transactional-email` — no new sending path.
- `config.toml` gets `[functions.check-dns-status] verify_jwt = true`.

## Out of scope

- Cannot bypass DNS verification — the email provider rejects unverified domains at the API. The admin page makes the remaining step self-serve and observable; it can't skip it.
