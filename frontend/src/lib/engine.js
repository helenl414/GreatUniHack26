// Deterministic calculations. Every number shown in the app comes from here.
// The AI layer only ever receives these results and explains them in words.

const WEEKS_PER_MONTH = 52 / 12;
const PRIORITY_ORDER = { essential: 0, important: 1, flexible: 2 };

export const round = (n, step = 1) => Math.round(n / step) * step;
const sum = (xs) => xs.reduce((a, b) => a + (Number(b) || 0), 0);
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function quantile(values, q) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

export function describe(values) {
  const n = values.length;
  if (!n) return { n: 0, mean: 0, median: 0, min: 0, max: 0, p25: 0, sd: 0, cv: 0 };
  const mean = sum(values) / n;
  const sd = Math.sqrt(sum(values.map((v) => (v - mean) ** 2)) / n);
  return {
    n,
    mean,
    median: quantile(values, 0.5),
    min: Math.min(...values),
    max: Math.max(...values),
    p25: quantile(values, 0.25),
    sd,
    cv: mean > 0 ? sd / mean : 0,
  };
}

export const monthlyTotals = (profile) =>
  profile.months.map((_, i) => sum(profile.sources.map((s) => s.amounts[i])));

export const fixedCostsTotal = (profile) => sum(profile.costs.map((c) => c.amount));

export function consistencyLabel(cv) {
  if (cv < 0.15) return 'Very steady';
  if (cv < 0.3) return 'Fairly steady';
  if (cv < 0.5) return 'Variable';
  return 'Highly variable';
}

/**
 * Income Smoothing Planner.
 * Baseline = 25th percentile of monthly income: a month worse than 3 in 4 of the
 * user's recent months. Planning on that, not the average, keeps spending safe.
 */
export function buildPlan(profile) {
  const totals = monthlyTotals(profile);
  const stats = describe(totals);
  const fixedCosts = fixedCostsTotal(profile);

  // Fewer than 4 months is too little to trust a percentile, so use the lowest month.
  const baselineRaw = stats.n < 4 ? stats.min : stats.p25;
  const steadyPay = round(Math.min(baselineRaw, stats.mean), 10);

  const spareMonthly = steadyPay - fixedCosts;
  const safeWeekly = Math.max(0, round(spareMonthly / WEEKS_PER_MONTH, 1));

  // The more income swings, the more months of bills the buffer should cover.
  const coverMonths = clamp(Math.round((2 + 4 * stats.cv) * 2) / 2, 2, 6);
  const bufferTarget = round(fixedCosts * coverMonths, 10);
  const savings = Number(profile.savings) || 0;
  const bufferProgress = bufferTarget > 0 ? clamp(savings / bufferTarget, 0, 1) : 1;

  let running = 0;
  const timeline = profile.months.map((month, i) => {
    const income = totals[i];
    const diff = income - steadyPay;
    running += diff;
    return {
      month,
      income,
      steadyPay,
      average: round(stats.mean),
      action: diff > 5 ? 'save' : diff < -5 ? 'draw' : 'even',
      amount: Math.abs(round(diff)),
      bufferFlow: round(running),
    };
  });

  const strongMonths = timeline.filter((t) => t.action === 'save');
  const weakMonths = timeline.filter((t) => t.action === 'draw');
  const monthsBelowCosts = totals.filter((t) => t < fixedCosts).length;
  const sourceShares = profile.sources
    .map((s) => ({ name: s.name, total: sum(s.amounts) }))
    .sort((a, b) => b.total - a.total);
  const totalIncome = sum(totals);
  const topShare = totalIncome > 0 ? sourceShares[0].total / totalIncome : 0;

  const status = spareMonthly < 0 ? 'deficit' : safeWeekly < 40 ? 'tight' : 'ok';

  return {
    totals,
    stats: { ...stats, mean: round(stats.mean), median: round(stats.median), p25: round(stats.p25) },
    fixedCosts: round(fixedCosts),
    steadyPay,
    overstatement: round(stats.mean - steadyPay),
    spareMonthly: round(spareMonthly),
    safeWeekly,
    coverMonths,
    bufferTarget,
    savings,
    bufferGap: Math.max(0, bufferTarget - savings),
    bufferProgress,
    timeline,
    strongMonths,
    weakMonths,
    monthsBelowCosts,
    topSource: sourceShares[0]?.name,
    topShare,
    consistency: consistencyLabel(stats.cv),
    status,
    advice: planAdvice({ status, safeWeekly, bufferTarget, savings, coverMonths, topShare, topSource: sourceShares[0]?.name, monthsBelowCosts, steadyPay, fixedCosts, stats }),
  };
}

