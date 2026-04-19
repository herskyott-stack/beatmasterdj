
The user dropped a big inspiration list, but most of the high-impact items (vinyl spinner, magnetic buttons, RGB glitch on hover, neon pulse glow, infinite marquee, mouse-follow spotlight via crosshair+glow trail, BPM pulse) are **already implemented** in the FX layer. So I'll only add the genuinely new, on-brand effects from their list — keeping it tight (3 new effects, not all 10) per their own pro-tip.

## Plan: Add 3 new DJ FX

### 1. Audio Waveform Scroll Progress (`WaveformProgress.tsx`)
- Fixed SVG strip pinned to the very top of viewport (above SpectrumStrip), height 6px, full width.
- 80 vertical bars of varying heights (sine-wave shape) drawn in SVG.
- Track scroll % via `window.scrollY / (scrollHeight - innerHeight)`; fill bars left→right with primary→secondary gradient as you scroll.
- Gated by `fxEnabled`. Uses passive scroll listener + rAF throttle.

### 2. Bass Drop Section Reveal (CSS-only, no Framer Motion)
- New `.bass-drop` utility in `index.css`: starts at `scale(0.94) translateY(24px) opacity-0`, animates to `scale(1) translateY(0) opacity-1` with a spring-feel cubic-bezier `(0.34, 1.56, 0.64, 1)` (overshoot bounce).
- Trigger via IntersectionObserver in a tiny shared hook `useRevealOnScroll.ts` that adds `.bass-drop-active` when in viewport.
- Apply class to all `<section>` wrappers in: HeroSection (skip — already visible), ServicesSection, PackagesSection, AddonsSection, GallerySection, TestimonialsSection, ContactSection.

### 3. Floating Parallax DJ Icons (`FloatingGear.tsx`)
- Fixed-position layer, z-index between background and content (z-0, pointer-events-none).
- 4 lucide icons: `Disc3`, `Headphones`, `Music2`, `Zap` — positioned at viewport corners with low opacity (0.06–0.10), large size (120–180px), tinted primary/secondary.
- Parallax: translate Y based on `window.scrollY * factor` where each icon has a different factor (0.15, 0.25, 0.1, 0.2) for depth.
- Subtle CSS float animation already on hand (`animate-float`).
- Gated by `fxEnabled` and `isDesktop` (skip on mobile to keep it clean).

### What I'm explicitly NOT adding (already done or rejected)
- Vinyl spinner ✅ exists
- Magnetic buttons ✅ exists
- Glitch text on hover ✅ exists (`.glitch-text`)
- Neon pulse on Book Now ❌ user just asked to make it steady, not pulse — keep it static
- Infinite marquee ✅ exists (promo ticker)
- Crosshair + glow trail ✅ exists (covers spotlight idea)
- Mesh gradient bg, vinyl page loader, scramble text, page transitions — skipping to avoid overload (user's own pro tip: pick 3–4)

### Files to add
- `src/components/fx/WaveformProgress.tsx`
- `src/components/fx/FloatingGear.tsx`
- `src/hooks/useRevealOnScroll.ts`

### Files to edit
- `src/components/fx/FXLayer.tsx` — mount `WaveformProgress` + `FloatingGear`.
- `src/index.css` — add `.bass-drop` / `.bass-drop-active` keyframes + utility.
- `src/components/ServicesSection.tsx`, `PackagesSection.tsx`, `AddonsSection.tsx`, `GallerySection.tsx`, `TestimonialsSection.tsx`, `ContactSection.tsx` — add ref + `.bass-drop` class via the hook.

### Performance
- Scroll listener single, passive, rAF-throttled, shared between WaveformProgress and FloatingGear (one tiny module).
- IntersectionObserver fires once per section (`unobserve` after reveal).
- No new dependencies.
