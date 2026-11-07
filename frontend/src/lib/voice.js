import { useEffect, useRef, useState } from 'react';

// Voice is central to Sothis: people can speak their situation and hear their plan.
// ElevenLabs does both (via /api/tts and /api/stt, key kept server-side).
// If it isn't configured or fails, we fall back to the browser's own speech so nothing breaks.

const canSynth = typeof window !== 'undefined' && 'speechSynthesis' in window;
let current = null; // only one voice plays at a time, app-wide

function stopCurrent() {
  if (current) current.stop();
  current = null;
}

function browserSpeak(text, onEnd) {
  if (!canSynth) {
    onEnd();
    return { stop() {} };
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-GB';
  u.rate = 0.97;
  u.onend = onEnd;
  u.onerror = onEnd;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
  return { stop: () => window.speechSynthesis.cancel() };
}

/**
 * Play text aloud. Resolves to the source used: 'elevenlabs' | 'browser'.
 * onStart fires when audio actually begins, onEnd when it finishes or is stopped.
 */
export async function speak(text, { onStart, onEnd } = {}) {
  stopCurrent();
  let ended = false;
  const done = () => {
    if (ended) return;
    ended = true;
    onEnd?.();
  };
  const handle = { stopped: false, stop: () => { handle.stopped = true; inner?.stop(); done(); } };
  let inner = null;
  current = handle;
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`tts ${res.status}`);
    const blob = await res.blob();
    if (handle.stopped) return 'elevenlabs';
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    inner = {
      stop: () => {
        audio.pause();
        URL.revokeObjectURL(url);
      },
    };
    audio.onended = () => {
      URL.revokeObjectURL(url);
      done();
    };
    audio.onerror = done;
    await audio.play();
    onStart?.();
    return 'elevenlabs';
  } catch {
    if (handle.stopped) return 'browser';
    inner = browserSpeak(text, done);
    onStart?.();
    return 'browser';
  }
}

/** State wrapper for a play/stop button. status: 'idle' | 'loading' | 'playing' */
export function useVoice() {
  const [status, setStatus] = useState('idle');
  const [source, setSource] = useState(null);
  const mine = useRef(false);
  useEffect(() => () => mine.current && stopCurrent(), []);

  const play = async (text) => {
    mine.current = true;
    setStatus('loading');
    const src = await speak(text, {
      onStart: () => setStatus('playing'),
      onEnd: () => setStatus('idle'),
    });
    setSource(src);
  };
  const stop = () => {
    stopCurrent();
    setStatus('idle');
  };
  const toggle = (text) => (status === 'idle' ? play(text) : stop());
  return { status, source, play, stop, toggle };
}

// ---------- Speech to text ----------

const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const canRecord =
  typeof window !== 'undefined' && 'MediaRecorder' in window && navigator.mediaDevices?.getUserMedia;

/**
 * Record speech and turn it into text.
 * Prefers ElevenLabs Scribe (works in every modern browser, handles accents and £ amounts);
 * falls back to the browser's live recognition when ElevenLabs isn't available.
 */
export function useSpeech(onFinalText) {
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const [level, setLevel] = useState(0);
  const cbRef = useRef(onFinalText);
  cbRef.current = onFinalText;
  const rec = useRef(null);
  const cleanup = useRef(() => {});
  const elevenDown = useRef(false);

  useEffect(() => () => cleanup.current(), []);

  const startBrowser = () => {
    if (!SR) {
      setError('Voice input isn’t available here. Type instead, or use your keyboard’s dictation button.');
      return;
    }
    const r = new SR();
    r.lang = 'en-GB';
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let live = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const x = e.results[i];
        if (x.isFinal) cbRef.current(x[0].transcript.trim());
        else live += x[0].transcript;
      }
      setInterim(live);
    };
    r.onerror = (e) =>
      setError(
        e.error === 'not-allowed' || e.error === 'service-not-allowed'
          ? 'Microphone access was blocked. Allow it in your browser settings, or type instead.'
          : 'Voice input stopped. Try again or type instead.',
      );
    r.onend = () => {
      setListening(false);
      setInterim('');
    };
    rec.current = { stop: () => r.stop() };
    cleanup.current = () => r.abort();
    r.start();
    setListening(true);
  };

  const start = async () => {
    setError(null);
    if (!canRecord || elevenDown.current) return startBrowser();
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Microphone access was blocked. Allow it in your browser settings, or type instead.');
      return;
    }
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find(
      (m) => window.MediaRecorder.isTypeSupported?.(m),
    );
    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks = [];
    mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);

    // Live input level for the mic animation.
    let raf = 0;
    let ctx;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.frequencyBinCount);
      const tick = () => {
        an.getByteTimeDomainData(buf);
        let peak = 0;
        for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
        setLevel(Math.min(1, peak / 64));
        raf = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* level meter is decorative */
    }

    const release = () => {
      cancelAnimationFrame(raf);
      ctx?.close?.();
      stream.getTracks().forEach((t) => t.stop());
      setLevel(0);
    };
    cleanup.current = () => {
      if (mr.state !== 'inactive') mr.stop();
      release();
    };

    mr.onstop = async () => {
      release();
      setListening(false);
      const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
      if (blob.size < 2000) {
        setError("We didn't catch that. Tap the mic and speak a little longer.");
        return;
      }
      setTranscribing(true);
      try {
        const res = await fetch('/api/stt', { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob });
        if (res.status === 503) elevenDown.current = true;
        if (!res.ok) throw new Error(`stt ${res.status}`);
        const { text } = await res.json();
        if (text) cbRef.current(text);
        else setError("We didn't catch any words. Try again a little closer to the mic.");
      } catch {
        setError(
          SR
            ? 'Voice transcription is unavailable right now. Tap the mic again to use your browser’s voice input, or type instead.'
            : 'Voice transcription is unavailable right now. Please type instead.',
        );
        elevenDown.current = true;
      } finally {
        setTranscribing(false);
      }
    };
    rec.current = { stop: () => mr.state !== 'inactive' && mr.stop() };
    mr.start();
    setListening(true);
  };

  const stop = () => rec.current?.stop();

  return {
    supported: Boolean(canRecord || SR),
    listening,
    transcribing,
    interim,
    level,
    error,
    start,
    stop,
  };
}
