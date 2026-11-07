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

  const deficit = plan.status === 'deficit';

  return (
    <div className="fade-in pl-results">
      <div className="pl-hero">
        <div className="pl-stage">
          <div className="pl-stage-top">
            <div className="figure-label"><Term def={GLOSSARY.safeWeekly}>Safe to spend each week</Term></div>
            <button className="btn btn-small pl-edit" onClick={onEdit}>Edit details</button>
          </div>
          <div className="pl-big num">
            {gbp(plan.safeWeekly)}<small>/week</small>
          </div>
          <p className="pl-stage-note">
            {deficit
              ? `Fixed bills are ${gbp(-plan.spareMonthly)} a month more than a low month brings in.`
              : `For food, travel and everyday costs, after ${gbp(plan.fixedCosts)} of monthly bills.`}
          </p>
        </div>

        <div className="pl-side">
          <div className="pl-stat">
            <div className="figure-label"><Term def={GLOSSARY.steadyPay}>Baseline monthly pay</Term></div>
            <div className="figure-value num">{gbp(plan.steadyPay)}</div>
            <div className="figure-note">{gbp(plan.overstatement)} below your {gbp(plan.stats.mean)} average</div>
          </div>
          <div className="pl-stat">
            <div className="figure-label"><Term def={GLOSSARY.buffer}>Buffer target</Term></div>
            <div className="figure-value num">{gbp(plan.bufferTarget)}</div>
            <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(plan.bufferProgress * 100)} aria-label="Buffer progress">
              <span style={{ width: pct(plan.bufferProgress) }} />
            </div>
            <div className="figure-note">{gbp(plan.savings)} saved · {plan.coverMonths} months of bills</div>
          </div>
        </div>
      </div>

      <section className="panel pl-chart">
        <div className="panel-head">
          <div>
            <h2>Income vs. your baseline</h2>
            <p>Your best months pull the average up. The baseline is what you can count on.</p>
          </div>
        </div>
        <IncomeChart plan={plan} />
      </section>

      <div className="two-col pl-two">
        <section className="panel">
          <h2 className="pl-h">When to save, when to draw</h2>
          <p className="muted small pl-hsub">Your last {profile.months.length} months, following the plan.</p>
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
          <h2 className="pl-h">The numbers</h2>
          <ul className="analysis">
            <li><span>Average month</span><span>{gbp(plan.stats.mean)}</span></li>
            <li><span>Lowest month</span><span>{gbp(plan.stats.min)}</span></li>
            <li><span>Highest month</span><span>{gbp(plan.stats.max)}</span></li>
            <li><span>Fixed bills a month</span><span>{gbp(plan.fixedCosts)}</span></li>
            <li><span>How steady your income is</span><span>{plan.consistency}</span></li>
            <li><span>Months short of bills</span><span>{plan.monthsBelowCosts} of {profile.months.length}</span></li>
            <li><span>Biggest source</span><span>{plan.topSource} ({pct(plan.topShare)})</span></li>
          </ul>
          <p className="hint" style={{ marginTop: 16 }}>
            Baseline = the 25th percentile of your months
            {profile.months.length < 4 ? ' (under 4 months: your lowest month)' : ''}. Buffer = 2 to 6 months of bills, more when income swings more.
          </p>
        </section>
      </div>

      <section className="panel pl-advice">
        <h2 className="pl-h">What to do next</h2>
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
        <div className="row" style={{ marginTop: 24 }}>
          <a className="btn btn-primary btn-small" href="#/simulate">What if a job stops? <IconArrow /></a>
        </div>
      </section>

      <div className="pl-explain">
        <Explain kind="plan" figures={figures} />
      </div>
    </div>
  );
}
