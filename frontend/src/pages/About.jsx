import { IconArrow, IconPlan, IconReport, IconShield, SothisMark } from '../components/Icons';

const IconLock = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);
const IconHeart = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
  </svg>
);

const LIMITS = [
  {
    Icon: IconShield,
    title: 'Planning support, not advice',
    body: 'Sothis helps you understand and plan your money. It isn’t regulated financial advice and never recommends a financial product.',
  },
  {
    Icon: IconPlan,
    title: 'Estimates, not promises',
    body: 'Every figure comes from what you enter and a few cautious assumptions. Your real income and costs may differ.',
  },
  {
    Icon: IconReport,
    title: 'Self-reported summaries',
    body: 'Prove My Income isn’t independently verified. A landlord, lender or employer may still ask for bank statements.',
  },
  {
    Icon: IconLock,
    title: 'Your data stays with you',
    body: 'Entries are kept on this device only. No account, no bank connection. Explanations only see the figures, never your name.',
  },
];

export default function About() {
  return (
    <div className="about">
      <section className="wrap about-hero">
        <div className="eyebrow">About Sothis</div>
        <h1 tabIndex={-1} data-page-title>
          Money tools for pay that doesn’t arrive in a straight line.
        </h1>
        <p className="about-lede">
          Sothis is for seasonal, part-time and short-term workers, and anyone who changes jobs
          often. It turns uneven earnings into a clear plan, a safe weekly spend and an income
          summary you can share, so you can manage money with confidence and build a buffer that
          lasts.
        </p>
        <p className="about-name">
          <SothisMark size={16} /> Named after Sothis, the ancient name for Sirius: the brightest,
          most dependable star in the night sky.
        </p>
      </section>

      <section className="wrap" aria-labelledby="limits-h">
        <div className="about-limits">
          <div className="about-limits-head">
            <div className="eyebrow">Using Sothis safely</div>
            <h2 id="limits-h">A clear picture includes the limits.</h2>
          </div>
          <ul className="limit-grid">
            {LIMITS.map(({ Icon, title, body }) => (
              <li key={title}>
                <span className="limit-icon"><Icon /></span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap about-foot">
        <div className="about-commit">
          <span className="limit-icon"><IconHeart /></span>
          <div>
            <h2>Still growing</h2>
            <p>
              We’re working to make Sothis more reliable over time. If you’re worried about money,
              free impartial help is available from MoneyHelper, Citizens Advice and StepChange.
            </p>
          </div>
        </div>
        <a className="btn btn-primary" href="#/plan">
          Start planning <IconArrow />
        </a>
      </section>
    </div>
  );
}
