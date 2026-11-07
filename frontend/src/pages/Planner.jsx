import { useState } from 'react';
import { useProfile } from '../lib/store';
import { emptyProfile, normaliseProfile, sampleProfile } from '../lib/sample';
import { PageHead } from '../components/AppShell';
import { IconForm, IconMic } from '../components/Icons';
import { DescribeInput } from './planner/DescribeInput';
import { QuestionForm } from './planner/QuestionForm';
import { PlanResults } from './planner/PlanResults';
import { SampleBanner } from '../components/SampleBanner';

export default function Planner() {
  const { profile, setProfile, plan } = useProfile();
  const [rawMode, setMode] = useState(profile ? 'results' : 'choose');
  // If the saved profile is cleared (e.g. leaving sample data), fall back to the start.
  const mode = !profile && rawMode === 'results' ? 'choose' : rawMode;
  const [draft, setDraft] = useState(() => profile ?? emptyProfile());
  const [notice, setNotice] = useState(null);

  const startForm = () => {
    setNotice(null);
    setDraft(profile && !profile.isSample ? profile : emptyProfile());
    setMode('form');
  };

  const onParsed = (parsed, { notes, source }) => {
    setDraft(parsed);
    setNotice(
      <>
        <strong>{source === 'ai' ? 'Here’s what we understood.' : 'Here’s our best reading of what you said.'}</strong>{' '}
        Check each figure and fix anything we got wrong, then see your plan.
        {notes.length > 0 && <> We couldn&rsquo;t place: &ldquo;{notes.join('”, “')}&rdquo;.</>}
      </>,
    );
    setMode('form');
  };

  const save = () => {
    setProfile({ ...normaliseProfile(draft), isSample: false });
    setMode('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const useSample = () => {
    const s = sampleProfile();
    setProfile(s);
    setDraft(s);
    setMode('results');
  };

  return (
    <div className="wrap">
      <PageHead step="Tool 1 of 3" title="Income Smoothing Planner">
        Find a safe weekly spend based on your low months, not your average, and a buffer that carries you through the gaps.
      </PageHead>

      {mode === 'results' && profile?.isSample && <SampleBanner />}

      {mode === 'choose' && (
        <div className="fade-in">
          <div className="choice-grid">
            <button className="choice" onClick={() => setMode('describe')}>
              <span className="choice-icon"><IconMic /></span>
              <h3>Tell us in your own words</h3>
              <p>Speak or type a description of your jobs, pay and bills. We&rsquo;ll pull out the figures for you to check.</p>
              <span className="go">Speak or type →</span>
            </button>
            <button className="choice" onClick={startForm}>
              <span className="choice-icon"><IconForm /></span>
              <h3>Answer a few questions</h3>
              <p>Four short questions about your income, bills and savings. Best if you have your bank app to hand.</p>
              <span className="go">Start the questions →</span>
            </button>
          </div>
          <p className="muted small" style={{ marginTop: 16 }}>
            Just looking? <button className="btn btn-ghost btn-small" onClick={useSample}>Use sample data</button>
          </p>
        </div>
      )}

      {mode === 'describe' && <DescribeInput onParsed={onParsed} onBack={() => setMode('choose')} />}

      {mode === 'form' && (
        <QuestionForm draft={draft} setDraft={setDraft} onSubmit={save} onBack={() => setMode('choose')} notice={notice} />
      )}

      {mode === 'results' && plan && (
        <PlanResults
          plan={plan}
          profile={profile}
          onEdit={() => {
            setNotice(null);
            setDraft(profile);
            setMode('form');
          }}
        />
      )}
    </div>
  );
}
