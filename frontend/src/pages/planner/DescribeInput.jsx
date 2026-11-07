import { useState } from 'react';
import { parseDescription } from '../../lib/api';
import { recentMonths, uid } from '../../lib/format';
import { useSpeech } from '../../lib/useSpeech';
import { IconBack, IconInfo, IconMic, IconSpark } from '../../components/Icons';

const EXAMPLE =
  "I work at a café in summer earning about £1,200 a month. I also do deliveries for around £90 a week, all year. I tutor in term time for about £300 a month. My rent is £650, council tax £110, energy £85 and my phone is £18. I've got £400 saved.";

export function DescribeInput({ onParsed, onBack }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const speech = useSpeech((chunk) => setText((t) => (t ? `${t.trimEnd()} ${chunk}` : chunk)));

  const analyse = async () => {
    if (text.trim().length < 10) {
      setError('Tell us a little more, such as what you earn from each job and your main bills.');
      return;
    }
    setError(null);
    setBusy(true);
    const months = recentMonths(6);
    try {
      const { result, source } = await parseDescription(text, months);
      if (!result.sources?.length) {
        setError("We couldn't find any income in that. Try mentioning amounts with £, like \"about £800 a month from the shop\".");
        return;
      }
      onParsed(
        {
          isSample: false,
          name: '',
          months,
          sources: result.sources.map((s) => ({ id: uid(), kind: 'other', ...s })),
          costs: (result.costs || []).map((c) => ({ id: uid(), dueDay: 1, priority: 'important', ...c })),
          savings: result.savings ?? '',
        },
        { notes: result.notes || [], source },
      );
    } catch {
      setError('Something went wrong analysing that. Your text is still here, so you can try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel pl-describe fade-in">
      <button className="btn btn-ghost btn-small pl-back" onClick={onBack}>
        <IconBack /> Back
      </button>
      <h2>Tell us in your own words</h2>
      <p className="muted pl-sub">
        Where your money comes from, roughly how much, and what you pay each month. You&rsquo;ll check every figure before anything is worked out.
      </p>

      <div className="field pl-describe-field">
        <label htmlFor="describe" className="sr-only">Your situation</label>
        <textarea
          id="describe"
          className="textarea pl-textarea"
          value={speech.interim ? `${text} ${speech.interim}` : text}
          onChange={(e) => setText(e.target.value)}
          placeholder={EXAMPLE}
          readOnly={speech.listening}
          aria-describedby="describe-hint"
        />
        <span id="describe-hint" className="hint">
          Tip: use £, say per week or per month, and mention seasons (&ldquo;in summer&rdquo;).
        </span>
      </div>

      <div className="row pl-describe-actions">
        <div className={`mic ${speech.listening ? 'listening' : ''}`}>
          {speech.supported ? (
            <>
              <button
                className="btn btn-secondary"
                onClick={speech.listening ? speech.stop : speech.start}
                aria-pressed={speech.listening}
              >
                <IconMic width={18} height={18} /> {speech.listening ? 'Stop recording' : 'Speak instead'}
              </button>
              {speech.listening && (
                <span className="small muted row" style={{ gap: 8 }}>
                  <span className="pulse" aria-hidden="true" /> Listening…
                </span>
              )}
            </>
          ) : (
            <span className="hint">Voice input isn&rsquo;t available in this browser. Your keyboard&rsquo;s dictation button works too.</span>
          )}
        </div>
        <div className="row">
          {!text && (
            <button className="btn btn-ghost btn-small" onClick={() => setText(EXAMPLE)}>Use example</button>
          )}
          <button className="btn btn-primary" onClick={analyse} disabled={busy || speech.listening}>
            <IconSpark width={18} height={18} /> {busy ? 'Analysing…' : 'Analyse'}
          </button>
        </div>
      </div>

      {(error || speech.error) && (
        <div className="callout warn" role="alert" style={{ marginTop: 16 }}>
          <IconInfo />
          <span>{error || speech.error}</span>
        </div>
      )}
    </div>
  );
}
