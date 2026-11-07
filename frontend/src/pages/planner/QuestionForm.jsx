import { useState } from 'react';
import { COMMON_COSTS, PRIORITIES, SOURCE_KINDS } from '../../lib/sample';
import { monthLabel, recentMonths, uid } from '../../lib/format';
import { IconArrow, IconBack, IconInfo, IconPlus, IconTrash } from '../../components/Icons';

function MoneyInput({ id, value, onChange, label, ...rest }) {
  return (
    <div className="money">
      <input
        id={id}
        className="input"
        inputMode="decimal"
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onWheel={(e) => e.currentTarget.blur()}
        aria-label={label}
        {...rest}
      />
    </div>
  );
}

export function QuestionForm({ draft, setDraft, onSubmit, onBack, notice }) {
  const [error, setError] = useState(null);
  const months = draft.months;

  const update = (patch) => {
    if (error) setError(null);
    setDraft((d) => ({ ...d, ...patch }));
  };
  const updateSource = (id, patch) =>
    update({ sources: draft.sources.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const updateCost = (id, patch) => update({ costs: draft.costs.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  const setMonthCount = (n) => {
    const next = recentMonths(n);
    // keep amounts aligned to the same calendar months where they overlap
    const remap = (amounts) => next.map((m) => {
      const i = months.indexOf(m);
      return i >= 0 ? amounts[i] : '';
    });
    update({ months: next, sources: draft.sources.map((s) => ({ ...s, amounts: remap(s.amounts) })) });
  };

  const addSource = () =>
    update({ sources: [...draft.sources, { id: uid(), name: '', kind: 'part-time', amounts: months.map(() => '') }] });

  const fillSame = (s) => {
    const first = s.amounts.find((a) => a !== '' && a != null);
    if (first !== undefined) updateSource(s.id, { amounts: months.map(() => first) });
  };

  const addCost = (preset = {}) =>
    update({ costs: [...draft.costs, { id: uid(), name: '', amount: '', dueDay: 1, priority: 'important', ...preset }] });

  const submit = (e) => {
    e.preventDefault();
    const hasIncome = draft.sources.some((s) => s.amounts.some((a) => Number(a) > 0));
    if (!hasIncome) {
      setError('Add at least one month of income so we have something to plan with.');
      const first = document.querySelector('#q-income input[inputmode="decimal"]');
      first?.focus();
      first?.scrollIntoView({ block: 'center' });
      return;
    }
    setError(null);
    onSubmit();
  };

  const steps = [
    { id: 'q-months', label: 'Months', done: true },
    { id: 'q-income', label: 'Income', done: draft.sources.some((s) => s.amounts.some((a) => Number(a) > 0)) },
    { id: 'q-costs', label: 'Bills', done: draft.costs.some((c) => Number(c.amount) > 0) },
    { id: 'q-savings', label: 'Savings', done: draft.savings !== '' && draft.savings != null },
  ];
  const jumpTo = (id) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ block: 'start' });
    el?.querySelector('h3')?.focus();
  };

  const unusedPresets = COMMON_COSTS.filter((p) => !draft.costs.some((c) => c.name.toLowerCase() === p.name.toLowerCase()));

  return (
    <form className="panel pl-form fade-in" onSubmit={submit} noValidate>
      <div className="pl-form-top">
        <button type="button" className="btn btn-ghost btn-small pl-back" onClick={onBack}>
          <IconBack /> Back
        </button>
        <span className="hint">{steps.filter((s) => s.done).length} of {steps.length} answered</span>
      </div>

      {notice && (
        <div className="callout" style={{ margin: '12px 0 8px' }}>
          <IconInfo />
          <div>{notice}</div>
        </div>
      )}

      <nav aria-label="Questions" className="pl-steps-nav">
        <ol className="form-steps pl-steps">
          {steps.map((st, i) => (
            <li key={st.id}>
              <a
                href={`#/plan`}
                className={st.done ? 'done' : ''}
                onClick={(e) => { e.preventDefault(); jumpTo(st.id); }}
              >
                <span className="pl-step-dot" aria-hidden="true">{st.done ? '✓' : i + 1}</span> {st.label}
                <span className="sr-only">{st.done ? ' (answered)' : ' (not answered yet)'}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="pl-questions">
        <section className="question" id="q-months">
          <h3 tabIndex={-1} style={{ outline: 'none' }}><span className="q-num">1</span>How many months can you recall?</h3>
          <p className="hint">More months gives a truer picture of seasonal work.</p>
          <div className="row pl-months" role="radiogroup" aria-label="Number of months">
            {[3, 6, 12].map((n) => (
              <button
                type="button"
                key={n}
                role="radio"
                aria-checked={months.length === n}
                className={`btn btn-small ${months.length === n ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMonthCount(n)}
              >
                {n} months
              </button>
            ))}
            <span className="hint">{monthLabel(months[0], { year: true })} to {monthLabel(months.at(-1), { year: true })}</span>
          </div>
        </section>

        <section className="question" id="q-income">
          <h3 tabIndex={-1} style={{ outline: 'none' }}><span className="q-num">2</span>What did each source pay?</h3>
          {error && <p id="income-error" className="field-error" role="alert">{error}</p>}
          <p className="hint">One card per job or gig. Use what landed after tax; 0 if nothing came in.</p>
          {draft.sources.map((s, idx) => (
            <div className="source-card" key={s.id}>
              <div className="source-top">
                <div className="field">
                  <label htmlFor={`sn-${s.id}`}>Source {idx + 1}</label>
                  <input id={`sn-${s.id}`} className="input" value={s.name} placeholder="e.g. Warehouse shifts" onChange={(e) => updateSource(s.id, { name: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor={`sk-${s.id}`}>Type of work</label>
                  <select id={`sk-${s.id}`} className="select" value={s.kind} onChange={(e) => updateSource(s.id, { kind: e.target.value })}>
                    {SOURCE_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                  </select>
                </div>
                {draft.sources.length > 1 && (
                  <button type="button" className="icon-btn" aria-label={`Remove ${s.name || `source ${idx + 1}`}`} title="Remove source" onClick={() => update({ sources: draft.sources.filter((x) => x.id !== s.id) })}>
                    <IconTrash />
                  </button>
                )}
              </div>
              <div className="month-grid">
                {months.map((m, i) => (
                  <div className="field" key={m}>
                    <label htmlFor={`a-${s.id}-${i}`}>{monthLabel(m)}{i === 0 || m.endsWith('-01') ? ` ’${m.slice(2, 4)}` : ''}</label>
                    <MoneyInput
                      id={`a-${s.id}-${i}`}
                      aria-invalid={error && idx === 0 && i === 0 ? true : undefined}
                      aria-describedby={error && idx === 0 && i === 0 ? 'income-error' : undefined}
                      value={s.amounts[i]}
                      placeholder="0"
                      onChange={(v) => updateSource(s.id, { amounts: s.amounts.map((a, j) => (j === i ? v : a)) })}
                    />
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-ghost btn-small" style={{ marginTop: 10, marginLeft: -14 }} onClick={() => fillSame(s)}>
                Same every month? Copy the first amount
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-small" style={{ marginTop: 12 }} onClick={addSource}>
            <IconPlus /> Add another source
          </button>
        </section>

        <section className="question" id="q-costs">
          <h3 tabIndex={-1} style={{ outline: 'none' }}><span className="q-num">3</span>What are your fixed bills?</h3>
          <p className="hint">Food and day-to-day spending come out of your weekly spend. Priority decides what we protect first.</p>
          {draft.costs.map((c) => (
            <div className="cost-row" key={c.id}>
              <div className="field">
                <label htmlFor={`cn-${c.id}`}>Bill</label>
                <input id={`cn-${c.id}`} className="input" value={c.name} placeholder="e.g. Rent" onChange={(e) => updateCost(c.id, { name: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor={`ca-${c.id}`}>Per month</label>
                <MoneyInput id={`ca-${c.id}`} value={c.amount} placeholder="0" onChange={(v) => updateCost(c.id, { amount: v })} />
              </div>
              <div className="field">
                <label htmlFor={`cd-${c.id}`}>Due day</label>
                <input id={`cd-${c.id}`} className="input" type="number" inputMode="numeric" min="1" max="31" value={c.dueDay} onChange={(e) => updateCost(c.id, { dueDay: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor={`cp-${c.id}`}>Priority</label>
                <select id={`cp-${c.id}`} className="select" value={c.priority} onChange={(e) => updateCost(c.id, { priority: e.target.value })}>
                  {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <button type="button" className="icon-btn" aria-label={`Remove ${c.name || 'bill'}`} title="Remove bill" onClick={() => update({ costs: draft.costs.filter((x) => x.id !== c.id) })}>
                <IconTrash />
              </button>
            </div>
          ))}
          <div className="chips" aria-label="Quick add a common bill">
            <button type="button" className="chip" onClick={() => addCost()}>+ Other bill</button>
            {unusedPresets.slice(0, 8).map((p) => (
              <button type="button" className="chip" key={p.name} onClick={() => addCost(p)}>+ {p.name}</button>
            ))}
          </div>
        </section>

        <section className="question" id="q-savings">
          <h3 tabIndex={-1} style={{ outline: 'none' }}><span className="q-num">4</span>Any emergency savings?</h3>
          <p className="hint">Money you could reach in a few days. 0 is a very common start.</p>
          <div style={{ maxWidth: 240 }}>
            <MoneyInput id="savings" label="Savings" value={draft.savings} placeholder="0" onChange={(v) => update({ savings: v })} />
          </div>
        </section>
      </div>

      {error && (
        <div className="callout warn" style={{ marginBottom: 16 }}>
          <IconInfo />
          <span>{error}</span>
        </div>
      )}

      <div className="form-actions">
        <span className="hint pl-private" style={{ alignSelf: 'center' }}>Stays on this device.</span>
        <button type="submit" className="btn btn-primary">
          See my plan <IconArrow />
        </button>
      </div>
    </form>
  );
}
