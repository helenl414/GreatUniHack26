import { useMemo, useRef, useState } from 'react';
import { useProfile } from '../lib/store';
import { buildReport } from '../lib/engine';
import { gbp, longDate, monthLabel, pct } from '../lib/format';
import { SOURCE_KINDS } from '../lib/sample';
import { PageHead } from '../components/AppShell';
import { Explain } from '../components/Explain';
import { NeedsPlan } from '../components/NeedsPlan';
import { SampleBanner } from '../components/SampleBanner';
import { IconDownload, IconPrint } from '../components/Icons';

const kindLabel = (k) => SOURCE_KINDS.find((x) => x.value === k)?.label ?? 'Other';

// Static SVG (not a charting library) so it prints crisply and survives being saved as a file.
function MonthlyBars({ months, totals, average }) {
  const W = 720;
  const H = 170;
  const pad = { t: 18, b: 26, l: 0, r: 0 };
  const max = Math.max(...totals, 1);
  const bw = (W - pad.l - pad.r) / totals.length;
  const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Monthly income bar chart">
      {totals.map((t, i) => (
        <g key={months[i]}>
          <rect x={pad.l + i * bw + bw * 0.18} y={y(t)} width={bw * 0.64} height={H - pad.b - y(t)} rx="4" fill="#7491CF" />
          <text x={pad.l + i * bw + bw / 2} y={y(t) - 5} textAnchor="middle" fontSize="11" fill="#2A2433" fontWeight="600">{gbp(t)}</text>
          <text x={pad.l + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#57505F">{monthLabel(months[i])}</text>
        </g>
      ))}
      <line x1="0" x2={W} y1={y(average)} y2={y(average)} stroke="#5B3E96" strokeWidth="1.5" strokeDasharray="5 4" />
      <line x1="0" x2={W} y1={H - pad.b} y2={H - pad.b} stroke="#B9B1C9" />
    </svg>
  );
}

function collectCss() {
  let css = '';
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      css += Array.from(sheet.cssRules).map((r) => r.cssText).join('\n');
    } catch {
      /* cross-origin sheet: skip */
    }
  }
  return css;
}

