import { useState } from 'react';
import { useProfile } from '../lib/store';
import { emptyProfile, normaliseProfile, sampleProfile } from '../lib/sample';
import { PageHead } from '../components/AppShell';
import { IconArrow, IconForm, IconMic } from '../components/Icons';
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
    <div className="wrap planner">
      <PageHead step="Planner" title={mode === 'results' ? 'Your plan' : 'Plan on your low months.'}>
        {mode === 'results'
          ? 'Built from your quieter months, so it holds up when work dries up.'
          : 'A safe weekly spend and a buffer that carries you through the gaps.'}
      </PageHead>

      {mode === 'results' && profile?.isSample && <SampleBanner />}

      {mode === 'choose' && (
        <div className="fade-in">
          <div className="choice-grid pl-choices">
            <button className="choice pl-choice pl-choice--voice" onClick={() => setMode('describe')}>
              <span className="choice-icon"><IconMic /></span>
              <span className="pl-choice-tag">About 1 minute</span>
              <h3>Just tell us</h3>
              <p>Speak or type about your jobs, pay and bills. We pull out the figures for you to check.</p>
              <span className="go">Speak or type <IconArrow /></span>
            </button>
            <button className="choice pl-choice" onClick={startForm}>
              <span className="choice-icon"><IconForm /></span>
              <span className="pl-choice-tag">4 short questions</span>
              <h3>Fill it in</h3>
              <p>Income, bills and savings, month by month. Handy with your bank app open.</p>
              <span className="go">Start the questions <IconArrow /></span>
            </button>
          </div>
          <div className="pl-sample">
            <span className="muted small">Just looking around?</span>
            <button className="btn btn-ghost btn-small" onClick={useSample}>Try sample data</button>
          </div>
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
