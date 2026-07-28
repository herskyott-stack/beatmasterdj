// Legacy shim — real contest state now lives in DB (contest_settings) via useContestSettings.
// Kept only for BookingConfirmed's "good luck" nudge, which does a fast client-side check.
const FALLBACK_END = new Date("2026-10-01T03:59:59Z");
export const isContestActive = () => Date.now() < FALLBACK_END.getTime();
