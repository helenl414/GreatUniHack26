import { IconPlan, IconReport, IconSim, SothisMark } from './Icons';
import { DisplaySettings } from './DisplaySettings';

const TABS = [
  { id: 'plan', label: 'Plan', long: 'Planner', Icon: IconPlan },
  { id: 'simulate', label: 'What if', long: 'What-if', Icon: IconSim },
  { id: 'report', label: 'Prove', long: 'Prove income', Icon: IconReport },
];

export function TopBar({ route }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="#/" aria-label="Sothis home">
          <SothisMark size={26} />
          Sothis
        </a>
        <nav className="tabs" aria-label="Tools">
          {TABS.map((t) => (
            <a key={t.id} className="tab" href={`#/${t.id}`} aria-current={route === t.id ? 'page' : undefined}>
              {t.long}
            </a>
          ))}
        </nav>
        <div className="topbar-actions">
          <DisplaySettings />
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ route }) {
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
        <span className="footer-brand">
          <SothisMark size={18} /> Sothis
        </span>
        <nav className="footer-links" aria-label="Footer">
          <a href="#/about">About &amp; safety</a>
          <a href="#/plan">Planner</a>
          <a href="#/simulate">What-if</a>
          <a href="#/report">Prove income</a>
        </nav>
        <p>
          Planning support, not regulated financial advice. Figures come from what you enter and
          stay on this device. Free, impartial guidance: MoneyHelper, Citizens Advice, StepChange.
        </p>
      </div>
    </footer>
  );
}

export function PageHead({ step, title, children }) {
  return (
    <div className="page-head">
      {step && <div className="eyebrow">{step}</div>}
      {/* tabIndex lets App move focus here after navigation, so screen readers announce the new page. */}
      <h1 tabIndex={-1} data-page-title style={{ marginTop: step ? 12 : 0, outline: 'none' }}>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}
