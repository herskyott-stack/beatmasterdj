/**
 * Shared labels for the client music-request / Vibe Planner workflow.
 * Keeps the wording customers see in the portal and the wording Jake sees
 * in the admin in sync. UI/workflow copy only — no data changes.
 */

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  priority: "Priority",
  additional: "Additional",
  do_not_play: "Do Not Play",
};

export const REQUEST_TYPE_DESCRIPTIONS: Record<string, string> = {
  priority:
    "Must-play songs for special moments — first dance, grand entrance, bouquet toss. Add a note to each one so we know when it happens.",
  additional:
    "Songs you love for the party and open dancing. We'll mix these in through the night.",
  do_not_play:
    "Songs you never want to hear. We guarantee these won't be played — no exceptions.",
};

export const EMPTY_LIST_COPY: Record<string, { title: string; body: string }> = {
  priority: {
    title: "No priority songs yet",
    body: "Add your must-plays above — these are the songs that make the night yours.",
  },
  additional: {
    title: "No extra songs yet",
    body: "Add party favourites above and we'll weave them into the night.",
  },
  do_not_play: {
    title: "Nothing on your do-not-play list",
    body: "Totally fine — add any songs you want banned and we'll never play them.",
  },
};

export const requestTypeLabel = (
  requestType: string | null | undefined
): string => REQUEST_TYPE_LABELS[requestType ?? ""] ?? (requestType || "General");

/** Turns a raw source_app slug (e.g. "vibe-planner") into a human label. */
export const sourceAppLabel = (sourceApp: string | null | undefined): string => {
  if (!sourceApp) return "Planner app";
  const known: Record<string, string> = {
    "vibe-planner": "Vibe Planner",
    vibe_planner: "Vibe Planner",
    planner: "Vibe Planner",
  };
  if (known[sourceApp]) return known[sourceApp];
  return sourceApp
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/** Friendly date, or null when missing. Returns the raw string if unparseable. */
export const formatEventDate = (
  dateStr: string | null | undefined
): string | null => {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? dateStr : parsed.toLocaleDateString();
};
