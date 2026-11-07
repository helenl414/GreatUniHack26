import { useProfile } from '../lib/store';
import { sampleProfile } from '../lib/sample';
import { go } from '../lib/useHashRoute';
import { IconArrow, IconPlan, IconReport, IconShield, IconSim, SothisMark } from '../components/Icons';

// Signature moment: lumpy monthly income, and the one calm line Sothis draws through it.
function HeroCard() {
  const bars = [52, 96, 124, 132, 78, 40, 62, 110];
  const base = 150;
  return (
    <div className="hero-card" aria-hidden="true">
      <div className="hero-card-top">
        <span className="hc-label">Safe to spend this week</span>
        <span className="hc-tag">Example</span>
      </div>
      <div className="hc-value">£212</div>
      <svg className="hc-chart" viewBox="0 0 400 160" preserveAspectRatio="none">
        {bars.map((h, i) => (
          <rect
            key={i}
            className="hc-bar"
            x={8 + i * 49}
            y={base - h}
            width="34"
            height={h}
            rx="8"
            style={{ animationDelay: `${120 + i * 55}ms` }}
            data-low={h < 60 || undefined}
          />
        ))}
        <path className="hc-line" d="M6 96 C 90 90, 170 102, 250 94 S 360 92, 394 94" />
      </svg>
      <div className="hc-foot">
        <div>
          <span>Lowest month</span>
          <strong>£640</strong>
        </div>
        <div>
          <span>Buffer</span>
          <strong>2.4 of 3 mo</strong>
        </div>
      </div>
    </div>
  );
}

const TOOLS = [
  {
    route: 'plan',
    tone: 'lilac',
    Icon: IconPlan,
    kicker: 'Plan',
    title: 'Find your safe weekly spend',
    body: 'Built from your quiet months, not your best ones. Plus a buffer target that fits.',
    cta: 'Start planning',
  },
  {
    route: 'simulate',
    tone: 'sand',
    Icon: IconSim,
    kicker: 'What if',
    title: 'Stress-test a lost job',
    body: 'Pick what stops and when. See the week money runs out, with and without a buffer.',
    cta: 'Run a scenario',
  },
  {
    route: 'report',
    tone: 'sage',
    Icon: IconReport,
    kicker: 'Prove',
    title: 'Show you’re reliable',
    body: 'A clean one-page income summary for a landlord or lender. Print or save as PDF.',
    cta: 'Build my summary',
  },
];

const STEPS = [
  ['Tell us', 'Say it out loud, type it, or answer a few questions.'],
  ['See your number', 'A cautious weekly spend and a buffer goal.'],
  ['Test it', 'Find out what happens if a job stops.'],
  ['Share it', 'Download a self-reported income summary.'],
];

const VALUES = ['Inclusive', 'Robust', 'Curious', 'Sustainable', 'Ambitious'];

export default function Landing() {
  const { profile, setProfile } = useProfile();

  const trySample = () => {
    setProfile(sampleProfile());
    go('plan');
  };

  return (
    <div className="landing">
      <section className="wrap">
        <div className="stage">
          <div className="stage-glow" aria-hidden="true" />
          <div className="stage-copy">
            <div className="eyebrow stage-eyebrow">
              <SothisMark size={14} tone="white" /> For income that doesn’t arrive neatly
            </div>
            <h1 tabIndex={-1} data-page-title>
              Plan on your steady pay, not your best month.
            </h1>
            <p className="stage-lede">
              For seasonal, part-time and gig workers. Know what’s safe to spend, prepare for the
              quiet months, and prove your income.
            </p>
            <div className="row stage-cta">
              <a className="btn btn-on-dark" href="#start">
                Get started <IconArrow />
              </a>
              <button className="btn btn-outline-on-dark" onClick={trySample}>
                Try with sample data
              </button>
            </div>
          </div>
          <HeroCard />
        </div>
      </section>

      <section className="wrap statement">
        <h2>
          The average lies when pay is lumpy. <span>Sothis plans around your lowest months, so a
          quiet one never catches you out.</span>
        </h2>
      </section>

      <section className="wrap" aria-labelledby="tools-h">
        <div className="section-intro">
          <div className="eyebrow">Three tools</div>
          <h2 id="tools-h">One clear picture of your money.</h2>
        </div>
        <div className="tool-grid">
          {TOOLS.map(({ route, tone, Icon, kicker, title, body, cta }) => (
            <a className={`tool tool-${tone}`} href={`#/${route}`} key={route}>
              <span className="tool-icon"><Icon width={22} height={22} /></span>
              <span className="tool-kicker">{kicker}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <span className="tool-cta">
                {cta} <IconArrow width={18} height={18} />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="wrap how-band" aria-labelledby="how-h">
        <div className="section-intro">
          <div className="eyebrow">How it works</div>
          <h2 id="how-h">Say it. We do the maths.</h2>
          <p>Every figure comes from transparent rules. AI only explains them in plain English.</p>
        </div>
        <ol className="steps">
          {STEPS.map(([t, b], i) => (
            <li key={t}>
              <span className="step-n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{t}</h3>
              <p>{b}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap" id="start" aria-labelledby="start-h">
        <div className="start-card">
          <div className="start-copy">
            <IconShield width={28} height={28} />
            <h2 id="start-h">Before you start</h2>
            <ul>
              <li>Planning support, <strong>not regulated financial advice</strong>.</li>
              <li>Results are estimates, only as good as the figures you enter.</li>
              <li>Income summaries are <strong>self-reported</strong>, not verified by a bank.</li>
              <li>Your data stays on this device.</li>
            </ul>
            <div className="row">
              <button className="btn btn-primary" onClick={() => go('plan')}>
                {profile ? 'I understand, continue' : 'I understand, start'} <IconArrow />
              </button>
              {!profile && (
                <button className="btn btn-secondary" onClick={trySample}>
                  Use sample data
                </button>
              )}
            </div>
          </div>
          <ul className="values" aria-label="Our principles">
            {VALUES.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
