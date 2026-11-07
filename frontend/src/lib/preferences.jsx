import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Display preferences: theme, text size, contrast and motion.
// Resolved values are written to <html data-*> so CSS can react; the same logic runs
// in an inline script in index.html before first paint so there is no colour flash.
const KEY = 'steady.prefs.v1';
export const DEFAULT_PREFS = { theme: 'system', textSize: 'standard', highContrast: false, reduceMotion: false };

const Ctx = createContext(null);
const mq = (q) => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q) : null);

function load() {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return DEFAULT_PREFS;
  }
}

function useMedia(query) {
  const [match, setMatch] = useState(() => mq(query)?.matches ?? false);
  useEffect(() => {
    const m = mq(query);
    if (!m) return undefined;
    const on = (e) => setMatch(e.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return match;
}

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(load);
  const systemDark = useMedia('(prefers-color-scheme: dark)');
  const systemContrast = useMedia('(prefers-contrast: more)');
  const systemReduce = useMedia('(prefers-reduced-motion: reduce)');

  const resolved = {
    theme: prefs.theme === 'system' ? (systemDark ? 'dark' : 'light') : prefs.theme,
    contrast: prefs.highContrast || systemContrast ? 'more' : 'standard',
    motion: prefs.reduceMotion || systemReduce ? 'reduce' : 'full',
    text: prefs.textSize,
  };

  useEffect(() => {
    const d = document.documentElement;
    d.dataset.theme = resolved.theme;
    d.dataset.contrast = resolved.contrast;
    d.dataset.motion = resolved.motion;
    d.dataset.text = resolved.text;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved.theme === 'dark' ? '#1C1922' : '#FFFFFF');
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {
      /* storage unavailable */
    }
  }, [prefs, resolved.theme, resolved.contrast, resolved.motion, resolved.text]);

  const value = useMemo(
    () => ({
      prefs,
      resolved,
      set: (patch) => setPrefs((p) => ({ ...p, ...patch })),
      reset: () => setPrefs(DEFAULT_PREFS),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prefs, resolved.theme, resolved.contrast, resolved.motion, resolved.text],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const usePreferences = () => useContext(Ctx);
