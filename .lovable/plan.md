
User wants the colorful green/yellow/red vertical bar on the right (the custom-styled scrollbar) replaced by the tempo fader. So: move tempo fader to the right edge (it's already there) and hide/remove the colorful scrollbar styling so the tempo fader takes that spot cleanly.

Plan:
1. Remove the custom green/yellow/red `::-webkit-scrollbar-thumb` gradient in `src/index.css` — revert to a subtle neutral scrollbar (or hide it) so the colorful bar is gone.
2. Keep the tempo fader on the right edge where it already sits (`right-1.5`), so it visually replaces the colorful bar.

## Changes

**`src/index.css`** — replace the colorful scrollbar thumb gradient with a slim neutral thumb (`hsl(var(--muted))`) so the right edge is clean and the tempo fader is the only colorful element there.

**`src/components/fx/WaveformProgress.tsx`** — no change needed; already on right edge.

That's it. One file edited.
