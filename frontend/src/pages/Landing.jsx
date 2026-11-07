import { useProfile } from '../lib/store';
import { sampleProfile } from '../lib/sample';
import { go } from '../lib/useHashRoute';
import { IconArrow, IconShield } from '../components/Icons';

// Signature moment: jagged monthly income, and the one steady line Steady draws through it.
function HeroArt() {
  const bars = [62, 118, 150, 158, 96, 54, 78, 132];
  const base = 230;
  return (
    <svg className="hero-art" viewBox="0 0 540 260" role="img" aria-label="Illustration: uneven monthly income bars with a calm, steady line running through them">
      <style>{`
        .ha-bar { transform-origin: bottom; transform-box: fill-box; animation: ha-grow 600ms cubic-bezier(.2,.7,.2,1) both; }
        .ha-line { stroke-dasharray: 520; stroke-dashoffset: 520; animation: ha-draw 1100ms 650ms cubic-bezier(.2,.7,.2,1) forwards; }
        .ha-label { opacity: 0; animation: ha-fade 400ms 1500ms ease forwards; }
        @keyframes ha-grow { from { transform: scaleY(0); } }
        @keyframes ha-draw { to { stroke-dashoffset: 0; } }
        @keyframes ha-fade { to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .ha-line { stroke-dashoffset: 0; } .ha-label { opacity: 1; } }
      `}</style>
      <line x1="10" x2="424" y1={base} y2={base} stroke="#fff" strokeOpacity="0.25" />
      {bars.map((h, i) => (
        <rect
          key={i}
          className="ha-bar"
          style={{ animationDelay: `${i * 50}ms` }}
          x={18 + i * 51}
          y={base - h}
          width="34"
          height={h}
          rx="5"
          fill={h < 70 ? '#F2C48F' : '#8A5CB8'}
          fillOpacity={h < 70 ? 0.9 : 0.75}
        />
      ))}
      <line x1="10" x2="424" y1={base - 107} y2={base - 107} stroke="#fff" strokeOpacity="0.5" strokeDasharray="4 6" />
      <path className="ha-line" d="M12 162 C 110 156, 200 168, 300 160 S 400 158, 424 160" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
      <g className="ha-label" fontFamily="inherit" fontSize="17">
        <text x="440" y={base - 111} fill="#fff" fillOpacity="0.75" fontWeight="600">Average</text>
        <text x="440" y={base - 90} fill="#fff" fillOpacity="0.6">looks safe</text>
        <text x="440" y="157" fill="#fff" fontWeight="700">Steady pay</text>
        <text x="440" y="179" fill="#fff" fillOpacity="0.85">actually safe</text>
      </g>
    </svg>
  );
}

const FEATURES = [
  {
    n: '01',
    title: 'Income Smoothing Planner',
    body: 'Tell us what came in from each job and what you have to pay. We find a safe weekly spend from a cautious baseline, not the average, and a buffer target to see you through quiet months.',
    route: 'plan',
    cta: 'Plan my money',
  },
  {
    n: '02',
    title: 'What-if Simulator',
    body: 'What if a job ends? Pick which income stops, when, and for how long. See week by week when money would run out, which bills get hit first, and how much a buffer changes things.',
    route: 'simulate',
    cta: 'Test a scenario',
  },
  {
    n: '03',
    title: 'Prove My Income',
    body: 'Turn your income history into a clear, one-page summary for a landlord or lender: income by source, average and lowest months, and how consistently you have earned.',
    route: 'report',
    cta: 'Build my summary',
  },
];

const VALUES = [
  { name: 'Inclusive', body: 'Built for people whose pay is irregular, not treated as an edge case. Plain words, works on any phone.' },
  { name: 'Robust', body: 'Cautious maths from code you can check. The AI explains figures; it never invents them.' },
  { name: 'Curious', body: 'Ask "what if?" safely, before it happens, and see the result straight away.' },
  { name: 'Sustainable', body: 'Small, steady habits, like building a buffer in strong months, that last.' },
  { name: 'Ambitious', body: 'Show landlords and lenders the reliability you have earned.' },
];

