import { useState } from 'react';
import { parseDescription } from '../../lib/api';
import { recentMonths, uid } from '../../lib/format';
import { useSpeech } from '../../lib/voice';
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
      <h2>Just tell us</h2>
      <p className="muted pl-sub">
        Your jobs, roughly what each pays, and your bills. You&rsquo;ll check every figure before anything is worked out.
      </p>

      {speech.supported && (
        <div className={`voice-hero${speech.listening ? ' is-live' : ''}`}>
          <button
            type="button"
            className="voice-mic"
            onClick={speech.listening ? speech.stop : speech.start}
            disabled={speech.transcribing || busy}
            aria-pressed={speech.listening}
            aria-label={speech.listening ? 'Stop recording' : 'Start speaking'}
            style={{ '--lvl': speech.level }}
          >
            <IconMic width={30} height={30} />
          </button>
          <div className="voice-hero-copy" aria-live="polite">
            <strong>
              {speech.transcribing
                ? 'Writing down what you said…'
                : speech.listening
                  ? 'Listening… tap to finish'
                  : text
                    ? 'Tap to add more'
                    : 'Tap and talk'}
            </strong>
            <span>
              {speech.listening
                ? 'e.g. “Café shifts in summer, about £1,200 a month. Rent is £650.”'
                : 'Speak naturally, in any accent. Transcribed by ElevenLabs.'}
            </span>
          </div>
        </div>
      )}

      <div className="field pl-describe-field">
        <label htmlFor="describe" className="small muted">{speech.supported ? 'Or type it' : 'Your situation'}</label>
        <textarea
          id="describe"
          className="textarea pl-textarea"
          value={speech.interim ? `${text} ${speech.interim}` : text}
          onChange={(e) => setText(e.target.value)}
          placeholder={EXAMPLE}
          readOnly={speech.listening || speech.transcribing}
          aria-describedby="describe-hint"
        />
        <span id="describe-hint" className="hint">
          Tip: mention £ amounts, per week or per month, and seasons (&ldquo;in summer&rdquo;).
        </span>
      </div>

      <div className="row pl-describe-actions">
        <span />
        <div className="row">
          {!text && (
            <button className="btn btn-ghost btn-small" onClick={() => setText(EXAMPLE)}>Use example</button>
          )}
          <button className="btn btn-primary" onClick={analyse} disabled={busy || speech.listening || speech.transcribing}>
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
