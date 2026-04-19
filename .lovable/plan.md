
User wants the page transition FX to feel **professional** (think Apple/Stripe/Linear/Awwwards-tier studio sites), not loud arcade/club effects. The current 6 are too gimmicky: glitch RGB, EQ bars, vinyl spin, beat flash, curtain slam — all read as "club kid demo," not "premium AV production company."

## Direction
Replace the 6 loud variants with **4 refined, cinematic transitions** — slower easing, subtle gradients, monochrome-to-brand color, no shaky/glitchy motion. Inspired by editorial/agency sites. All ~700–900ms with cubic-bezier `(0.65, 0, 0.35, 1)` (Apple's standard ease).

## The new 4 variants

1. **Sheen Sweep** — A single soft diagonal gradient sheen (subtle gold→transparent) sweeps across once. Low opacity (~0.3), blurred edges. Feels like light catching on glass.

2. **Iris Reveal** — A solid dark panel covers the screen, then a circular mask opens from center outward, revealing the new page. Smooth, cinematic — like a camera shutter.

3. **Slide Veil** — A single thin panel (background color with subtle gradient + 1px primary top border) slides up from bottom past the viewport. Clean, editorial.

4. **Fade Bars** — Three horizontal bands (top/middle/bottom) fade in then out in sequence with slight stagger. Minimal, premium.

## What's removed
- Vinyl spin out (too loud)
- EQ bars (too club)
- Glitch RGB split (looks broken/amateur)
- Beat drop radial flash (gaudy)
- Curtain slam (heavy)
- Tape wipe diagonal stripes (busy)

## Implementation
- Rewrite `src/components/fx/PageTransitionFX.tsx`: same random-pick logic, but with the 4 new variants and longer duration (800ms).
- Replace the page-transition keyframes in `src/index.css`: remove `pt-vinyl-spinout-kf`, `pt-eq-rise-kf`, `pt-glitch-flash-kf`, `pt-beat-flash-kf`, `pt-curtain-top-kf`, `pt-curtain-bottom-kf`, and the `tape-wipe` animation. Add `pt-sheen-kf`, `pt-iris-kf`, `pt-veil-kf`, `pt-bar-fade-kf`.
- All variants respect `prefers-reduced-motion` (skip animation entirely if reduced motion is set).
- Keep `fxEnabled` gate.

## Files
- **Edit**: `src/components/fx/PageTransitionFX.tsx`, `src/index.css`

No new dependencies. No other files touched.
