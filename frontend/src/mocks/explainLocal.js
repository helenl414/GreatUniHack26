// MOCK — stands in for POST /api/explain until the AI backend is connected.
// Template-based wording over figures that were already calculated by lib/engine.js.
// Like the real AI layer, it never calculates anything new.

const money = (n) => `£${Math.round(n).toLocaleString('en-GB')}`;
const list = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);

function plan(f) {
  const summary =
    f.status === 'deficit'
      ? `In a low month you bring in about ${money(f.steadyPay)}, which is less than your ${money(f.fixedCosts)} of fixed costs. Planning around your average of ${money(f.average)} would hide that gap.`
      : `Your income averages ${money(f.average)} a month, but it isn't safe to plan on that. In a typical low month you get about ${money(f.steadyPay)}, so that is your "steady pay". After fixed costs, it leaves about ${money(f.safeWeekly)} a week to live on.`;

  const meaning = [
    `Your steady pay of ${money(f.steadyPay)} is lower than your average because 1 in 4 of your recent months came in at or below it. The average is pulled up by your best months (up to ${money(f.highest)}).`,
    `Your income is ${f.consistency.toLowerCase()}. That's why the plan suggests a buffer covering ${f.coverMonths} months of fixed costs: ${money(f.bufferTarget)}.`,
    f.weakMonths.length
      ? `Months like ${list(f.weakMonths.slice(0, 3))} came in under your steady pay. Those are the months a buffer would have carried you through.`
      : 'None of your recent months fell below your steady pay.',
  ];

  const steps = [];
  if (f.status === 'deficit') {
    steps.push(`List your bills from essential to flexible and look for ${money(f.fixedCosts - f.steadyPay)} a month you could cut, pause or renegotiate.`);
  } else {
    steps.push(`Set up a standing order of ${money(f.steadyPay)} a month from where you're paid into your everyday account, so you "pay yourself" the same amount every month.`);
  }
  steps.push(
    f.savings < f.bufferTarget
      ? `Open a separate easy-access savings pot for your buffer and move anything above ${money(f.steadyPay)} into it in strong months until it reaches ${money(f.bufferTarget)}.`
      : `Keep your ${money(f.bufferTarget)} buffer somewhere separate and easy to reach, and refill it after each weak month.`,
  );
  steps.push(
    f.topSharePct > 60
      ? `${f.topSharePct}% of your income comes from ${f.topSource}. Use the Simulator to see how long you'd last if it stopped.`
      : 'Revisit this plan each month with your latest income so the numbers stay true to your life.',
  );
  return { summary, meaning, steps };
}

function simulation(f) {
  const w = f.without;
  const b = f.with;
  const lasts = (r) => (r.runOutWeek ? `run out in week ${r.runOutWeek} (around ${r.runOutDate})` : `stay above zero for all ${f.horizon} weeks`);
  const summary = `If ${f.lostName} stopped from week ${f.startWeek}${f.durationWeeks ? ` for ${f.durationWeeks} weeks` : ' and did not come back'}, you'd lose about ${money(f.weeklyLoss)} a week. With your current savings you would ${lasts(w)}. With the planner's buffer you would ${lasts(b)}.`;

  const meaning = [
    w.runOutWeek
      ? `Without a buffer, the deepest you'd go below zero is ${money(w.shortfall)}. That's the gap you'd need to fill with borrowing, help or cuts.`
      : 'Even without the full buffer, your current savings carry you through this scenario.',
    w.billsHit.length
      ? `The first bills that couldn't be paid from your own money would be ${list(w.billsHit.slice(0, 3))}. Flexible bills are hit before essentials because essentials are paid first each week.`
      : 'No bills would go unpaid without a buffer in this scenario.',
    b.runOutWeek
      ? `The buffer helps, but isn't enough on its own for a gap this long: you'd still be short by ${money(b.shortfall)}.`
      : `The buffer turns a shortfall into a scenario you can get through. That's the value of setting money aside in strong months.`,
  ];

  const steps = [
    w.runOutWeek
      ? `Before week ${w.runOutWeek}, contact the companies behind ${w.billsHit[0] || 'your bills'} to ask about payment breaks. It's easier to arrange before a payment is missed.`
      : 'Keep your buffer where it is. This scenario shows it is doing its job.',
    'Write down one or two backup ways to earn (agency sign-ups, past employers, seasonal roles) so you can act quickly if this happens.',
    'Check whether you could claim Universal Credit or other support during a gap. A benefits calculator such as entitledto or Turn2us can tell you in minutes.',
  ];
  return { summary, meaning, steps };
}

function report(f) {
  const summary = `Over ${f.monthCount} months you earned in ${f.monthsWithIncome} of them, averaging ${money(f.average)} a month from ${f.sourceCount} source${f.sourceCount > 1 ? 's' : ''}. Your lowest month was ${money(f.lowest)} (${f.lowestMonth}) and your highest ${money(f.highest)} (${f.highestMonth}).`;
  const meaning = [
    `A landlord or lender will usually look first at your lowest month and how often you earned. Showing income in ${f.monthsWithIncome} of ${f.monthCount} months is evidence of reliability, even if the amounts vary.`,
    `Your income is ${f.consistency.toLowerCase()} (it moves about ${f.variationPct}% either side of the average in a typical month).`,
    f.monthsCoveringCosts != null
      ? `In ${f.monthsCoveringCosts} of ${f.monthCount} months your income covered all your fixed costs.`
      : 'Add your fixed costs in the planner to show how often your income covers them.',
  ];
  const steps = [
    'Attach bank statements or payslips for the same months. This summary is self-reported, so evidence makes it much stronger.',
    'Lead with the number of months you earned and your lowest month, not the average. It shows you have planned for the worst case.',
    'If you have a buffer saved, mention it: it shows you can keep paying through a quiet month.',
  ];
  return { summary, meaning, steps };
}

export function explainLocally(kind, figures) {
  if (kind === 'plan') return plan(figures);
  if (kind === 'simulation') return simulation(figures);
  return report(figures);
}
