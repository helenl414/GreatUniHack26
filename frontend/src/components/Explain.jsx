import { useEffect, useRef, useState } from 'react';
import { explain, usingRealAI } from '../lib/api';
import { IconSpark, IconSpeaker, IconStop } from './Icons';

const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * AI explanation panel. Receives figures that lib/engine.js already calculated;
 * the AI only turns them into words. Re-runs whenever the figures change.
 */
export function Explain({ kind, figures, title = 'What this means for you' }) {
  const [state, setState] = useState({ status: 'idle' });
  const key = JSON.stringify(figures);
  const lastKey = useRef(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => canSpeak && window.speechSynthesis.cancel(), []);

  // Read the explanation aloud (helps people who find reading long text hard).
  const toggleSpeak = () => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const text = [state.summary, 'What the numbers mean.', ...state.meaning, 'Three next steps.', ...state.steps.slice(0, 3).map((s, i) => `${i + 1}. ${s}`)].join(' ');
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  };

  const run = async () => {
    lastKey.current = key;
    setState({ status: 'loading' });
    try {
      const r = await explain(kind, figures);
      if (lastKey.current === key) setState({ status: 'done', ...r });
    } catch {
      setState({ status: 'error' });
    }
  };

  // When inputs change after an explanation was shown, refresh it so words match numbers.
  useEffect(() => {
    if (state.status === 'done' && lastKey.current !== key) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <section className="panel explain" aria-live="polite">
      <div className="panel-head" style={{ marginBottom: 0 }}>
        <div>
          <span className="explain-badge">
            <IconSpark width={16} height={16} /> {usingRealAI ? 'AI explanation' : 'Plain-English explanation'}
          </span>
          <h2 style={{ fontSize: '1.25rem', marginTop: 4 }}>{title}</h2>
        </div>
        {state.status === 'idle' && (
          <button className="btn btn-primary" onClick={run}>
            <IconSpark width={18} height={18} /> Explain my results
          </button>
        )}
        {state.status === 'done' && (
          <div className="row" style={{ gap: 4 }}>
            {canSpeak && (
              <button className="btn btn-secondary btn-small" onClick={toggleSpeak} aria-pressed={speaking}>
                {speaking ? <IconStop /> : <IconSpeaker />} {speaking ? 'Stop reading' : 'Read aloud'}
              </button>
            )}
            <button className="btn btn-ghost btn-small" onClick={run}>Refresh</button>
          </div>
        )}
      </div>

      {state.status === 'idle' && (
        <p className="muted small" style={{ marginTop: 10 }}>
          Get what the numbers mean and three practical next steps, in plain language. Every figure
          is calculated by the app first. The explanation only describes them, so the numbers stay accurate.
        </p>
      )}

      {state.status === 'loading' && (
        <div className="explain-body" aria-label="Writing explanation">
          <div className="skeleton" style={{ width: '92%' }} />
          <div className="skeleton" style={{ width: '80%' }} />
          <div className="skeleton" style={{ width: '64%' }} />
        </div>
      )}

      {state.status === 'error' && (
        <div className="explain-body">
          <p>We couldn't write an explanation just now. Your figures above are unaffected.</p>
          <button className="btn btn-secondary btn-small" style={{ marginTop: 12 }} onClick={run}>Try again</button>
        </div>
      )}

      {state.status === 'done' && (
        <div className="explain-body fade-in">
          <p className="explain-summary">{state.summary}</p>
          <h4>What the numbers mean</h4>
          <ul>{state.meaning.map((m, i) => <li key={i}>{m}</li>)}</ul>
          <h4>Three next steps</h4>
          <ol>{state.steps.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}</ol>
          <p className="hint" style={{ marginTop: 18 }}>
            {state.source === 'ai'
              ? 'Written by AI from the figures above. It explains, it does not calculate. This is guidance, not financial advice.'
              : 'Written from the figures above using built-in templates (AI service not connected). This is guidance, not financial advice.'}
          </p>
        </div>
      )}
    </section>
  );
}
