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
  const safe = !result.runOutWeek;
  return (
    <article className={`sim-outcome ${kind}`}>
      <header className="sim-outcome-head">
        <span className="sim-dot" aria-hidden="true" />
        <h3>{title}</h3>
      </header>
      <p className="sim-verdict">
        {safe ? (
          <>Lasts all <span className="num">{horizon}</span> weeks</>
        ) : (
          <>Runs out in week <span className="num">{result.runOutWeek}</span></>
        )}
      </p>
      <p className="sim-verdict-sub">{safe ? 'Your balance stays above zero.' : `Around ${dateLabel(result.runOutDate)}`}</p>
      <dl className="sim-stats">
        <div><dt>Starts at</dt><dd>{gbp(result.startBalance)}</dd></div>
        <div><dt>Lowest point</dt><dd>{gbp(result.lowest)}</dd></div>
        <div><dt><Term def={GLOSSARY.shortfall}>Shortfall</Term></dt><dd>{result.shortfall ? gbp(result.shortfall) : 'None'}</dd></div>
        <div><dt>Bills missed</dt><dd>{result.billsHit.length}</dd></div>
      </dl>
    </article>
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

  const sourceOptions = [
    ...profile.sources.map((s) => ({ id: s.id, name: s.name })),
    ...(profile.sources.length > 1 ? [{ id: 'all', name: 'All my income' }] : []),
  ];
  const usePills = sourceOptions.length <= 4;

  const headline = !w.runOutWeek
    ? 'Your savings already carry you through.'
    : weeksGained > 0
      ? b.runOutWeek
        ? `A full buffer buys you ${weeksGained} more week${weeksGained === 1 ? '' : 's'}.`
        : `A full buffer carries you all ${HORIZON} weeks.`
      : 'A buffer alone won’t close this gap.';

  return (
    <div className="wrap sim">
      <PageHead step="Tool 2 of 3" title="What if a job stops?">
        Pick an income, when it stops and for how long. We project your balance week by week.
      </PageHead>

      {profile.isSample && <SampleBanner />}

      <section className="sim-strip" aria-labelledby="sim-scenario">
        <h2 id="sim-scenario" className="sr-only">Scenario</h2>

        <div className="sim-ctl sim-ctl-source">
          {usePills ? (
            <fieldset className="sim-fieldset">
              <legend className="sim-label">If I lose</legend>
              <div className="sim-pills">
                {sourceOptions.map((s) => (
                  <label key={s.id} className="sim-pill">
                    <input type="radio" name="sim-source" value={s.id} checked={validSource === s.id} onChange={() => setSourceId(s.id)} />
                    <span>{s.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <div className="field">
              <label className="sim-label" htmlFor="sim-source">If I lose</label>
              <select id="sim-source" className="select" value={validSource} onChange={(e) => setSourceId(e.target.value)}>
                {sourceOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="sim-ctl">
          <div className="sim-range-head">
            <label className="sim-label" htmlFor="sim-start">Starting</label>
            <output className="sim-readout" htmlFor="sim-start">Week {startWeek}</output>
          </div>
          <input id="sim-start" className="sim-range" type="range" min="1" max="12" value={startWeek}
            style={{ '--fill': `${((startWeek - 1) / 11) * 100}%` }}
            onChange={(e) => setStartWeek(Number(e.target.value))} />
          <div className="sim-scale" aria-hidden="true"><span>1</span><span>12</span></div>
        </div>

        <div className="sim-ctl">
          <div className="sim-range-head">
            <label className="sim-label" htmlFor="sim-dur">For</label>
            <output className="sim-readout" htmlFor="sim-dur">{permanent ? 'For good' : `${duration} week${duration === 1 ? '' : 's'}`}</output>
          </div>
          <input id="sim-dur" className="sim-range" type="range" min="1" max="26" value={duration} disabled={permanent}
            style={{ '--fill': `${((duration - 1) / 25) * 100}%` }}
            onChange={(e) => setDuration(Number(e.target.value))} />
          <label className="sim-switch">
            <input className="switch" type="checkbox" checked={permanent} onChange={(e) => setPermanent(e.target.checked)} />
            <span>It doesn&rsquo;t come back</span>
          </label>
        </div>

        <div className="sim-ctl">
          <label className="sim-label" htmlFor="sim-spend">Everyday spend / week</label>
          <div className="money">
            <input id="sim-spend" className="input" type="number" inputMode="decimal" min="0" value={spend} onChange={(e) => setSpend(e.target.value)} />
          </div>
          <button type="button" className="sim-reset" onClick={() => setSpend(plan.safeWeekly)}>
            Plan says {gbp(plan.safeWeekly)}
          </button>
        </div>
      </section>

      <section className="sim-stage" aria-labelledby="sim-verdict">
        <div className="sim-stage-copy" aria-live="polite">
          <p className="sim-stage-eyebrow">Losing {sim.lostName}: {gbp(sim.weeklyLoss)} less a week</p>
          <h2 id="sim-verdict" className="sim-stage-title">{headline}</h2>
          <p className="sim-stage-sub">{gbp(sim.totalLoss)} less income over this period.</p>
        </div>
        <div className="sim-compare">
          <Outcome kind="without" title="Current savings" result={w} horizon={HORIZON} />
          <Outcome kind="with" title="With the planner’s buffer" result={b} horizon={HORIZON} />
        </div>
      </section>

      <section className="panel sim-chart">
        <div className="panel-head">
          <div>
            <h2>Balance, week by week</h2>
            <p>Next {HORIZON} weeks. Below £0 means borrowing, help or cutting back.</p>
          </div>
        </div>
        <BalanceChart sim={sim} startWeek={startWeek} endWeek={endWeek} />
        <details className="data-toggle">
          <summary>Show as a table</summary>
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

      <div className="sim-lower">
        <section className="panel sim-bills">
          <div className="panel-head">
            <div>
              <h2>Bills hit first</h2>
              <p>Without a buffer. Essentials are paid first, then important, then flexible.</p>
            </div>
          </div>
          {w.billsHit.length === 0 ? (
            <p className="sim-allclear">No bills go unpaid, even without a buffer.</p>
          ) : (
            <>
              <ul className="sim-bill-list">
                {w.billsHit.slice(0, 6).map((x, i) => (
                  <li key={i}>
                    <div className="sim-bill-main">
                      <strong>{x.name}</strong>
                      <span>Week {x.week} · {dateLabel(x.date)}</span>
                    </div>
                    <span className={`tag ${x.priority === 'essential' ? 'danger' : x.priority === 'important' ? 'draw' : 'even'}`}>{x.priority}</span>
                    <span className="sim-bill-amt num">{gbp(x.amount)}</span>
                  </li>
                ))}
              </ul>
              {w.billsHit.length > 6 && <p className="hint" style={{ marginTop: 10 }}>And {w.billsHit.length - 6} more after that.</p>}
            </>
          )}
        </section>

        <div className="sim-explain">
          <Explain kind="simulation" figures={figures} />
        </div>
      </div>

      <p className="hint sim-method">
        Other income continues at its usual (median) weekly level, bills leave on their due day, everyday spending leaves weekly.
        &ldquo;With the planner&rsquo;s buffer&rdquo; starts from your target of {gbp(plan.bufferTarget)} instead of your current {gbp(plan.savings)}.
      </p>
    </div>
  );
}
