
Two small tweaks:

1. **Stop the "Book Your Event" button from flashing** — currently it has the `neon-glow-pulse` animation (via MagneticButton) which uses `bpm-pulse` keyframes that strobe the box-shadow on/off every 468ms. Replace that with a steady, soft neon glow (constant `box-shadow`, no animation) so it just glows without pulsing.

2. **Update the top marquee ticker copy** — change `MESSAGE` in `src/components/fx/MarqueeTicker.tsx` to promo text:
   `"● UPCOMING ● SAVE 15% OFF UNTIL END OF MAY ● SAVE 20% IF YOU BOOK BEFORE APRIL 30TH ● HERSKY DJ & AV ● OTTAWA, ON ● "`

### Files to edit
- `src/components/fx/MagneticButton.tsx` — swap `neon-glow-pulse` class for a new static `.neon-glow-static` class (or inline style with steady gold/rose box-shadow).
- `src/index.css` — add `.neon-glow-static { box-shadow: 0 0 18px hsl(var(--primary)/0.55), 0 0 36px hsl(var(--secondary)/0.25); border-radius: 0.75rem; }` (no keyframes, no animation).
- `src/components/fx/MarqueeTicker.tsx` — replace the `MESSAGE` string with the promo copy above.

No other components, FX, or routing touched.
