import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartTheme } from '../lib/useChartTheme';
import { dateLabel, gbp, monthLabel } from '../lib/format';

const axisMoney = (v) => (Math.abs(v) >= 1000 ? `£${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : `£${v}`);

function Tip({ active, payload, title, rows }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="tooltip chart-tip">
      <strong>{title(d)}</strong>
      {rows(d).map(([k, v]) => (
        <div className="tt-row" key={k}><span>{k}</span><span>{v}</span></div>
      ))}
    </div>
  );
}

/** Actual monthly income (bars) against the steady-pay line and the plain average. */
export function IncomeChart({ plan }) {
  const c = useChartTheme();
  const data = plan.timeline.map((t) => ({ ...t, label: monthLabel(t.month) }));
  return (
    <>
      <div className="chart-box" role="img" aria-label={`Bar chart of monthly income from ${gbp(plan.stats.min)} to ${gbp(plan.stats.max)}, with a steady pay line at ${gbp(plan.steadyPay)} and the average at ${gbp(plan.stats.mean)}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 4 }}>
            <CartesianGrid vertical={false} stroke={c.grid} strokeDasharray="2 4" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: c.ink3, fontSize: 12, fontWeight: 500 }} dy={6} />
            <YAxis tickFormatter={axisMoney} tickLine={false} axisLine={false} tick={{ fill: c.ink3, fontSize: 11.5 }} width={48} />
            <Tooltip
              cursor={{ fill: c.cursor, radius: 8 }}
              content={
                <Tip
                  title={(d) => monthLabel(d.month, { long: true, year: true })}
                  rows={(d) => [
                    ['Income', gbp(d.income)],
                    ['Steady pay', gbp(d.steadyPay)],
                    [d.action === 'save' ? 'Set aside' : d.action === 'draw' ? 'Draw from buffer' : 'Difference', gbp(d.amount)],
                  ]}
                />
              }
            />
            <Bar dataKey="income" radius={[6, 6, 0, 0]} maxBarSize={44} isAnimationActive={false}>
              {data.map((d) => <Cell key={d.month} fill={d.action === 'draw' ? c.barLow : c.bar} stroke={d.action === 'draw' ? c.barLowStroke : 'none'} strokeWidth={1.5} />)}
            </Bar>
            <Line dataKey="average" stroke={c.average} strokeWidth={1.5} strokeDasharray="4 5" dot={false} isAnimationActive={false} />
            <Line dataKey="steadyPay" type="monotone" stroke={c.steady} strokeWidth={3} strokeLinecap="round" dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="legend" aria-hidden="true">
        <span><i className="swatch" style={{ background: c.bar }} /> Income, at or above steady pay</span>
        <span><i className="swatch" style={{ background: c.barLow, outline: `1.5px solid ${c.barLowStroke}`, outlineOffset: -1.5 }} /> Below steady pay</span>
        <span><i className="swatch line" style={{ background: c.steady }} /> Steady pay {gbp(plan.steadyPay)}</span>
        <span><i className="swatch dash" style={{ borderColor: c.average }} /> Average {gbp(plan.stats.mean)}</span>
      </div>
    </>
  );
}

/** Week-by-week balance with and without the planner's buffer. */
export function BalanceChart({ sim, startWeek, endWeek }) {
  const c = useChartTheme();
  const data = sim.series.map((p) => ({ ...p, label: `W${p.week}` }));
  return (
    <>
      <div className="chart-box" role="img" aria-label={`Line chart of projected balance over ${sim.horizon} weeks, with and without a buffer.`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 4 }}>
            <CartesianGrid vertical={false} stroke={c.grid} strokeDasharray="2 4" />
            <ReferenceArea x1={`W${startWeek}`} x2={`W${Math.min(endWeek, sim.horizon)}`} fill={c.shock} fillOpacity={1} ifOverflow="hidden" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: c.ink3, fontSize: 12, fontWeight: 500 }} dy={6} interval="preserveStartEnd" minTickGap={18} />
            <YAxis tickFormatter={axisMoney} tickLine={false} axisLine={false} tick={{ fill: c.ink3, fontSize: 11.5 }} width={52} />
            <ReferenceLine y={0} stroke={c.zero} strokeOpacity={0.5} strokeDasharray="3 4" label={{ value: '£0', position: 'insideTopLeft', fill: c.ink3, fontSize: 11 }} />
            <Tooltip
              cursor={{ stroke: c.ink3, strokeWidth: 1, strokeDasharray: '3 4' }}
              content={
                <Tip
                  title={(d) => `Week ${d.week} · from ${dateLabel(d.date)}`}
                  rows={(d) => [
                    ['With buffer', gbp(d.with)],
                    ['Without buffer', gbp(d.without)],
                    ...(d.inShock ? [['Income lost', 'this week']] : []),
                  ]}
                />
              }
            />
            <Line dataKey="with" type="monotone" stroke={c.with} strokeWidth={3} strokeLinecap="round" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} isAnimationActive={false} />
            <Line dataKey="without" type="monotone" stroke={c.without} strokeWidth={3} strokeLinecap="round" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="legend" aria-hidden="true">
        <span><i className="swatch line" style={{ background: c.with }} /> With the planner&rsquo;s buffer</span>
        <span><i className="swatch line" style={{ background: c.without }} /> With current savings only</span>
        <span><i className="swatch" style={{ background: c.shock, outline: `1px solid ${c.grid}` }} /> Income stopped</span>
      </div>
    </>
  );
}
