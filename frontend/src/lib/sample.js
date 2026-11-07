import { recentMonths, uid } from './format';

// Clearly-labelled sample data for demos. Not a real person.
export function sampleProfile() {
  return {
    isSample: true,
    name: 'Sample user',
    months: recentMonths(6),
    sources: [
      { id: uid(), name: 'Café (summer season)', kind: 'seasonal', amounts: [450, 1100, 1400, 1450, 700, 300] },
      { id: uid(), name: 'Delivery app', kind: 'gig', amounts: [420, 380, 300, 350, 450, 520] },
      { id: uid(), name: 'Tutoring', kind: 'part-time', amounts: [280, 0, 0, 0, 360, 400] },
    ],
    costs: [
      { id: uid(), name: 'Rent', amount: 650, dueDay: 1, priority: 'essential' },
      { id: uid(), name: 'Council tax', amount: 110, dueDay: 5, priority: 'essential' },
      { id: uid(), name: 'Energy', amount: 85, dueDay: 12, priority: 'essential' },
      { id: uid(), name: 'Travel pass', amount: 60, dueDay: 1, priority: 'important' },
      { id: uid(), name: 'Phone', amount: 18, dueDay: 20, priority: 'important' },
      { id: uid(), name: 'Streaming', amount: 11, dueDay: 25, priority: 'flexible' },
    ],
    savings: 400,
  };
}

export function emptyProfile(monthCount = 6) {
  return {
    isSample: false,
    name: '',
    months: recentMonths(monthCount),
    sources: [{ id: uid(), name: '', kind: 'part-time', amounts: Array(monthCount).fill('') }],
    costs: [{ id: uid(), name: 'Rent', amount: '', dueDay: 1, priority: 'essential' }],
    savings: '',
  };
}

export const SOURCE_KINDS = [
  { value: 'seasonal', label: 'Seasonal work' },
  { value: 'part-time', label: 'Part-time job' },
  { value: 'temporary', label: 'Temporary or agency' },
  { value: 'gig', label: 'Gig or app work' },
  { value: 'freelance', label: 'Freelance or self-employed' },
  { value: 'other', label: 'Other' },
];

export const PRIORITIES = [
  { value: 'essential', label: 'Essential', hint: 'Home, council tax, energy' },
  { value: 'important', label: 'Important', hint: 'Phone, travel, debts' },
  { value: 'flexible', label: 'Flexible', hint: 'Subscriptions, extras' },
];

export const COMMON_COSTS = [
  { name: 'Rent', priority: 'essential', dueDay: 1 },
  { name: 'Council tax', priority: 'essential', dueDay: 1 },
  { name: 'Energy', priority: 'essential', dueDay: 15 },
  { name: 'Water', priority: 'essential', dueDay: 15 },
  { name: 'Childcare', priority: 'essential', dueDay: 1 },
  { name: 'Phone', priority: 'important', dueDay: 20 },
  { name: 'Broadband', priority: 'important', dueDay: 20 },
  { name: 'Travel', priority: 'important', dueDay: 1 },
  { name: 'Insurance', priority: 'important', dueDay: 1 },
  { name: 'Debt repayments', priority: 'important', dueDay: 1 },
  { name: 'Subscriptions', priority: 'flexible', dueDay: 25 },
];

const num = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? 0 : Math.max(0, Number(v)));

/** Turn form values (which may be '' strings) into clean numbers. */
export function normaliseProfile(p) {
  return {
    ...p,
    sources: p.sources
      .filter((s) => s.name.trim() || s.amounts.some((a) => num(a) > 0))
      .map((s, i) => ({ ...s, name: s.name.trim() || `Income ${i + 1}`, amounts: s.amounts.map(num) })),
    costs: p.costs
      .filter((c) => num(c.amount) > 0)
      .map((c) => ({
        ...c,
        name: c.name.trim() || 'Bill',
        amount: num(c.amount),
        dueDay: Math.min(31, Math.max(1, Number(c.dueDay) || 1)),
      })),
    savings: num(p.savings),
  };
}
