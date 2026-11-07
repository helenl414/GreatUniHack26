# Steady — design direction

**Concept.** A steady hand: calm, plain-language planning for income that arrives in lumps. The
recurring motif is one smooth line drawn through uneven bars: in the logo, the landing hero and the
planner chart.

**Audience.** Seasonal, part-time and short-term workers, and people who change jobs often. Many will
use it on a phone, some while stressed about money. Plain words, big numbers, no jargon.

**Typography.** DM Sans Variable (bundled, works offline) for everything. Headings 700 with tight
tracking; body 16px / 1.55. All money uses tabular numerals. The one big number per screen (safe weekly
spend, run-out week) is the hierarchy anchor.

**Colour.** NatWest-inspired purples.
- Brand deep purple `#42145F`: top bar, hero, the lead figure tile.
- Action purple `#5E10B1`: primary buttons, focus, active tab. Reserved for things you can press.
- Canvas `#F7F4FA`, surfaces white, 1px lavender rules `#E3DAEB`.
- Semantic only for status: green = set aside / safe, amber = draw from buffer / below steady pay,
  red = shortfall / money runs out.
- Dark mode is designed separately (deep aubergine surfaces, lifted lilac accent). The printable
  report always stays paper-white.

**Geometry.** 14px radius panels, 10px inputs, pill buttons. 46px control height (touch-friendly).
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
