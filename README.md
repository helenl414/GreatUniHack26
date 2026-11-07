# Steady

A demo-first irregular income planning app with exactly four main tabs: Home, Income Planner, Simulator, and Prove My Income. Built with React and the Next.js App Router API through Vinext, Tailwind CSS, Zod and jsPDF. No account or bank connection is required inside the app. The hosted Site uses the owner's existing private Sites access policy.

## Run locally

Use Node.js 22.13+ and npm. The checked-in npm configuration uses legacy peer dependency resolution for the supplied Vinext starter and Vitest combination.

```sh
npm ci
npm run dev
npm test
npm run build
```

The local URL is printed by the development server. The Sites publishing helper also builds the Cloudflare Worker. Preserve `.openai/hosting.json` and its Site ID when deploying updates. Do not create a new Site for this source.

## Privacy and storage

Confirmed personal entries are held in memory. Explicitly opting into Remember my plan saves the versioned plan in localStorage on that device. Browser storage is not encrypted. Clear my data clears both memory and localStorage, and resets forecast and report choices. Draft descriptions are never saved in device storage. No analytics or raw financial request logging is installed.

Exports happen only when Download PDF or Print summary is chosen. Income summaries exclude savings, balances, costs, forecasts and conversations. Demo screens and PDFs are labelled fictional.

## Optional AI configuration

The deployed app deliberately has no AI credentials configured. All forms, calculations, explanations, charts, simulations and PDF downloads work without an AI service. The limited offline text parser is explicitly labelled as rule based; it accepts simple natural sentences with exact years and amounts and offers a structured syntax for less ambiguous entry. It is not a substitute for general language understanding.

To enable server-side draft extraction, set `OPENAI_API_KEY` as a secret and `OPENAI_MODEL` to a Responses API model supporting strict JSON Schema output in the Site runtime, then redeploy. For local development, copy `.dev.vars.example` to `.dev.vars`. Never place keys in client variables or commit secret values. See the [official structured output guide](https://developers.openai.com/api/docs/guides/structured-outputs).

Only an explicitly consented request sends the description, selected currency and existing source names to `/api/parse-income` and the configured provider. `store:false` is requested. Upstream provider retention is governed by that account's terms; no zero-retention claim is made. The route enforces schema validation, request-size limits, same-origin checks and a per-isolate 10-request/minute/IP limit. For high-volume use, replace the isolate limiter with a durable rate-limit binding. Responses are validated again on the client. Failed, unconfigured or malformed responses preserve text and offer form entry. The AI never computes results, verifies income, invokes tools or modifies confirmed records.

Explanations use deterministic result templates, always showing a summary, uncertainty and exactly three next steps. No provider is needed. Voice (ElevenLabs), n8n notifications, bank integrations and accounts are deferred, as specified.

## Calculation and date assumptions

- `lib/engine.js` is independent of React, AI and PDF rendering. Money is integer minor units with two decimals; negative entries and extra precision are rejected. Supported currencies: GBP, USD, EUR, CAD and AUD. Currency is chosen before entering amounts.
- The baseline is the linearly interpolated lower quartile of total income across complete calendar months, rounded down. At least three complete months are required. Unknown/incomplete months are excluded; confirmed zero months are included. The user selects the analysis window.
- Savings target equals current monthly costs multiplied by the positive whole-month goal. Savings are counted once and never added to earned income. Runway rounds down to one decimal place. Zero costs have no finite runway.
- Additional weekly spending follows the supplied smoothing formula with an adjustable 25% default allocation. Entered living costs are not charged a second time. Planned contributions are hypothetical, not actual saved money.
- Weekly/fortnightly/annual fixed costs use monthly approximations, rounded upward after summing. The simulator uses dated recurrence events and preserves the original monthly day anchor across short months and leap years.
- Calendar dates are stored as YYYY-MM-DD values in the selected timezone; internal date arithmetic never converts user dates through the execution machine's timezone.
- The forecast requires separately confirmed future payments, bill dates and opening everyday money. Income precedes costs on the same day. Bill priority defaults equal, followed by stable ID, then living and additional spending. Remainder minor units are allocated in calendar order.
- Two ledgers reconcile after every event: required balance may go negative, while available cash never does. Later cash first clears unpaid items without charging a cost twice. First failure remains recorded even if a later receipt recovers the balance.
- Interruptions affect only the selected source's expected receipts in the half-open start/end interval. Ordinary forecast and both savings comparisons share the same events and spending. Current savings are pooled with everyday money only in the savings comparison.
- Forecasts cover 4–52 weeks. A monthly survival goal can be longer. No forecast promises indefinite survival.
- Reports use actual complete-month statistics, at most 12 calendar months per one-page export. Six individual source names are shown, with additional sources grouped as Other sources. Long source names may be shortened to one line in the PDF; their underlying totals remain unchanged. No reliability or creditworthiness score is generated.

## Verification

`npm test` runs 32 independent Vitest checks covering all ten calculation fixtures and related validations: lower quartile, zero/insufficient histories, savings goals, structural gaps, cost rounding, precision, same-day ordering, short months, interruption boundaries, partial payments, integer conservation, ledger reconciliation, report statistics and real PDF generation.

Browser checks used Playwright locators through the connected browser: labelled demo loading, all four tabs, shared draft inputs between form/text modes, review-before-confirmation, changed survival goal, offline natural-language drafts, unavailable-AI error with text preservation, dated interruption comparisons, and an actual PDF download. Desktop and 360-pixel mobile layouts were visually inspected; mobile planner has no horizontal page overflow. Keyboard focus styles, labelled fields, chart text alternatives, dialog focus containment and reduced-motion styling are included. Full assistive-technology certification has not been performed.

`node scripts/verify-pdf.mjs` produces four QA PDFs for A4/Letter, many long source names and limited history. Page counts and extracted text were checked with pypdf and representative pages visually inspected with Poppler. Every QA PDF had one page. The app's Download PDF is a deterministic jsPDF export, independent of the native Print action.

## Structure

- `app/page.jsx`: four-tab UI, confirmed plan owner, forms, draft review and results.
- `app/api/parse-income/route.js`: optional bounded server extraction.
- `lib/engine.js`: validation, monthly planning, recurrence and daily ledgers.
- `lib/text-draft.js`: extraction schema and limited offline parser.
- `lib/report.js`: one-page PDF renderer using the same report data as preview.
- `tests/engine.test.js`: independent numerical/validation fixtures.

Limitations: no live AI provider test was possible without credentials; browser print-to-paper was not exercised; arbitrary non-Latin PDF source names are not covered by the standard embedded PDF font. Entered data is self-reported and this app provides education and planning support, not regulated financial advice.
