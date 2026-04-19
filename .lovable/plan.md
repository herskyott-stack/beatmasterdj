

## Mobile fit audit — issues found at 360px width

### ClientPortal (`/client-portal`)
1. **Header buttons overflow** — "Admin Dashboard" + "Sign Out" sit in a `flex gap-3` row that stays horizontal on mobile (no `flex-col` fallback). On 360px with admin user, the two buttons can wrap awkwardly or push past the edge.
2. **Tab triggers too cramped** — "Do Not Play" label + count gets tight at 360px since icons hide below `sm:` but text is `text-xs` only.
3. **Sidebar Summary card** uses `sticky top-24` which is fine on desktop but on mobile it's just a regular block (lg breakpoint) — OK, but the contact card phone number `font-display` may be large.
4. **Add Song / Bulk Paste inputs** are fine (single-column at 360px), but the Textarea `rows={5}` placeholder text wraps OK.
5. **Song list rows** — delete button is far right, but long song titles don't have `truncate` / `min-w-0` so a very long title can push the trash button off-screen.
6. **Welcome heading** `text-3xl` is fine, but date subtext can be long.

### AuthPage (`/auth`)
1. **Sign Up form: First/Last name grid** uses `grid-cols-2` always — on 360px the two inputs + their labels work but are tight. Acceptable but could stack.
2. **Tab labels** "Sign In" / "Create Account" — "Create Account" may feel cramped at 360px; fine but verify.
3. **Date input** native picker can overflow on small iOS — usually OK.
4. Overall padding `p-6` on card + `px-4` container = 56px of horizontal chrome on a 360px screen, leaving 304px for inputs. Inputs with `pl-10` icon are tight but fit.

## Fixes (concise, mobile-only — no desktop regressions)

### `src/pages/ClientPortal.tsx`
- Header action buttons: change `flex gap-3 mt-4 md:mt-0` → `flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 md:mt-0 w-full md:w-auto`, and make buttons `w-full sm:w-auto` so they stack cleanly on phone.
- Welcome heading: drop to `text-2xl md:text-4xl` for safety.
- Tabs: keep current, but shorten `Do Not Play` label to `Skip` on mobile via `<span className="sm:hidden">Skip</span><span className="hidden sm:inline">Do Not Play</span>` pattern — or just reduce padding on `TabsTrigger` with `px-1 sm:px-3`.
- Song list row: add `min-w-0` to outer flex item, `truncate` on `<p>` song title and artist, and `shrink-0` on the delete button so long titles never push it off-screen.
- Card padding: change `CardContent` default to be lighter on mobile if needed (already `p-6`-ish via card defaults — fine).
- Contact card phone number: ensure `text-lg` not larger.

### `src/pages/AuthPage.tsx`
- Signup form: change First/Last name grid from `grid-cols-2 gap-4` → `grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4` so they stack on phone, removing tightness.
- Card padding: change `CardContent p-6` → `p-4 sm:p-6` so inputs gain ~16px of width on mobile.
- Container top padding: `pt-32` is OK; leave it.

### Files
- **Edit**: `src/pages/ClientPortal.tsx`, `src/pages/AuthPage.tsx`

No new files, no dependencies. Pure responsive class adjustments.

