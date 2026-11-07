import { useVoice } from '../lib/voice';

const Play = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 001.5.86l10.6-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" fill="currentColor" /></svg>
);
const Stop = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="3" fill="currentColor" /></svg>
);

/** Play/stop button that speaks `text` (or the result of `getText()`) with ElevenLabs. */
export function VoiceButton({ text, getText, label = 'Hear my week', tone = 'light', small = false }) {
  const v = useVoice();
  const busy = v.status === 'loading';
  const on = v.status !== 'idle';
  return (
    <button
      type="button"
      className={`voice-btn voice-${tone}${small ? ' voice-small' : ''}${on ? ' is-on' : ''}`}
      onClick={() => v.toggle(text ?? getText())}
      aria-pressed={on}
      aria-label={on ? 'Stop speaking' : label}
    >
      <span className="voice-icon" aria-hidden="true">
        {busy ? <span className="voice-spin" /> : on ? <Stop /> : <Play />}
      </span>
      <span>{busy ? 'Preparing…' : on ? 'Stop' : label}</span>
      {v.status === 'playing' && (
        <span className="voice-bars" aria-hidden="true"><i /><i /><i /><i /></span>
      )}
    </button>
  );
}
