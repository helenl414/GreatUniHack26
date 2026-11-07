# Steady — design direction

**Concept.** A steady hand: calm, plain-language planning for income that arrives in lumps. The
recurring motif is one smooth line drawn through uneven bars: in the logo, the landing hero and the
planner chart.

**Audience.** Seasonal, part-time and short-term workers, and people who change jobs often. Many will
use it on a phone, some while stressed about money. Plain words, big numbers, no jargon.

**Typography.** DM Sans Variable (bundled, works offline) for everything. Headings 700 with tight
tracking; body 16px / 1.55. All money uses tabular numerals. The one big number per screen (safe weekly
spend, run-out week) is the hierarchy anchor.

**Colour.** Calm, clean NatWest palette (muted purples, soft lavender, gentle accents), defined as
tokens at the top of `frontend/src/styles.css`. Avoid saturated fills and pure black/white by default.
- Light: white header with a hairline, soft lavender hero `#F3EFFA → #EBE4F6`, canvas `#F7F6FA`,
  ink `#2A2433` (15:1), secondary text `#57505F` (7.7:1), muted purple action `#5B3E96` (8.2:1 with white).
- Dark: soft charcoal-plum, not black: canvas `#17151C`, surfaces `#1C1922`, ink `#ECE9F1`,
  calm sky action `#8EC3DC` (9:1 with dark text).
- Status: teal `#2E6575` on `#E6F1F4` (set aside), amber `#7A5310` on `#FBF0DC` (draw),
  rose `#9A3446` on `#F9E6E8` (shortfall). All text pairs meet WCAG AA.
- Charts: soft blue `#7491CF` income, soft amber `#EBC48A` (outlined) below steady pay, purple steady line,
  rose for "current savings only".
- The opt-in High contrast setting is the only place pure black/white is used.

**Display settings** (top bar → Display, saved on device, applied before first paint):
Auto/Light/Dark theme, three text sizes (100/112.5/125%), high contrast (black/white text, 2px
borders, stronger focus), reduce motion. Auto values follow the OS (`prefers-color-scheme`,
`prefers-contrast`, `prefers-reduced-motion`).

**Accessibility & usability.** Skip link; focus moves to the page heading after navigation;
44px touch targets; tap-to-open definitions for jargon (steady pay, buffer, shortfall); chart data
available as a table; form progress chips and inline errors linked with `aria-describedby`; number
fields ignore the scroll wheel; read-aloud for explanations; "Delete my data" with confirmation.

**Geometry.** 14px radius panels, 10px inputs, pill buttons. 48px control height (touch-friendly).
1px borders, almost no shadow. Content width 1080px.

**Layout.** Desktop: purple top bar with three numbered tabs. Phone (<760px): bottom tab bar, single
column, figures in a 2-up grid. The app is installable (manifest + service worker) and works offline.

**Motion.** 140–220ms ease-out. Only the landing hero animates (bars grow, the steady line draws);
everything else is a short fade. All motion is disabled under `prefers-reduced-motion`.

**Principles in the UI.** Inclusive (plain language, voice input, phone-first), Robust (deterministic
maths; AI only explains), Curious (what-if simulator), Sustainable (buffer habits), Ambitious (proof of
income).

**Trust rules.** Every screen footer says it's not regulated advice. Sample data is always bannered.
The income report is labelled "Self-reported summary" in the header and footer. Data stays on device.
