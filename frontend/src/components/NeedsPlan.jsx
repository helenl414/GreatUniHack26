import { useProfile } from '../lib/store';
import { sampleProfile } from '../lib/sample';

export function NeedsPlan({ what }) {
  const { setProfile } = useProfile();
  return (
    <div className="panel empty fade-in">
      <h2>Start with your income</h2>
      <p>
        To {what}, we first need your recent income and bills. It takes about three minutes in the
        planner, and you only need to do it once.
      </p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <a className="btn btn-primary" href="#/plan">Go to the planner</a>
        <button className="btn btn-secondary" onClick={() => setProfile(sampleProfile())}>Use sample data</button>
      </div>
    </div>
  );
}
