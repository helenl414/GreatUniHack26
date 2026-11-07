import { useProfile } from '../lib/store';
import { sampleProfile } from '../lib/sample';

export function NeedsPlan({ what }) {
  const { setProfile } = useProfile();
  return (
    <div className="panel empty needs-plan fade-in">
      <span className="needs-plan-mark" aria-hidden="true" />
      <h2>Start with your income</h2>
      <p>
        To {what}, we need your recent income and bills first. About three minutes, once.
      </p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <a className="btn btn-primary" href="#/plan">Go to the planner</a>
        <button className="btn btn-secondary" onClick={() => setProfile(sampleProfile())}>Use sample data</button>
      </div>
    </div>
  );
}
