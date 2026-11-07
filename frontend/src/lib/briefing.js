import { monthLabel } from './format';

// The spoken briefing. Built only from figures lib/engine.js already calculated,
// so the voice never invents numbers. Written for the ear: short sentences, round pounds.
const say = (n) => `${Math.round(Math.abs(n)).toLocaleString('en-GB')} pounds`;
const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);

export function planBriefing(plan, name) {
  const hi = name && !/^sample/i.test(name) ? `Hi ${name.split(' ')[0]}. ` : 'Hi. ';
  const parts = [hi + 'Here’s your week with Sothis.'];

  if (plan.safeWeekly > 0) {
    parts.push(`You can safely spend about ${say(plan.safeWeekly)} a week on food, travel and everyday things, after your bills are paid.`);
  } else {
    parts.push(`Right now your bills are bigger than your income in a quiet month, so there’s nothing spare to spend safely. Let’s look at what you can change.`);
  }

  parts.push(
    `That’s based on ${say(plan.steadyPay)} a month, a cautious figure from your quieter months, not your average of ${say(plan.stats.mean)}.`,
  );

  const weak = plan.timeline.filter((t) => t.action === 'draw').map((t) => monthLabel(t.month, { long: true }));
  const strong = plan.timeline.filter((t) => t.action === 'save');
  if (strong.length) {
    const best = strong.reduce((a, b) => (b.amount > a.amount ? b : a));
    parts.push(`In strong months like ${monthLabel(best.month, { long: true })}, put about ${say(best.amount)} aside.`);
  }
  if (weak.length) parts.push(`Expect to lean on that in ${list(weak.slice(0, 3))}.`);

  if (plan.bufferTarget > 0) {
    const pct = Math.round(plan.bufferProgress * 100);
    parts.push(
      pct >= 100
        ? `Your safety buffer is full, at ${say(plan.savings)}. Nice work.`
        : `Your safety buffer goal is ${say(plan.bufferTarget)}, about ${plan.coverMonths} months of bills. You’re ${pct} percent of the way there.`,
    );
  }

  parts.push('Remember, this is a planning estimate, not financial advice.');
  return parts.join(' ');
}
