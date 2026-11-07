import { IncomeChart } from '../../components/Charts';
import { Explain } from '../../components/Explain';
import { gbp, monthLabel, pct } from '../../lib/format';
import { IconArrow } from '../../components/Icons';
import { GLOSSARY, Term } from '../../components/Term';

export function PlanResults({ plan, profile, onEdit }) {
  const figures = {
    steadyPay: plan.steadyPay,
    average: plan.stats.mean,
    lowest: plan.stats.min,
    highest: plan.stats.max,
    fixedCosts: plan.fixedCosts,
    safeWeekly: plan.safeWeekly,
    bufferTarget: plan.bufferTarget,
    savings: plan.savings,
    coverMonths: plan.coverMonths,
    consistency: plan.consistency,
    monthsBelowCosts: plan.monthsBelowCosts,
    topSource: plan.topSource,
    topSharePct: Math.round(plan.topShare * 100),
    status: plan.status,
    strongMonths: plan.strongMonths.map((m) => monthLabel(m.month, { long: true })),
    weakMonths: plan.weakMonths.map((m) => monthLabel(m.month, { long: true })),
  };

  return (
    <div className="fade-in">
      <div className="hero-figure">
        <div className="lead">
          <div className="figure-label"><Term def={GLOSSARY.safeWeekly}>Safe to spend each week</Term></div>
          <div className="figure-value num">
            {gbp(plan.safeWeekly)}<small>/week</small>
          </div>
          <div className="figure-note">
            {plan.status === 'deficit'
              ? `Your fixed costs are ${gbp(-plan.spareMonthly)} a month more than a low month brings in.`
              : `For food, travel and everyday costs, after ${gbp(plan.fixedCosts)} of fixed bills a month.`}
          </div>
        </div>
        <div>
          <div className="figure-label"><Term def={GLOSSARY.steadyPay}>Steady monthly pay</Term></div>
          <div className="figure-value num">{gbp(plan.steadyPay)}</div>
          <div className="figure-note">{gbp(plan.overstatement)} below your {gbp(plan.stats.mean)} average</div>
        </div>
        <div>
          <div className="figure-label"><Term def={GLOSSARY.buffer}>Buffer target</Term></div>
          <div className="figure-value num">{gbp(plan.bufferTarget)}</div>
          <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(plan.bufferProgress * 100)} aria-label="Buffer progress">
            <span style={{ width: pct(plan.bufferProgress) }} />
          </div>
          <div className="figure-note">{gbp(plan.savings)} saved · {plan.coverMonths} months of bills</div>
        </div>
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="panel-head">
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Your income against your steady pay</h2>
            <p>The average looks safe, but it&rsquo;s pulled up by your best months. Your steady pay is what you can count on.</p>
          </div>
          <button className="btn btn-secondary btn-small" onClick={onEdit}>Edit my details</button>
        </div>
        <IncomeChart plan={plan} />
      </section>

      <div className="two-col" style={{ marginTop: 16 }}>
        <section className="panel">
          <h2 style={{ fontSize: '1.15rem', marginBottom: 4 }}>When to save, when to draw</h2>
          <p className="muted small" style={{ marginBottom: 12 }}>
            Following the plan over your last {profile.months.length} months would have looked like this.
          </p>
          <ul className="month-list">
            {plan.timeline.map((t) => (
              <li key={t.month}>
                <span className="muted">{monthLabel(t.month)}</span>
                <span className="num">{gbp(t.income)}</span>
                {t.action === 'save' && <span className="tag save">Set aside {gbp(t.amount)}</span>}
                {t.action === 'draw' && <span className="tag draw">Draw {gbp(t.amount)}</span>}
                {t.action === 'even' && <span className="tag even">On target</span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2 style={{ fontSize: '1.15rem', marginBottom: 12 }}>Analysis</h2>
          <ul className="analysis">
            <li><span>Average month</span><span>{gbp(plan.stats.mean)}</span></li>
            <li><span>Lowest month</span><span>{gbp(plan.stats.min)}</span></li>
            <li><span>Highest month</span><span>{gbp(plan.stats.max)}</span></li>
            <li><span>Fixed costs each month</span><span>{gbp(plan.fixedCosts)}</span></li>
            <li><span>How steady your income is</span><span>{plan.consistency}</span></li>
            <li><span>Months that didn&rsquo;t cover fixed costs</span><span>{plan.monthsBelowCosts} of {profile.months.length}</span></li>
            <li><span>Biggest source</span><span>{plan.topSource} ({pct(plan.topShare)})</span></li>
          </ul>
          <p className="hint" style={{ marginTop: 14 }}>
            Steady pay is the 25th percentile of your monthly income: a month lower than 3 in 4 of your recent ones
            {profile.months.length < 4 ? ' (with under 4 months of data we use your lowest month)' : ''}. The buffer covers
            2 to 6 months of fixed costs, more when your income swings more.
          </p>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: 16 }}>Advice</h2>
        <ul className="advice-list">
          {plan.advice.map((a) => (
            <li key={a.title} className={a.tone}>
              <div>
                <h4>{a.title}</h4>
                <p>{a.body}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="row" style={{ marginTop: 20 }}>
          <a className="btn btn-secondary btn-small" href="#/simulate">Test what happens if a job stops <IconArrow /></a>
        </div>
      </section>

      <div style={{ marginTop: 16 }}>
        <Explain kind="plan" figures={figures} />
      </div>
    </div>
  );
}