export default function Landing() {
  const { profile, setProfile } = useProfile();

  const trySample = () => {
    setProfile(sampleProfile());
    go('plan');
  };

  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <div>
            <div className="eyebrow">For income that doesn't arrive neatly</div>
            <h1>Plan on your steady pay, not your best month.</h1>
            <p className="lede">
              Steady helps seasonal, part-time and short-term workers, and anyone who changes jobs
              often, plan ahead, test how resilient they are, and show the reliability they have earned.
            </p>
            <div className="row">
              <a className="btn btn-on-dark" href="#disclaimer">
                Get started <IconArrow />
              </a>
              <button className="btn btn-outline-on-dark" onClick={trySample}>
                Try with sample data
              </button>
            </div>
            <div className="audience" aria-label="Who Steady is for">
              <span>Seasonal work</span>
              <span>Part-time</span>
              <span>Temporary &amp; agency</span>
              <span>Gig work</span>
              <span>Between jobs</span>
            </div>
          </div>
          <HeroArt />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Three tools, one picture</div>
            <h2 style={{ marginTop: 8 }}>Why the average lets you down</h2>
            <p>
              When pay jumps around, the average is pulled up by your best months, so spending to it
              leaves you short in the quiet ones. Steady plans around a cautious baseline instead, then
              helps you prepare and prove it.
            </p>
          </div>
          <div className="features">
            {FEATURES.map((f) => (
              <article className="feature" key={f.n}>
                <span className="f-num">{f.n}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
                <a href={`#/${f.route}`}>{f.cta} →</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap how">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <div className="eyebrow">How it works</div>
            <h2 style={{ marginTop: 8 }}>Say it or fill it in. We do the maths.</h2>
            <p>
              Describe your situation by voice or in your own words, or answer a few short questions.
              Every number is worked out by transparent rules. Then an AI layer explains them in plain
              English with three practical next steps.
            </p>
          </div>
          <ol className="how-steps">
            <li><div><h3>Tell us about your income</h3><p>Each job or source, month by month, plus your fixed bills and any savings.</p></div></li>
            <li><div><h3>Get your steady pay</h3><p>A safe weekly spend, a buffer target, and when to save or draw on it.</p></div></li>
            <li><div><h3>Stress-test it</h3><p>See what happens if a job stops, with and without your buffer.</p></div></li>
            <li><div><h3>Share your reliability</h3><p>Download or print a one-page, self-reported income summary.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">What guides us</div>
            <h2 style={{ marginTop: 8 }}>Our principles</h2>
          </div>
          <div className="values">
            {VALUES.map((v) => (
              <div className="value" key={v.name}>
                <h3>{v.name}</h3>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="disclaimer">
        <div className="wrap">
          <div className="disclaimer">
            <div className="row" style={{ marginTop: 0, gap: 10 }}>
              <IconShield style={{ color: 'var(--action)' }} />
              <h2>Before you start</h2>
            </div>
            <ul>
              <li>Steady is for <strong>education and planning support</strong>. It is <strong>not regulated financial advice</strong> and doesn't recommend financial products.</li>
              <li>Results are only as accurate as the figures you enter. They are estimates, not guarantees.</li>
              <li>The &ldquo;Prove My Income&rdquo; summary is <strong>self-reported</strong>. It isn't verified by Steady or any bank, and landlords or lenders may ask for evidence such as bank statements.</li>
              <li>What you enter stays on this device. Explanations only receive the calculated figures.</li>
              <li>If you're worried about money, free and impartial help is available from MoneyHelper, Citizens Advice or StepChange.</li>
            </ul>
            <div className="row">
              <button className="btn btn-primary" onClick={() => go('plan')}>
                {profile ? 'I understand, continue' : 'I understand, start planning'} <IconArrow />
              </button>
              {!profile && (
                <button className="btn btn-secondary" onClick={trySample}>Explore with sample data</button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
