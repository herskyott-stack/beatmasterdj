---
name: Cross-Site Sync (Vibe Planner)
description: Two-way additive sync between Vibe Planner and BeatmasterDJ clients/music via sync-planner-data (inbound) and push-to-planner (outbound)
type: feature
---

Vibe Planner runs on a **separate** project. Sync is **two-way** and **additive-only**
(creates + updates propagate; nothing is ever deleted in either direction).

**Inbound (Vibe Planner → BeatmasterDJ):** `sync-planner-data` edge function
(POST, header `x-sync-secret: PLANNER_SYNC_SECRET`). Upserts `synced_clients`
(source_app + external_id) and child tables — upsert WITHOUT ignoreDuplicates so
edits in Vibe Planner update rows here. Auto-matches `profiles` by email (read-only).

**Outbound (BeatmasterDJ → Vibe Planner):** DB triggers `push_client_to_planner`
(on `profiles`; skips pure payment/pipeline edits) and `push_music_to_planner`
(on `music_requests`, matched via `profiles.user_id`) call the `push-to-planner`
edge function via pg_net, which POSTs to `VIBE_PLANNER_SYNC_URL` with the same
`PLANNER_SYNC_SECRET` plus `x-sync-source: beatmasterdj` so the receiver never
re-pushes (loop prevention). Both triggers swallow errors — sync failures never
block a save. Trigger functions have EXECUTE revoked from all API roles.

**Hard rules:** inbound sync never writes `profiles`/`music_requests`; no deletes
either way; both directions keyed on stable external_ids.

Admin UI: "Vibe Planner Import" tab on /admin (`PlannerImportPanel.tsx`) and
"Synced Planner Data" section in `ClientDetailModal` (`SyncedClientPanel.tsx`).
