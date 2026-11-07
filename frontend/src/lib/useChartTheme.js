import { useEffect, useState } from 'react';

// Recharts needs literal colours, so mirror the CSS tokens for light and dark.
const LIGHT = {
  ink: '#1D1129', ink2: '#5B4E66', ink3: '#8A7F94', grid: '#E9E1F0',
  bar: '#CDB8E3', barLow: '#F2C48F', steady: '#42145F', average: '#8A7F94',
  without: '#C4122F', with: '#5E10B1', shock: '#FDF0E1', zero: '#1D1129',
};
const DARK = {
  ink: '#F3EEF8', ink2: '#BEB2CA', ink3: '#8E829A', grid: '#2E2239',
  bar: '#5B3F7A', barLow: '#8A5A2A', steady: '#E7D7FB', average: '#8E829A',
  without: '#FF7088', with: '#C3A3FF', shock: '#2E2116', zero: '#F3EEF8',
};

const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

export function useChartTheme() {
  const [dark, setDark] = useState(mq?.matches ?? false);
  useEffect(() => {
    if (!mq) return undefined;
    const on = (e) => setDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return dark ? DARK : LIGHT;
}
