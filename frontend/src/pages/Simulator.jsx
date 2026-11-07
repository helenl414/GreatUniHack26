import { useMemo, useState } from 'react';
import { useProfile } from '../lib/store';
import { simulate } from '../lib/engine';
import { dateLabel, gbp } from '../lib/format';
import { PageHead } from '../components/AppShell';
import { BalanceChart } from '../components/Charts';
import { Explain } from '../components/Explain';
import { SampleBanner } from '../components/SampleBanner';
import { NeedsPlan } from '../components/NeedsPlan';
import { GLOSSARY, Term } from '../components/Term';

const HORIZON = 26;

function Outcome({ kind, title, result, horizon }) {
  return (
    <div className={`outcome ${kind}`}>
      <h3>{title}</h3>
      <p className="verdict">
        {result.runOutWeek
          ? <>Money runs out in week {result.runOutWeek}<span className="muted" style={{ fontWeight: 500, fontSize: '1rem' }}> · {dateLabel(result.runOutDate)}</span></>
          : <>Stays above zero for all {horizon} weeks</>}
      </p>
      <dl>
        <dt>Starting balance</dt><dd>{gbp(result.startBalance)}</dd>
        <dt>Lowest point</dt><dd>{gbp(result.lowest)}</dd>
        <dt><Term def={GLOSSARY.shortfall}>Biggest shortfall</Term></dt><dd>{result.shortfall ? gbp(result.shortfall) : 'None'}</dd>
        <dt>Bill payments you couldn&rsquo;t cover</dt><dd>{result.billsHit.length}</dd>
      </dl>
    </div>
  );
}

