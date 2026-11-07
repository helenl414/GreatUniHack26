// One small, consistent stroke icon set (24px grid, 1.8 stroke).
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const IconPlan = (p) => (
  <svg {...base} {...p}><path d="M4 19V11M9 19V6M14 19v-9M19 19V8" /><path d="M3 12.5c3-1.5 6-1.5 9 0s6 1.5 9 0" /></svg>
);
export const IconSim = (p) => (
  <svg {...base} {...p}><path d="M3 5v14h18" /><path d="M7 9l4 3 3-5 5 9" /></svg>
);
export const IconReport = (p) => (
  <svg {...base} {...p}><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></svg>
);
export const IconMic = (p) => (
  <svg {...base} {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></svg>
);
export const IconForm = (p) => (
  <svg {...base} {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
);
export const IconSpark = (p) => (
  <svg {...base} {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></svg>
);
export const IconInfo = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
export const IconTrash = (p) => (
  <svg {...base} width={18} height={18} {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
);
export const IconPlus = (p) => (
  <svg {...base} width={18} height={18} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconArrow = (p) => (
  <svg {...base} width={18} height={18} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconBack = (p) => (
  <svg {...base} width={18} height={18} {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const IconPrint = (p) => (
  <svg {...base} width={18} height={18} {...p}><path d="M7 9V3h10v6M7 17H4v-7h16v7h-3" /><rect x="7" y="14" width="10" height="7" /></svg>
);
export const IconDownload = (p) => (
  <svg {...base} width={18} height={18} {...p}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
);
export const IconShield = (p) => (
  <svg {...base} {...p}><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
);

/** The Steady mark: uneven bars, one steady line. */
export function SteadyMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#fff" fillOpacity="0.12" />
      <rect x="7" y="13" width="3.5" height="12" rx="1" fill="#CDB8E3" />
      <rect x="12.5" y="8" width="3.5" height="17" rx="1" fill="#CDB8E3" />
      <rect x="18" y="16" width="3.5" height="9" rx="1" fill="#CDB8E3" />
      <rect x="23.5" y="11" width="3.5" height="14" rx="1" fill="#CDB8E3" />
      <path d="M5 15.5c4-1.6 7-1.6 11 0s7 1.6 11 0" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
