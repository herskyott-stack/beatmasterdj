---
name: Cross-Site Sync (Vibe Planner)
description: Additive-only sync of Vibe Planner client music, notes, playlists, timeline, add-ons and files into the BeatmasterDJ admin
type: feature
---

Vibe Planner runs on a **separate** database. It pushes data into BeatmasterDJ via the
`sync-planner-data` edge function (POST, header `x-sync-secret: PLANNER_SYNC_SECRET`).

Landing tables (all read-only in the app, service_role writes only):
`synced_clients` (unique on source_app + external_id, auto-matched to `profiles` by email),
`synced_music`, `synced_notes`, `synced_playlists`, `synced_timeline`, `synced_addons`, `synced_files`
(each unique on synced_client_id + external_id).

**Hard rule: sync is additive only.** Never write to `profiles`, `music_requests`, or any
existing client data from the sync path. Child rows use insert-with-ignoreDuplicates, so
re-syncing never overwrites or deletes. Admin can only relink `synced_clients.profile_id`.

Admin UI: "Synced Planner Data" section inside `ClientDetailModal`
(`src/components/admin/SyncedClientPanel.tsx`). No public pages touched.
