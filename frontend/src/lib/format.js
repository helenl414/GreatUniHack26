export const gbp = (n, { pence = false } = {}) =>
  (n < 0 ? '−' : '') +
  '£' +
  Math.abs(n).toLocaleString('en-GB', {
    minimumFractionDigits: pence ? 2 : 0,
    maximumFractionDigits: pence ? 2 : 0,
  });

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** '2026-05' -> 'May' (or 'May 2026' with year). */
export function monthLabel(key, { year = false, long = false } = {}) {
  if (!key) return '';
  const [y, m] = key.split('-').map(Number);
  const name = (long ? MONTHS_LONG : MONTHS)[m - 1];
  return year ? `${name} ${y}` : name;
}

export const dateLabel = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export const longDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** The last `count` complete months, oldest first, as 'YYYY-MM'. */
export function recentMonths(count, today = new Date()) {
  const out = [];
  for (let i = count; i >= 1; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
}

export const monthIndex = (key) => Number(key.split('-')[1]) - 1;

export const pct = (x) => `${Math.round(x * 100)}%`;

export const uid = () => Math.random().toString(36).slice(2, 9);
