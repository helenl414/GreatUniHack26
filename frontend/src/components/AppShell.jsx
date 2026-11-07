import { IconPlan, IconReport, IconSim, SteadyMark } from './Icons';

const TABS = [
  { id: 'plan', label: 'Planner', long: 'Smoothing planner', Icon: IconPlan },
  { id: 'simulate', label: 'Simulator', long: 'What-if simulator', Icon: IconSim },
  { id: 'report', label: 'Prove income', long: 'Prove my income', Icon: IconReport },
];

export function TopBar({ route }) {
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <a className="brand" href="#/" aria-label="Steady home">
          <SteadyMark />
          Steady
        </a>
        {route !== 'home' && (
          <nav className="tabs" aria-label="Tools">
            {TABS.map((t, i) => (
              <a key={t.id} className="tab" href={`#/${t.id}`} aria-current={route === t.id ? 'page' : undefined}>
                <span className="tab-num" aria-hidden="true">{i + 1}</span>
                {t.long}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

export function BottomNav({ route }) {
  if (route === 'home') return null;
  return (
    <nav className="bottom-nav" aria-label="Tools">
      {TABS.map(({ id, label, Icon }) => (
        <a key={id} href={`#/${id}`} aria-current={route === id ? 'page' : undefined}>
          <Icon width={22} height={22} />
          {label}
        </a>
      ))}
    </nav>
  );
}

export function FooterNote() {
  return (
    <footer className="footer-note no-print">
      <div className="wrap">
        Steady is education and planning support, not regulated financial advice. Figures are
        calculated from what you enter and stay on this device. For free, impartial money guidance,
        visit MoneyHelper.
      </div>
    </footer>
  );
}

export function PageHead({ step, title, children }) {
  return (
    <div className="page-head">
      {step && <div className="eyebrow">{step}</div>}
      <h1 style={{ marginTop: step ? 6 : 0 }}>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}