function planAdvice(p) {
  const out = [];
  if (p.status === 'deficit') {
    out.push({
      tone: 'danger',
      title: 'Your fixed costs are higher than a typical low month',
      body: `In a low month you bring in about £${fmt(p.steadyPay)}, but your fixed costs are £${fmt(p.fixedCosts)}. Look at which bills can be lowered, paused or moved to a date after you are usually paid.`,
    });
  } else {
    out.push({
      tone: 'save',
      title: `Pay yourself £${fmt(p.steadyPay)} a month, whatever comes in`,
      body: `Move everything above that into your buffer in strong months, and top up from it in weak ones. That leaves about £${fmt(p.safeWeekly)} a week for everyday spending.`,
    });
  }
  if (p.savings < p.bufferTarget) {
    const gap = p.bufferTarget - p.savings;
    out.push({
      tone: 'draw',
      title: `Build your buffer to £${fmt(p.bufferTarget)}`,
      body: `That covers ${p.coverMonths} months of fixed costs. You have £${fmt(p.savings)} so far, so £${fmt(gap)} to go. Your strong months are the best time to close the gap.`,
    });
  } else {
    out.push({
      tone: 'save',
      title: 'Your buffer is fully built',
      body: `You hold at least ${p.coverMonths} months of fixed costs. Keep it topped up after you draw on it.`,
    });
  }
  if (p.topShare > 0.6 && p.topSource) {
    out.push({
      tone: 'info',
      title: `${Math.round(p.topShare * 100)}% of your income comes from ${p.topSource}`,
      body: 'Relying on one source makes a gap more likely to hurt. Try the Simulator to see what happens if it stops.',
    });
  } else if (p.monthsBelowCosts > 0) {
    out.push({
      tone: 'info',
      title: `${p.monthsBelowCosts} recent month${p.monthsBelowCosts > 1 ? 's' : ''} didn't cover your fixed costs`,
      body: 'Those are the months your buffer is for. Note when they happen so you can expect them next time.',
    });
  } else {
    out.push({
      tone: 'info',
      title: 'Every recent month covered your fixed costs',
      body: 'Good sign. Use the Simulator to check how you would cope if one source stopped.',
    });
  }
  return out;
}

/**
 * Simulator: projects the balance week by week when one income source stops.
 * Runs twice, starting from current savings ("without buffer") and from the
 * planner's buffer target ("with buffer"), so the two can be compared.
 */
