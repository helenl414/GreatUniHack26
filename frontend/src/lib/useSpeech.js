import { useEffect, useRef, useState } from 'react';

// Thin wrapper over the browser's Web Speech API (Chrome, Edge, Safari).
// Speech is turned into text in the browser; the text is then analysed like typed input.
const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export function useSpeech(onFinalText) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const recRef = useRef(null);
  const cbRef = useRef(onFinalText);
  cbRef.current = onFinalText;

  useEffect(() => () => recRef.current?.abort(), []);

  const start = () => {
    if (!SR) return;
    setError(null);
    const rec = new SR();
    rec.lang = 'en-GB';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let live = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) cbRef.current(r[0].transcript.trim());
        else live += r[0].transcript;
      }
      setInterim(live);
    };
    rec.onerror = (e) => {
      setError(
        e.error === 'not-allowed' || e.error === 'service-not-allowed'
          ? 'Microphone access was blocked. Allow it in your browser settings, or type instead.'
          : e.error === 'no-speech'
            ? "We didn't hear anything. Try again a little closer to the microphone."
            : 'Voice input stopped unexpectedly. You can try again or type instead.',
      );
    };
    rec.onend = () => {
      setListening(false);
      setInterim('');
    };
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stop = () => recRef.current?.stop();

  return { supported: Boolean(SR), listening, interim, error, start, stop };
}
