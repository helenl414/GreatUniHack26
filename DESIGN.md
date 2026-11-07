# Sothis — design direction

**Concept.** A steady hand: calm, plain-language planning for income that arrives in lumps. The
recurring motif is one smooth line drawn through uneven bars: in the logo, the landing hero and the
planner chart.

**Audience.** Seasonal, part-time and short-term workers, and people who change jobs often. Many will
use it on a phone, some while stressed about money. Plain words, big numbers, no jargon.

**Brand.** Sothis (Sirius): the four-point compass star in NatWest purple `#3C1053`, with only the
north-east point in NatWest red `#E90000`. Red appears nowhere else in the UI. Mark lives in
`frontend/src/components/Icons.jsx` (`SothisMark`); brand files from `sothis-brand-assets`.

**Typography.** Plus Jakarta Sans Variable (the wordmark's family, bundled) for everything. Headlines
600-650 with tight tracking (-0.035 to -0.05em) and large sizes (h1 up to 4.25rem); body 16px / 1.6.
All money uses tabular numerals. One big number per screen is the hierarchy anchor.

**Colour & surfaces.** Warm paper canvas `#F7F4F0`, white surfaces, deep plum ink `#1D1224`.
Primary action is NatWest purple (pill). The "stage" (purple radial gradient, `--stage`) is reserved
for the single most important thing on a screen: the landing hero and the lead figure.
Tool tiles use three soft tints (lilac, sand, sage). Dark mode is deep plum `#110A16`, lilac action.

**Glass.** Only three places: the floating top nav pill, the mobile tab bar, and the hero figure card on
the stage. Disabled under `prefers-reduced-transparency` and high contrast.

**Geometry.** 32px stage, 24px cards, 14px inputs, pill buttons, 50px controls, 1160px content width,
soft long shadows that lift on hover.

**Layout.** Desktop: floating glass nav with three tools. Phone (<860px): floating glass tab bar.
CSS is split: `styles/base.css` (tokens, shell) → `legacy.css` → `skin.css` → one file per page.

**Motion.** 160-260ms, `cubic-bezier(.22,.8,.24,1)`. Hero bars grow and the steady line draws; cards
lift 3-4px on hover. Everything off under reduced motion.

**Display settings** (top bar → Display, saved on device, applied before first paint):
Auto/Light/Dark theme, three text sizes (100/112.5/125%), high contrast (black/white text, 2px
borders, stronger focus), reduce motion. Auto values follow the OS (`prefers-color-scheme`,
`prefers-contrast`, `prefers-reduced-motion`).

**Accessibility & usability.** Skip link; focus moves to the page heading after navigation;
44px touch targets; tap-to-open definitions for jargon (steady pay, buffer, shortfall); chart data
available as a table; form progress chips and inline errors linked with `aria-describedby`; number
fields ignore the scroll wheel; read-aloud for explanations; "Delete my data" with confirmation.

**Principles in the UI.** Inclusive (plain language, voice input, phone-first), Robust (deterministic
maths; AI only explains), Curious (what-if simulator), Sustainable (buffer habits), Ambitious (proof of
income).

**Trust rules.** Every screen footer says it's not regulated advice. Sample data is always bannered.
The income report is labelled "Self-reported summary" in the header and footer. Data stays on device.