export function simulate(profile, plan, scenario, today = new Date()) {
  const { sourceId, startWeek, durationWeeks, weeklySpend, horizon = 26 } = scenario;
  const start = startOfDay(today);

  const weeklyIncome = profile.sources.map((s) => ({
    id: s.id,
    name: s.name,
    weekly: describe(s.amounts.map(Number).filter((n) => !Number.isNaN(n))).median / WEEKS_PER_MONTH,
  }));
  const stopsAll = sourceId === 'all';
  const lostSource = weeklyIncome.find((s) => s.id === sourceId);

  const costs = [...profile.costs].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1),
  );

  const run = (startBalance) => {
    let balance = startBalance;
    let runOutWeek = null;
    let lowest = balance;
    const billsHit = [];
    const series = [];
    for (let w = 0; w < horizon; w++) {
      const weekStart = addDays(start, w * 7);
      const weekEnd = addDays(weekStart, 6);
      const inShock = w + 1 >= startWeek && (durationWeeks === 0 || w + 1 < startWeek + durationWeeks);
      const income = weeklyIncome.reduce((acc, s) => {
        if (inShock && (stopsAll || s.id === sourceId)) return acc;
        return acc + s.weekly;
      }, 0);
      balance += income - weeklySpend;
      for (const bill of costs) {
        if (!dueInRange(bill.dueDay, weekStart, weekEnd)) continue;
        balance -= Number(bill.amount) || 0;
        if (balance < 0) billsHit.push({ week: w + 1, date: dueDate(bill.dueDay, weekStart, weekEnd), name: bill.name, amount: bill.amount, priority: bill.priority });
      }
      if (balance < 0 && runOutWeek === null) runOutWeek = w + 1;
      lowest = Math.min(lowest, balance);
      series.push({ week: w + 1, date: weekStart, balance: round(balance), inShock });
    }
    return {
      startBalance: round(startBalance),
      runOutWeek,
      runOutDate: runOutWeek ? addDays(start, (runOutWeek - 1) * 7) : null,
      lowest: round(lowest),
      shortfall: round(Math.max(0, -lowest)),
      billsHit,
      endBalance: round(balance),
      series,
    };
  };

  const savings = Number(profile.savings) || 0;
  const without = run(savings);
  const withBuffer = run(Math.max(savings, plan.bufferTarget));
  const weeklyLoss = stopsAll ? sum(weeklyIncome.map((s) => s.weekly)) : lostSource?.weekly ?? 0;

  return {
    lostName: stopsAll ? 'all your income' : lostSource?.name ?? 'this source',
    weeklyLoss: round(weeklyLoss),
    totalLoss: round(weeklyLoss * Math.max(0, Math.min(durationWeeks || horizon, horizon - startWeek + 1))),
    without,
    withBuffer,
    series: without.series.map((p, i) => ({
      week: p.week,
      date: p.date,
      without: p.balance,
      with: withBuffer.series[i].balance,
      inShock: p.inShock,
    })),
    horizon,
  };
}

/** "Prove My Income" summary. */
export function buildReport(profile) {
  const totals = monthlyTotals(profile);
  const stats = describe(totals);
  const totalIncome = sum(totals);
  const lowestIdx = totals.indexOf(stats.min);
  const highestIdx = totals.indexOf(stats.max);
  const fixedCosts = fixedCostsTotal(profile);

  let streak = 0;
  let best = 0;
  for (const t of totals) {
    streak = t > 0 ? streak + 1 : 0;
    best = Math.max(best, streak);
  }

  const bySource = profile.sources
    .map((s) => {
      const amounts = s.amounts.map((a) => Number(a) || 0);
      const active = amounts.filter((a) => a > 0);
      const total = sum(amounts);
      return {
        id: s.id,
        name: s.name,
        kind: s.kind,
        total: round(total),
        share: totalIncome > 0 ? total / totalIncome : 0,
        monthsActive: active.length,
        averageActive: active.length ? round(total / active.length) : 0,
        amounts,
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    months: profile.months,
    totals: totals.map((t) => round(t)),
    totalIncome: round(totalIncome),
    average: round(stats.mean),
    median: round(stats.median),
    lowest: { amount: round(stats.min), month: profile.months[lowestIdx] },
    highest: { amount: round(stats.max), month: profile.months[highestIdx] },
    monthsWithIncome: totals.filter((t) => t > 0).length,
    monthCount: totals.length,
    longestStreak: best,
    monthsCoveringCosts: fixedCosts > 0 ? totals.filter((t) => t >= fixedCosts).length : null,
    variation: Math.round(stats.cv * 100),
    consistency: consistencyLabel(stats.cv),
    bySource,
  };
}

// ---- date helpers ----
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function dueDate(day, from, to) {
  for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    if (d.getDate() === Math.min(day, last)) return d;
  }
  return null;
}
const dueInRange = (day, from, to) => dueDate(Number(day) || 1, from, to) !== null;

function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}
