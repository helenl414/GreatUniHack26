// MOCK — stands in for POST /api/parse until the AI backend is connected.
// A simple rule-based reader for descriptions like:
//   "I work at a café in summer for about £1,200 a month, and do deliveries
//    for around £90 a week. Rent is £650 and my phone is £18. I have £300 saved."
// The user always reviews the result in the form before anything is calculated.
import { monthIndex } from '../lib/format';

const WEEKS_PER_MONTH = 52 / 12;

const COSTS = [
  { re: /\brent\b/, name: 'Rent', priority: 'essential', dueDay: 1 },
  { re: /mortgage/, name: 'Mortgage', priority: 'essential', dueDay: 1 },
  { re: /council tax/, name: 'Council tax', priority: 'essential', dueDay: 1 },
  { re: /\b(energy|gas|electric\w*)\b/, name: 'Energy', priority: 'essential', dueDay: 15 },
  { re: /\bwater\b/, name: 'Water', priority: 'essential', dueDay: 15 },
  { re: /child ?care|nursery/, name: 'Childcare', priority: 'essential', dueDay: 1 },
  { re: /\b(phone|mobile)\b/, name: 'Phone', priority: 'important', dueDay: 20 },
  { re: /broadband|internet|wi-?fi/, name: 'Broadband', priority: 'important', dueDay: 20 },
  { re: /travel|transport|bus|train|fuel|petrol|car\b/, name: 'Travel', priority: 'important', dueDay: 1 },
  { re: /insurance/, name: 'Insurance', priority: 'important', dueDay: 1 },
  { re: /loan|credit card|debt|repay/, name: 'Debt repayments', priority: 'important', dueDay: 1 },
  { re: /subscription|netflix|spotify|streaming|gym/, name: 'Subscriptions', priority: 'flexible', dueDay: 25 },
];

const SEASONS = [
  { re: /summer/, months: [5, 6, 7] },
  { re: /winter/, months: [11, 0, 1] },
  { re: /spring/, months: [2, 3, 4] },
  { re: /autumn|fall/, months: [8, 9, 10] },
  { re: /christmas|festive/, months: [10, 11] },
];

const INCOME_WORDS = /earn|make|paid|pay me|get|income|job|work|wage|salary|shift|tips|gig|deliver|freelanc|contract|temp|agency/;
const SAVINGS_WORDS = /sav(ed|ings)|in the bank|put aside|set aside|emergency fund/;

function amountIn(clause) {
  const m = clause.match(/£\s?(\d[\d,]*(?:\.\d+)?)\s*(k\b)?/) || clause.match(/(\d[\d,]*(?:\.\d+)?)\s*(k\b)?\s*(?:pounds|quid|gbp)/);
  if (!m) return null;
  let n = Number(m[1].replace(/,/g, ''));
  if (m[2]) n *= 1000;
  if (/(a|per|each|every)\s+week|weekly|\/\s?w(ee)?k/.test(clause)) n *= WEEKS_PER_MONTH;
  else if (/fortnight/.test(clause)) n *= 26 / 12;
  else if (/(a|per|each)\s+(year|annum)|yearly|annual/.test(clause)) n /= 12;
  else if (/(a|per|each)\s+day|daily/.test(clause)) n *= 21.7;
  return Math.round(n);
}

function kindOf(clause) {
  if (SEASONS.some((s) => s.re.test(clause)) || /season/.test(clause)) return 'seasonal';
  if (/deliver|uber|deliveroo|gig|app\b|driv/.test(clause)) return 'gig';
  if (/freelanc|self.employ|commission/.test(clause)) return 'freelance';
  if (/temp|agency|contract|short.term/.test(clause)) return 'temporary';
  if (/part.time|term.time|tutor/.test(clause)) return 'part-time';
  return 'other';
}

const JOB_WORDS = [
  [/tutor/, 'Tutoring'], [/deliver/, 'Deliveries'], [/caf[eé]|coffee/, 'Café'], [/bar|pub/, 'Bar work'],
  [/shop|retail|store/, 'Retail'], [/warehouse/, 'Warehouse'], [/care|carer/, 'Care work'], [/clean/, 'Cleaning'],
  [/driv/, 'Driving'], [/farm|harvest|picking/, 'Farm work'], [/hotel|hospitality/, 'Hospitality'], [/freelanc/, 'Freelance'],
];

function nameOf(original, clause, n) {
  const known = JOB_WORDS.find(([re]) => re.test(clause));
  if (known) return known[1];
  const m = original.match(/\b(?:at|for|from|as an?|as|doing|do)\s+(?:a |an |the |some )?([A-Za-zÀ-ÿ'&][\wÀ-ÿ'& -]{1,28}?)(?=\s+(?:earning|making|paying|for|about|around|roughly|which|where|and|in|during|at|on|that|every|each|per|a\s|an\s)|[,£]|$)/i);
  if (m) {
    const name = m[1].trim();
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return `Income source ${n}`;
}

export function parseLocally(text, months) {
  const clauses = text
    .split(/[.;\n]+|,\s+|\s+(?:and|plus|but)\s+/i)
    .map((c) => c.trim())
    .filter(Boolean);

  const sources = [];
  const costs = [];
  const notes = [];
  let savings = null;

  for (const original of clauses) {
    const clause = original.toLowerCase();
    const amount = amountIn(clause);
    if (amount == null) {
      // "…£1,200 a month, but only in summer": a season on its own applies to the last source.
      const season = SEASONS.find((x) => x.re.test(clause));
      const last = sources.at(-1);
      if (season && last && !last.seasonal) {
        last.amounts = months.map((key, i) => (season.months.includes(monthIndex(key)) ? last.amounts[i] : 0));
        last.kind = 'seasonal';
        last.seasonal = true;
      }
      continue;
    }

    if (SAVINGS_WORDS.test(clause)) {
      savings = amount;
      continue;
    }

    const cost = COSTS.find((c) => c.re.test(clause));
    if (cost && !/earn|paid me|income/.test(clause)) {
      const existing = costs.find((c) => c.name === cost.name);
      if (existing) existing.amount += amount;
      else costs.push({ name: cost.name, amount, dueDay: cost.dueDay, priority: cost.priority });
      continue;
    }

    // Anything else with an amount is most likely income.
    if (INCOME_WORDS.test(clause) || !/\b(owe|spend|cost|bill|pay for)\b/.test(clause)) {
      const season = SEASONS.find((s) => s.re.test(clause));
      const amounts = months.map((key) => (!season || season.months.includes(monthIndex(key)) ? amount : 0));
      sources.push({ name: nameOf(original, clause, sources.length + 1), kind: kindOf(clause), amounts, seasonal: Boolean(season) });
      continue;
    }

    notes.push(original);
  }

  return { sources: sources.map(({ seasonal, ...s }) => s), costs, savings, notes };
}
