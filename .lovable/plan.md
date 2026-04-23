## Calm down the "ELEVATE YOUR EVENT EXPERIENCE" hero heading

You've told me the big hero headline on the home page is flashing/glitching and you want it to stop. Right now that heading has two effects layered on it:

1. **`glitch-text`** class — triggers a hard RGB-split glitch animation on hover (red/cyan offset, 0.4s infinite). On touch/trackpad it can flicker every time the cursor passes over it.
2. **`gradient-text`** on "EVENT EXPERIENCE" — static gold gradient, not animated, keep as-is.
3. The pulsing glow blobs behind the hero (`animate-pulse-slow`) — slow breathing, not flashing. Keep.
4. Global FX layer (laser sweep, scanlines, beat-drop burst) — these run site-wide, not specific to the heading.

## Change

**File: `src/components/HeroSection.tsx`** (line 29)

Remove `glitch-text` from the H1 so the headline stays perfectly still:

```tsx
// before
<h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight animate-fade-in glitch-text" ...>

// after
<h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight animate-fade-in" ...>
```

The one-time `animate-fade-in` on page load stays (it's a smooth fade, not a flash). The gold gradient on "EVENT EXPERIENCE" stays.

## Out of scope (tell me if you also want these)

- Removing `glitch-text` from other section headers (Services, Packages, Contact, etc.).
- Disabling the global FX layer (laser sweep / scanlines / beat-drop) over the hero specifically.
- Removing the pulsing background glow blobs.