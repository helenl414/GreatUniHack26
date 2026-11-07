import { usePreferences } from './preferences';

// Recharts needs literal colours, so mirror the CSS tokens for each theme.
// Every series colour has at least 3:1 contrast against its background.
const LIGHT = {
  ink: '#2A2433', ink2: '#57505F', ink3: '#6B6475', grid: '#EEEAF3',
  bar: '#7491CF', barLow: '#EBC48A', barLowStroke: '#B07C2C', steady: '#5B3E96', average: '#8A8394',
  without: '#C0606E', with: '#5B3E96', shock: '#F9ECEE', zero: '#57505F',
};
const DARK = {
  ink: '#ECE9F1', ink2: '#BDB6C8', ink3: '#9A93A6', grid: '#2C2833',
  bar: '#6F87BF', barLow: '#D6A65F', barLowStroke: '#D6A65F', steady: '#8EC3DC', average: '#9A93A6',
  without: '#E08F99', with: '#8EC3DC', shock: '#2E2228', zero: '#BDB6C8',
};
const MORE = {
  light: { grid: '#9A9A9A', ink2: '#000000', ink3: '#000000', average: '#000000', bar: '#4A68AE' },
  dark: { grid: '#6B6B73', ink2: '#FFFFFF', ink3: '#FFFFFF', average: '#FFFFFF' },
};

export function useChartTheme() {
  const { resolved } = usePreferences();
  const base = resolved.theme === 'dark' ? DARK : LIGHT;
  return resolved.contrast === 'more' ? { ...base, ...MORE[resolved.theme] } : base;
}