export default function Report() {
  const { profile } = useProfile();
  const [name, setName] = useState(() => (profile && !profile.isSample ? profile.name : '') || '');
  const sheetRef = useRef(null);
  const report = useMemo(() => (profile && profile.sources.length ? buildReport(profile) : null), [profile]);

  if (!report) {
    return (
      <div className="wrap">
        <PageHead step="Tool 3 of 3" title="Prove My Income" />
        <NeedsPlan what="build your income summary" />
      </div>
    );
  }

  const today = new Date();
  const period = `${monthLabel(report.months[0], { long: true, year: true })} – ${monthLabel(report.months.at(-1), { long: true, year: true })}`;
  const displayName = name.trim() || (profile.isSample ? 'Sample user' : '');

  const download = () => {
    const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Income summary${displayName ? ` – ${displayName}` : ''}</title><style>${collectCss()} body{background:#fff;padding:24px}</style></head><body>${sheetRef.current.outerHTML}</body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `income-summary-${today.toISOString().slice(0, 10)}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const figures = {
    average: report.average,
    lowest: report.lowest.amount,
    lowestMonth: monthLabel(report.lowest.month, { long: true }),
    highest: report.highest.amount,
    highestMonth: monthLabel(report.highest.month, { long: true }),
    monthsWithIncome: report.monthsWithIncome,
    monthCount: report.monthCount,
    consistency: report.consistency,
    variationPct: report.variation,
    sourceCount: report.bySource.length,
    topSource: report.bySource[0]?.name,
    monthsCoveringCosts: report.monthsCoveringCosts,
  };

  return (
    <div className="wrap">
      <PageHead step="Tool 3 of 3" title="Prove My Income">
        A clear, one-page summary of your income history to share with a landlord or lender. It&rsquo;s labelled as self-reported, so pair it with bank statements.
      </PageHead>

      {profile.isSample && <SampleBanner />}

      <div className="report-toolbar no-print">
        <div className="field">
          <label htmlFor="report-name">Name on the summary</label>
          <input id="report-name" className="input" value={name} placeholder="Your full name" onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <IconPrint /> Print or save as PDF
        </button>
        <button className="btn btn-secondary" onClick={download}>
          <IconDownload /> Download file
        </button>
      </div>

      <div className="report-scroll">
        <article className="report-sheet" ref={sheetRef} aria-label="Income summary">
          <header className="report-header">
            <div>
              <span className="report-label">Self-reported summary</span>
              <h1>Income summary</h1>
              <p style={{ color: '#57505F', marginTop: 4 }}>{period} · {report.monthCount} months</p>
            </div>
            <div className="report-meta">
              <strong>{displayName || 'Name not provided'}</strong>
              Prepared {longDate(today)}
              <br />
              Made with Sothis
            </div>
          </header>

          <div className="report-kpis">
            <div>
              <div className="k-label">Average month</div>
              <div className="k-value">{gbp(report.average)}</div>
              <div className="k-note">Median {gbp(report.median)}</div>
            </div>
            <div>
              <div className="k-label">Lowest month</div>
              <div className="k-value">{gbp(report.lowest.amount)}</div>
              <div className="k-note">{monthLabel(report.lowest.month, { year: true })}</div>
            </div>
            <div>
              <div className="k-label">Highest month</div>
              <div className="k-value">{gbp(report.highest.amount)}</div>
              <div className="k-note">{monthLabel(report.highest.month, { year: true })}</div>
            </div>
            <div>
              <div className="k-label">Total received</div>
              <div className="k-value">{gbp(report.totalIncome)}</div>
              <div className="k-note">{report.bySource.length} source{report.bySource.length > 1 ? 's' : ''}</div>
            </div>
          </div>

          <h2>Income by month</h2>
          <MonthlyBars months={report.months} totals={report.totals} average={report.average} />
          <p style={{ fontSize: '0.75rem', color: '#6B6475', marginTop: 4 }}>Dashed line: average month ({gbp(report.average)}).</p>

          <h2>Income by source</h2>
          <div style={{ overflowX: 'auto' }}>
          <table className="report-table">
            <thead>
              <tr>
                <th>Source</th>
                <th className="hide-sm">Type</th>
                <th className="r">Months paid</th>
                <th className="r">Avg. when paid</th>
                <th className="r">Total</th>
                <th className="r">Share</th>
              </tr>
            </thead>
            <tbody>
              {report.bySource.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td className="hide-sm">{kindLabel(s.kind)}</td>
                  <td className="r">{s.monthsActive} of {report.monthCount}</td>
                  <td className="r">{gbp(s.averageActive)}</td>
                  <td className="r">{gbp(s.total)}</td>
                  <td className="r">{pct(s.share)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>All sources</td>
                <td className="hide-sm" />
                <td className="r">{gbp(report.totalIncome)}</td>
                <td className="r">100%</td>
              </tr>
            </tfoot>
          </table>
          </div>

          <h2>Consistency</h2>
          <div className="report-consistency">
            <div>
              <strong>{report.monthsWithIncome} of {report.monthCount} months</strong>
              had income{report.longestStreak === report.monthCount ? ', with no gaps' : `; longest unbroken run ${report.longestStreak} months`}.
            </div>
            <div>
              <strong>{report.consistency}</strong>
              Monthly income typically varied by about {report.variation}% from the average.
            </div>
            <div>
              {report.monthsCoveringCosts != null ? (
                <>
                  <strong>{report.monthsCoveringCosts} of {report.monthCount} months</strong>
                  covered all stated fixed monthly costs.
                </>
              ) : (
                <>
                  <strong>{report.bySource.length} income source{report.bySource.length > 1 ? 's' : ''}</strong>
                  contributed over the period.
                </>
              )}
            </div>
          </div>

          <footer className="report-foot">
            <strong>Self-reported summary.</strong> These figures were entered by the person named above and have not
            been verified by Sothis, a bank or any third party. It is not a credit check, reference or statement of
            account. Amounts are money received after tax, rounded to the nearest pound. Please ask the person named
            for supporting evidence such as bank statements or payslips.
          </footer>
        </article>
      </div>

      <div className="no-print" style={{ marginTop: 16, maxWidth: 820, marginInline: 'auto' }}>
        <Explain kind="report" figures={figures} title="How to present this summary" />
      </div>
    </div>
  );
}
