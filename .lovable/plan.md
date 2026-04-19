
The user wants a massive collection of "showstopper" visual FX. I'll propose a focused, high-impact subset that delivers the "live DJ console" vibe without tanking performance or breaking the existing site. Rather than implementing all 30+ ideas, I'll bundle the highest-ROI effects into one cohesive "Beatmaster Mode" experience with a toggle so it doesn't overwhelm.

## Plan: Beatmaster FX Mode

### What gets built

**1. Persistent FX Layer (always on, subtle)**
- **Cyberpunk HUD corners** — fixed monospace overlays in all 4 corners showing "BPM: 128", "SYS: STABLE", "LOC: OTTAWA, ON", live mouse coords. Tiny, neon-cyan, non-intrusive.
- **Crosshair cursor tracker** — two thin neon lines (horizontal + vertical) following the mouse across the viewport. Desktop only.
- **Floating neon particles** — subtle bokeh/dust drifting in the hero background (canvas-based, ~40 particles).
- **Scanline overlay** — very faint moving CRT scanlines fixed across the screen at 5% opacity.

**2. Interactive Hover/Click FX**
- **RGB glitch text** on hover for the logo "HERSKY DJ & AV" and all H1/H2 headings (red/blue split + jitter).
- **Magnetic Book Now button** — the primary CTA pulls toward the cursor within 80px and pulses on a 128 BPM rhythm.
- **Neon glow buttons** — all primary buttons get an animated box-shadow pulse.
- **Bass-shake** class available for headings (RGB split on hover).

**3. Scroll FX**
- **VU Meter scrollbar** — replace default scrollbar with a vertical green→yellow→red gradient meter.
- **Speed-blur** — when scrolling fast, page gets a brief blur filter that snaps back to focus when scrolling stops (low-pass filter feel).

**4. Performance Mode Toggle**
- Floating circular toggle button (bottom-right, above any existing FAB) labeled with a lightning icon.
- **ON** (default off to be safe): all FX above active.
- **OFF**: clean professional site, only base animations.
- Preference saved to localStorage so returning visitors get their choice.
- Auto-disabled on mobile (viewport < 768px) for performance — only HUD corners shown in a simplified form.

### What I'm intentionally NOT building (and why)
- **WebGL liquid distortion / ink-drop transitions** — would require shaders + 50KB+ added bundle, high crash risk on low-end devices. Can revisit as a focused follow-up.
- **Audio playback (drum pad footer, scratch sounds)** — needs audio asset sourcing + autoplay policy handling + mute UX. Better as its own feature.
- **Live multi-cursor "Figma ghosts"** — requires realtime backend channel + presence infra, big scope.
- **Turntable-drag scroll hijack** — breaks accessibility and standard scroll expectations.
- **Strobe flashes** — accessibility risk (photosensitive epilepsy).
- **3D Tilt.js on gear photos** — can add later if you want it specifically; not in this batch to keep scope tight.

### Files to add/edit

**New files:**
- `src/contexts/FXContext.tsx` — provides `fxEnabled` state + toggle, persists to localStorage, auto-disables on mobile.
- `src/components/fx/HUDCorners.tsx` — corner data readouts.
- `src/components/fx/CrosshairCursor.tsx` — mouse-tracking neon lines.
- `src/components/fx/ParticleField.tsx` — canvas particle drift.
- `src/components/fx/ScanlineOverlay.tsx` — fixed CRT lines.
- `src/components/fx/MagneticButton.tsx` — wrapper that adds magnetic pull to children.
- `src/components/fx/ScrollBlur.tsx` — applies blur filter during fast scroll.
- `src/components/fx/FXToggle.tsx` — floating performance-mode button.
- `src/components/fx/FXLayer.tsx` — single mount point that renders all of the above based on context.

**Edited files:**
- `src/App.tsx` — wrap with `FXProvider`, mount `<FXLayer />` once globally.
- `src/index.css` — add keyframes: `glitch-rgb`, `bpm-pulse` (468ms = 128 BPM), `scanlines`, `vu-fill`; utility classes `.glitch-text`, `.bass-shake`, `.neon-glow-pulse`; custom scrollbar styling for the VU meter look.
- `src/components/Navbar.tsx` — add `.glitch-text` to the brand name.
- `src/components/HeroSection.tsx` — apply `.glitch-text` to main H1, wrap the "Book Your Event" button in `<MagneticButton>`.

### Technical notes
- HUD coords + mouse tracker use a single shared `mousemove` listener via context to avoid duplicate handlers.
- All FX components early-return `null` when `fxEnabled === false` so there's zero render cost when disabled.
- Particle canvas is capped at 40 particles with `requestAnimationFrame` and pauses when tab is hidden (`visibilitychange`).
- Scrollbar restyling uses `::-webkit-scrollbar` + a tiny gradient — graceful Firefox fallback.
- Magnetic button uses `transform: translate()` only (GPU-accelerated, no layout thrash).
- Crosshair + HUD hidden when viewport width < 768px.
- Default state: **FX OFF** so first-time visitors see your clean professional site; they opt in via the toggle. (If you'd rather default ON, say the word.)

```text
┌─[BPM:128]──────────────[SYS:STABLE]─┐
│                                     │
│         + crosshair follows         │
│              cursor                 │
│                                     │
│       [HERSKY DJ & AV] ← glitch     │
│                                     │
│       [BOOK NOW] ← magnetic+pulse   │
│                                     │
└─[LOC:OTTAWA]─────────[X:420 Y:300]──┘
                              [⚡ FX]
```
