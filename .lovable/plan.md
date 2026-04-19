
User wants the page transition FX (currently `TapeWipe` — a tape/swipe wipe that plays on every route change) to **cycle through different FX styles** instead of always being the same swipe.

## Current state
`src/components/fx/TapeWipe.tsx` (already mounted in `FXLayer`) plays the same wipe animation every time `useLocation().pathname` changes.

## Plan
Refactor `TapeWipe.tsx` into a **`PageTransitionFX.tsx`** component that randomly picks one of 6 transition styles on each route change, so every navigation feels fresh.

### The 6 transitions
1. **Tape Wipe** — current diagonal gold/rose swipe (kept).
2. **Vinyl Spin Out** — full-screen vinyl record spins in from center, scales out.
3. **Equalizer Bars** — vertical neon bars rise from bottom, cover screen, drop back.
4. **Glitch RGB Split** — quick red/blue channel split flash with scanlines.
5. **Beat Drop Flash** — radial gold burst from center (like a bass hit).
6. **Curtain Reveal** — two halves (top + bottom) slam together then retract.

### Implementation
- Single new file `src/components/fx/PageTransitionFX.tsx` containing all 6 variants as inline styled divs/SVGs, each ~600ms.
- On `pathname` change: pick `Math.floor(Math.random() * 6)` (avoid repeating the last index), render that variant for its duration, then unmount.
- Gated by `fxEnabled` from `FXContext` (same as today).
- Add the keyframes used by the new variants (`vinyl-spin-out`, `eq-rise`, `glitch-flash`, `beat-flash`, `curtain-slam`) to `src/index.css`.
- Update `src/components/fx/FXLayer.tsx` to swap `TapeWipe` for `PageTransitionFX`.
- Delete `TapeWipe.tsx` (logic absorbed).

### Files
- **Add**: `src/components/fx/PageTransitionFX.tsx`
- **Edit**: `src/components/fx/FXLayer.tsx`, `src/index.css`
- **Remove**: `src/components/fx/TapeWipe.tsx`

No new dependencies. Pointer-events disabled on overlay so it never blocks clicks.
