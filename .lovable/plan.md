
User wants: (1) remove the scroll blur, (2) pile on more DJ-themed FX, (3) extend FX presence to other pages (Services area + Packages, About, Contact, Booking, etc.). FXLayer is already global via App.tsx so it shows everywhere — but several pages have their own Navbar/Hero treatments that don't use the FX hooks yet, and the section headings aren't tagged with glitch/bass-shake. I'll add a fat batch of DJ-niche FX and make sure they appear across the site.

## Plan: DJ FX Overdrive

### 1. Kill the scroll blur
- Remove `<ScrollBlur />` from `FXLayer.tsx`. Keep the file (commented out import) in case we revive it.

### 2. New DJ-niche FX (all gated by `fxEnabled`, desktop-aware where heavy)

**a. Equalizer Bars Bottom Strip** (`EqualizerBars.tsx`)
- Fixed 8px-tall strip across the bottom of the viewport with 64 animated bars pulsing at staggered 128 BPM intervals — green→yellow→red gradient, looks like a live VU meter on a mixing console.

**b. Vinyl Record Spinner** (`VinylSpinner.tsx`)
- Fixed bottom-left small spinning vinyl SVG (64px) with grooves, label, and a tonearm. Rotates continuously; speeds up briefly on route change.

**c. Beat Drop Click Burst** (`BeatDropBurst.tsx`)
- Global click listener: every click spawns a 12-particle neon burst at cursor coords (CSS-only, auto-cleanup after 600ms). Feels like a bass drop confetti.

**d. Laser Sweep Background** (`LaserSweep.tsx`)
- Two diagonal neon laser beams (magenta + cyan) that slowly sweep across the viewport every ~6s, low opacity, mix-blend-screen — club-light vibe.

**e. Audio Spectrum Header Strip** (`SpectrumStrip.tsx`)
- Fixed 2px gradient strip at top of viewport that "wobbles" its gradient stops on a 128 BPM rhythm — like a frequency analyzer bar.

**f. Cassette Tape Loading Toast** (route-change overlay) (`TapeWipe.tsx`)
- On every route change, a brief horizontal "tape rewind" wipe (200ms) using a striped diagonal gradient. Listens to react-router location changes.

**g. Glow Trail Cursor** (`GlowTrail.tsx`)
- 8-dot fading neon trail behind the cursor (separate from the crosshair), each dot smaller and more transparent than the last. Desktop only.

**h. Marquee Ticker** (`MarqueeTicker.tsx`)
- Optional fixed thin ticker just under the navbar reading "● LIVE MIX ● UPCOMING: WEDDING SEASON 2026 ● BOOK NOW ● BPM: 128 ● OTTAWA, ON ●" scrolling right-to-left in monospace.

**i. Strobe-Safe Neon Border Pulse on section headings**
- New CSS class `.dj-heading` applied to all H2s in section components — adds underline gradient that animates on scroll into view + bass-shake on hover.

**j. Turntable Hover on Service Cards** (`TurntableHoverCSS`)
- Add a CSS class so service/package card images get a subtle 3D tilt + a faint rotating vinyl overlay on hover (pure CSS, no JS lib).

### 3. Extend FX visibility to all pages

The FXLayer is already mounted globally in `App.tsx` (good). Per-page enhancements:
- `ServicesSection.tsx` — add `.dj-heading` + `.bass-shake` to the H2; add turntable-hover class to each service card image; wrap "OUR SERVICES" subtext with a marquee-light variant.
- `PackagesSection.tsx`, `AddonsSection.tsx`, `GallerySection.tsx`, `TestimonialsSection.tsx`, `ContactSection.tsx` — same `.dj-heading` + `.glitch-text` on H2s.
- `AboutPage.tsx`, `PackagesPage.tsx`, `ContactPage.tsx`, `BookingPage.tsx`, `BookingConfirmed.tsx`, `CheckoutPage.tsx` — apply `.glitch-text` to page H1, ensure they include `<Navbar />` (already do).
- `Footer.tsx` — light "drum-pad" hover state on social/footer links: scale + neon shadow on hover (CSS only, no audio yet).

### 4. FXLayer mounts (additions)
```
EqualizerBars, VinylSpinner, BeatDropBurst, LaserSweep,
SpectrumStrip, TapeWipe, GlowTrail, MarqueeTicker
```
All early-return null when `fxEnabled === false`.

### 5. Files to add
- `src/components/fx/EqualizerBars.tsx`
- `src/components/fx/VinylSpinner.tsx`
- `src/components/fx/BeatDropBurst.tsx`
- `src/components/fx/LaserSweep.tsx`
- `src/components/fx/SpectrumStrip.tsx`
- `src/components/fx/TapeWipe.tsx`
- `src/components/fx/GlowTrail.tsx`
- `src/components/fx/MarqueeTicker.tsx`

### 6. Files to edit
- `src/components/fx/FXLayer.tsx` — drop ScrollBlur, mount new components.
- `src/index.css` — add keyframes: `eq-bounce`, `vinyl-spin`, `laser-sweep`, `spectrum-wobble`, `tape-wipe`, `marquee-scroll`, `heading-underline`, `turntable-tilt`; utility classes `.dj-heading`, `.turntable-hover`, `.drumpad-link`.
- `src/components/ServicesSection.tsx` — apply heading + card classes.
- `src/components/PackagesSection.tsx`, `AddonsSection.tsx`, `GallerySection.tsx`, `TestimonialsSection.tsx`, `ContactSection.tsx` — heading classes.
- `src/components/Footer.tsx` — drumpad-link class on links.
- `src/pages/AboutPage.tsx`, `PackagesPage.tsx`, `ContactPage.tsx`, `BookingPage.tsx`, `BookingConfirmed.tsx`, `CheckoutPage.tsx` — H1 glitch class.

### 7. Performance / safety notes
- All new components honor `fxEnabled` and most heavy ones (GlowTrail, LaserSweep, BeatDropBurst, EqualizerBars) gate on `isDesktop` too.
- BeatDropBurst caps to max 6 active bursts at any time.
- VinylSpinner + EqualizerBars use pure CSS animations (no rAF JS).
- TapeWipe uses a single transient div mounted/unmounted on `useLocation()` change.
- No bundle additions, no new dependencies.

### 8. What I'm NOT touching this round
- Audio playback (still out of scope).
- WebGL distortion.
- Re-enabling scroll blur (explicitly removed).

```text
┌─[BPM:128]══════════════[SYS:STABLE]─┐  ← Spectrum strip
│ ● LIVE MIX ● UPCOMING WEDDINGS ● →  │  ← Marquee
│                                     │
│   ╲    HERO + crosshair + trail    ╱│  ← Laser sweep
│                                     │
│   [Service Card w/ vinyl tilt]     │
│                                     │
│ ▮▮▮▮▮▮▯▯▮▮▮▮▯▯▮▮▮▮▮▯▮▮▮▮▮▮▯▯▮▮▮ │  ← EQ bars
│ [◉]                            [⚡] │  ← Vinyl + FX toggle
└─────────────────────────────────────┘
```
