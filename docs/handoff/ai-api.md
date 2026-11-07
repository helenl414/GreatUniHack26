# AI layer: frontend → backend request

Status: requested
UI that depends on it: `frontend/src/components/Explain.jsx`, `frontend/src/pages/planner/DescribeInput.jsx`
Adapter: `frontend/src/lib/api.js` (one switch: set `VITE_API_URL`)
Mocks in use: `frontend/src/mocks/parseLocal.js`, `frontend/src/mocks/explainLocal.js`

## What the user is trying to do

1. **Describe their situation by voice or text** and have it turned into income sources, bills and savings
   they can review in a form.
2. **Understand their results** in plain language: a summary, what the numbers mean, and three practical
   next steps.

All figures are calculated in the browser by `frontend/src/lib/engine.js`. The AI must **never calculate
or change numbers**. It only extracts (parse) or explains (explain). Keep any API key on the server.

## Interface

### `POST /api/parse`

```ts
type ParseRequest = {
  text: string;      // what the user typed or said (speech is transcribed in the browser)
  months: string[];  // 'YYYY-MM', oldest first, e.g. ['2026-05', ..., '2026-10']
};

type ParseResponse = {
  sources: {
    name: string;
    kind: 'seasonal' | 'part-time' | 'temporary' | 'gig' | 'freelance' | 'other';
    amounts: number[];   // monthly £ after tax, one per entry in `months` (0 if none)
  }[];
  costs: {
    name: string;
    amount: number;      // £ per month
    dueDay: number;      // 1–31, best guess (1 if unknown)
    priority: 'essential' | 'important' | 'flexible';
  }[];
  savings: number | null;
  notes: string[];       // parts of the text that couldn't be placed (shown to the user)
};
```

Weekly amounts → × 52/12. Seasonal work ("in summer") → amounts only in those months.

### `POST /api/explain`

```ts
type ExplainRequest =
  | { kind: 'plan'; figures: PlanFigures }
  | { kind: 'simulation'; figures: SimulationFigures }
  | { kind: 'report'; figures: ReportFigures };

type ExplainResponse = {
  summary: string;    // 2–3 sentences, plain English, UK spelling, second person
  meaning: string[];  // 2–4 bullets: what the numbers mean
  steps: string[];    // exactly 3 practical next steps
};
```

The exact `figures` objects are built in `PlanResults.jsx`, `Simulator.jsx` and `Report.jsx`
(search for `const figures =`). `explainLocal.js` shows the expected tone for each kind.

## Behaviour the UI relies on

- Timeout: the client aborts after 20s and falls back to the local mock, so aim for < 8s.
- On any non-2xx or malformed body, the UI silently uses the mock and labels it
  "built-in templates (AI service not connected)".
- Responses must only use figures present in the request. Prompt the model to refuse to invent numbers.
- No regulated advice: no product recommendations, no "you should invest". Signposting to free
  services (MoneyHelper, Citizens Advice, StepChange, Turn2us) is fine.
- CORS: allow the frontend origin (dev: `http://localhost:5173`).

## States the UI handles

idle · loading (skeleton) · done · error (falls back to mock) · offline (mock)

## Open questions

- Should `/api/parse` also return a confidence per field so the form can highlight guesses?
