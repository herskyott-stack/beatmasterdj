
The tempo fader on mobile (360px viewport) is `w-7` (28px) and sits at `right-1.5`, overlapping content. Make it smaller and more flush on mobile while keeping the desktop look.

## Change

**`src/components/fx/WaveformProgress.tsx`** — make the fader responsive:
- Width: `w-4` on mobile, `w-7` on desktop (`sm:w-7`)
- Right offset: `right-0.5` on mobile, `sm:right-1.5`
- Top/bottom inset: `top-16 bottom-16` on mobile (smaller), `sm:top-24 sm:bottom-24`
- Hide tick marks and TEMPO/pitch labels on mobile (only show the slim track + thumb), restore on `sm:` breakpoint
- Shrink thumb on mobile: `w-3 h-3`, `sm:w-6 sm:h-4`

Result: on phones the fader becomes a slim ~16px-wide unobtrusive scroll indicator hugging the right edge; on tablet/desktop the full CDJ-style fader with ticks and labels returns.

One file edited.
