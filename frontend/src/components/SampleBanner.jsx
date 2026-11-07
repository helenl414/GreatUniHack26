import { useProfile } from '../lib/store';
import { go } from '../lib/useHashRoute';

export function SampleBanner() {
  const { clear } = useProfile();
  return (
    <div className="sample-banner no-print" role="status">
      <span>
        <span className="sample-dot" aria-hidden="true" /><strong>Sample data.</strong> A made-up example, not a real person.
      </span>
      <button
        className="btn btn-secondary btn-small"
        onClick={() => {
          clear();
          go('plan');
        }}
      >
        Use my own figures
      </button>
    </div>
  );
}
