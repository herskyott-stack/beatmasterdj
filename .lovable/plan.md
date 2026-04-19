
You want:
1. Move the tempo fader back to the **right** edge (where it originally was).
2. Remove whatever colorful/effect sliding bar is currently on the right.

Looking at `FXLayer.tsx`, the only right-side element is the tempo fader itself (which I moved to the left last turn). There's no other right-side bar component active. The "effects" you're seeing on the right is likely the `GlowTrail` or particle FX following the cursor, but most likely you're referring to the tempo fader's current glow/shadow styling vs. wanting the cleaner original right-side placement.

## Plan

**Edit `src/components/fx/WaveformProgress.tsx`:**
- Change `left-1.5` back to `right-1.5` so the tempo fader returns to the right edge.
- Keep `hidden md:flex` so it stays desktop-only.
- Keep all existing CDJ tempo-fader styling (ticks, thumb, pitch label) — that's the version you approved.

**No other components need changes** — `EqualizerBars` and `SpectrumStrip` are already removed from `FXLayer.tsx`. There is no separate right-side colorful bar in the code; the tempo fader IS the only right-edge element, and moving it back to the right satisfies "swap them with the tempo bar I had given you prior."

## Files
- Edit: `src/components/fx/WaveformProgress.tsx` (one-line position change: `left-1.5` → `right-1.5`)
