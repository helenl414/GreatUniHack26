import { usePreferences } from './preferences';

// Recharts needs literal colours, so mirror the CSS tokens (styles/base.css) for each theme.
// Every series colour has at least 3:1 contrast against its background.
const LIGHT = {
  ink: '#1D1224', ink2: '#554A5C', ink3: '#72677A', grid: '#ECE6E0',
  bar: '#A68BC7', barLow: '#E3B367', barLowStroke: '#9A6A1E', steady: '#3C1053', average: '#8A7F91',
  without: '#C2334D', with: '#3C1053', shock: '#F6EEE4', zero: '#554A5C', cursor: '#F1EBF6',
};
const DARK = {
  ink: '#F2EDF5', ink2: '#C3B8C9', ink3: '#9D92A5', grid: '#2F2437',
  bar: '#6E5A8A', barLow: '#D6A65F', barLowStroke: '#D6A65F', steady: '#D9C3F5', average: '#9D92A5',
  without: '#F1A0AD', with: '#D9C3F5', shock: '#2A1D24', zero: '#C3B8C9', cursor: '#2A1D34',
};
const MORE = {
  light: { grid: '#9A9A9A', ink2: '#000000', ink3: '#000000', average: '#000000', bar: '#6B4E92' },
  dark: { grid: '#6B6B73', ink2: '#FFFFFF', ink3: '#FFFFFF', average: '#FFFFFF' },
};

export function useChartTheme() {
  const { resolved } = usePreferences();
  const base = resolved.theme === 'dark' ? DARK : LIGHT;
  return resolved.contrast === 'more' ? { ...base, ...MORE[resolved.theme] } : base;
}