export default function Simulator() {
  const { profile, plan } = useProfile();
  const [sourceId, setSourceId] = useState(() => profile?.sources[0]?.id ?? 'all');
  const [startWeek, setStartWeek] = useState(2);
  const [duration, setDuration] = useState(8);
  const [permanent, setPermanent] = useState(false);
  const [spend, setSpend] = useState(() => (plan ? Math.max(plan.safeWeekly, 40) : 60));

  const validSource = profile?.sources.some((s) => s.id === sourceId) || sourceId === 'all' ? sourceId : profile?.sources[0]?.id;

  const sim = useMemo(() => {
    if (!profile || !plan) return null;
    return simulate(profile, plan, {
      sourceId: validSource,
      startWeek,
      durationWeeks: permanent ? 0 : duration,
      weeklySpend: Number(spend) || 0,
      horizon: HORIZON,
    });
  }, [profile, plan, validSource, startWeek, duration, permanent, spend]);

  if (!profile || !plan) {
    return (
      <div className="wrap">
        <PageHead step="Tool 2 of 3" title="What-if Simulator" />
        <NeedsPlan what="test what happens if you lose a job" />
      </div>
    );
  }

  const endWeek = permanent ? HORIZON : startWeek + duration - 1;
  const w = sim.without;
  const b = sim.withBuffer;
  const weeksGained = (b.runOutWeek ?? HORIZON + 1) - (w.runOutWeek ?? HORIZON + 1);

  const figures = {
    lostName: sim.lostName,
    startWeek,
    durationWeeks: permanent ? 0 : duration,
    weeklyLoss: sim.weeklyLoss,
    horizon: HORIZON,
    without: { runOutWeek: w.runOutWeek, runOutDate: w.runOutDate ? dateLabel(w.runOutDate) : null, shortfall: w.shortfall, billsHit: [...new Set(w.billsHit.map((x) => x.name))] },
    with: { runOutWeek: b.runOutWeek, runOutDate: b.runOutDate ? dateLabel(b.runOutDate) : null, shortfall: b.shortfall, billsHit: [...new Set(b.billsHit.map((x) => x.name))] },
  };

  return (
    <div className="wrap">
      <PageHead step="Tool 2 of 3" title="What-if Simulator">
        Choose which income stops, when, and for how long. We project your balance week by week, with and without the planner&rsquo;s buffer.
      </PageHead>

      {profile.isSample && <SampleBanner />}

      <section className="panel">
        <h2 className="sr-only">Scenario</h2>
        <div className="sim-controls">
          <div className="field">
            <label htmlFor="sim-source">What if I lose…</label>
            <select id="sim-source" className="select" value={validSource} onChange={(e) => setSourceId(e.target.value)}>
              {profile.sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              {profile.sources.length > 1 && <option value="all">All my income</option>}
            </select>
          </div>
          <div className="field range-field">
            <label htmlFor="sim-start">Starting in week <output htmlFor="sim-start">{startWeek}</output></label>
            <input id="sim-start" type="range" min="1" max="12" value={startWeek} onChange={(e) => setStartWeek(Number(e.target.value))} />
          </div>
          <div className="field range-field">
            <label htmlFor="sim-dur">For <output htmlFor="sim-dur">{permanent ? 'good' : `${duration} weeks`}</output></label>
            <input id="sim-dur" type="range" min="1" max="26" value={duration} disabled={permanent} onChange={(e) => setDuration(Number(e.target.value))} />
            <label className="check"><input type="checkbox" checked={permanent} onChange={(e) => setPermanent(e.target.checked)} /> It doesn&rsquo;t come back</label>
          </div>
          <div className="field">
            <label htmlFor="sim-spend">Everyday spend per week</label>
            <div className="money">
              <input id="sim-spend" className="input" type="number" inputMode="decimal" min="0" value={spend} onChange={(e) => setSpend(e.target.value)} />
            </div>
            <span className="hint">Your plan says {gbp(plan.safeWeekly)}</span>
          </div>
        </div>
      </section>

      <div className="callout" style={{ margin: '16px 0' }} aria-live="polite">
        <span>
          Losing <strong>{sim.lostName}</strong> takes about <strong>{gbp(sim.weeklyLoss)} a week</strong> out of your income
          {' '}({gbp(sim.totalLoss)} in total over this period).{' '}
          {weeksGained > 0 && w.runOutWeek
            ? <>A full buffer would buy you <strong>{b.runOutWeek ? `${weeksGained} more weeks` : `all ${HORIZON} weeks`}</strong>.</>
            : !w.runOutWeek
              ? <>Your current savings already carry you through.</>
              : <>Even a full buffer doesn&rsquo;t change when you run out here, so look at cutting costs too.</>}
        </span>
      </div>

      <div className="outcomes">
        <Outcome kind="without" title="With your current savings" result={w} horizon={HORIZON} />
        <Outcome kind="with" title="With the planner&rsquo;s buffer" result={b} horizon={HORIZON} />
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="panel-head">
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Your balance, week by week</h2>
            <p>Next {HORIZON} weeks. Below the line means you&rsquo;d need to borrow, get help, or cut back.</p>
          </div>
        </div>
        <BalanceChart sim={sim} startWeek={startWeek} endWeek={endWeek} />
        <details className="data-toggle">
          <summary>Show the numbers as a table</summary>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <caption className="sr-only">Projected balance each week, with and without the buffer</caption>
              <thead>
                <tr><th scope="col">Week</th><th scope="col">Starts</th><th scope="col">Income lost?</th><th scope="col">With buffer</th><th scope="col">Current savings only</th></tr>
              </thead>
              <tbody>
                {sim.series.map((p) => (
                  <tr key={p.week}>
                    <th scope="row" style={{ textAlign: 'left', fontWeight: 600 }}>{p.week}</th>
                    <td>{dateLabel(p.date)}</td>
                    <td>{p.inShock ? 'Yes' : 'No'}</td>
                    <td>{gbp(p.with)}</td>
                    <td style={{ color: p.without < 0 ? 'var(--danger)' : undefined, fontWeight: p.without < 0 ? 650 : undefined }}>{gbp(p.without)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: '1.15rem' }}>Bills hit first</h2>
        <p className="muted small" style={{ margin: '4px 0 14px' }}>
          Without a buffer. Each week we pay essential bills first, then important, then flexible, so the first bills you can&rsquo;t cover from your own money show here.
        </p>
        {w.billsHit.length === 0 ? (
          <p>No bills go unpaid in this scenario, even without a buffer.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="bills-table">
              <thead>
                <tr><th>When</th><th>Bill</th><th>Priority</th><th className="r">Amount</th></tr>
              </thead>
              <tbody>
                {w.billsHit.slice(0, 6).map((x, i) => (
                  <tr key={i}>
                    <td>Week {x.week} · {dateLabel(x.date)}</td>
                    <td>{x.name}</td>
                    <td><span className={`tag ${x.priority === 'essential' ? 'danger' : x.priority === 'important' ? 'draw' : 'even'}`}>{x.priority}</span></td>
                    <td className="r">{gbp(x.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {w.billsHit.length > 6 && <p className="hint" style={{ marginTop: 8 }}>And {w.billsHit.length - 6} more after that.</p>}
          </div>
        )}
      </section>

      <div style={{ marginTop: 16 }}>
        <Explain kind="simulation" figures={figures} />
      </div>

      <p className="hint" style={{ marginTop: 16 }}>
        How this works: other income continues at its usual (median) weekly level, bills leave on their due day, and everyday spending leaves weekly.
        &ldquo;With the planner&rsquo;s buffer&rdquo; starts from your buffer target of {gbp(plan.bufferTarget)} instead of your current {gbp(plan.savings)}.
      </p>
    </div>
  );
}
