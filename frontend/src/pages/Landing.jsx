import { useProfile } from '../lib/store';
import { sampleProfile } from '../lib/sample';
import { go } from '../lib/useHashRoute';
import { gbp } from '../lib/format';
import { IconArrow, IconShield } from '../components/Icons';
import { GLOSSARY, Term } from '../components/Term';

/** Top-of-page card: the user's weekly spending limit once they've entered details, otherwise a way in. */
function JourneyCard() {
  const { profile, plan, setProfile } = useProfile();

  if (profile && plan) {
    return (
      <aside className="journey-card" aria-labelledby="journey-title">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 id="journey-title" className="journey-label">
            <Term def={GLOSSARY.safeWeekly}>Expected weekly spending limit</Term>
          </h2>
          {profile.isSample && <span className="tag draw">Sample data</span>}
        </div>
        <p className="journey-value num">
          {gbp(plan.safeWeekly)}
          <small>/week</small>
        </p>
        <p className="journey-note">
          {plan.status === 'deficit'
            ? `Your fixed bills are ${gbp(-plan.spareMonthly)} a month more than a low month brings in. Your plan shows where to start.`
            : `Based on steady pay of ${gbp(plan.steadyPay)} a month, after ${gbp(plan.fixedCosts)} of fixed bills.`}
        </p>
        <div className="row" style={{ marginTop: 20 }}>
          <button className="btn btn-primary" onClick={() => go('plan')}>
            View my plan <IconArrow />
          </button>
          <a className="btn btn-ghost" href="#/simulate">Test a what-if</a>
        </div>
      </aside>
    );
  }

  return (
    <aside className="journey-card" aria-labelledby="journey-title">
      <h2 id="journey-title" className="journey-start">Start your journey</h2>
      <p className="journey-note">
        Tell us what you&rsquo;ve earned recently and what you have to pay. We&rsquo;ll show what you can safely spend each
        week. It takes about three minutes, and your details stay on this device.
      </p>
      <div className="row" style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={() => go('plan')}>
          Start journey <IconArrow />
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            setProfile(sampleProfile());
            go('plan');
          }}
        >
          Try with sample data
        </button>
      </div>
    </aside>
  );
}

const SAFETY = [
  {
    title: 'What Sothis is, and isn’t',
    body: 'Sothis is designed to support your financial education and planning. It does not provide regulated financial advice, and nothing in the app should be taken as a recommendation to buy, sell, or take out any financial product.',
  },
  {
    title: 'About estimates',
    body: 'Projections and estimates are based on the information and assumptions you enter. Your actual future income and costs may differ.',
  },
  {
    title: 'About “Prove my income” statements',
    body: 'These statements are self-reported. They are not independently verified, and we can’t guarantee that a landlord, lender, or employer will accept them.',
  },
  {
    title: 'Our commitment',
    body: 'Sothis is still growing, and we’re working to become more reliable and trustworthy over time. Your feedback helps us get there, so please tell us what’s working and what isn’t.',
  },
];

export default function Landing() {
  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner hero-stack">
          <JourneyCard />
          <div>
            <h1 tabIndex={-1} data-page-title style={{ outline: 'none' }}>What is Sothis?</h1>
            <p className="lede">
              Sothis is a finance app built for people whose income doesn&rsquo;t arrive in a straight line: seasonal
              workers, part-time and short-term staff, and anyone who changes jobs often. It turns irregular earnings
              into a clear picture, with income visualisation, practical budgeting guidance, and &ldquo;Prove my
              income&rdquo; statements you can share with landlords, lenders and employers. Our aim is to help people
              with fluctuating pay manage their money with confidence and build lasting financial resilience.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="safety">
        <div className="wrap">
          <div className="section-head">
            <div className="row" style={{ gap: 10 }}>
              <IconShield style={{ color: 'var(--action)' }} />
              <h2>How to safely utilise Sothis?</h2>
            </div>
          </div>
          <div className="safety-grid">
            {SAFETY.map((s) => (
              <article className="safety-item" key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
