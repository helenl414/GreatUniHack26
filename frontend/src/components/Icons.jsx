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

export const IconSliders = (p) => (
  <svg {...base} {...p}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>
);
export const IconSun = (p) => (
  <svg {...base} width={18} height={18} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const IconMoon = (p) => (
  <svg {...base} width={18} height={18} {...p}><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" /></svg>
);
export const IconMonitor = (p) => (
  <svg {...base} width={18} height={18} {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>
);
export const IconSpeaker = (p) => (
  <svg {...base} width={18} height={18} {...p}><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" /></svg>
);
export const IconStop = (p) => (
  <svg {...base} width={18} height={18} {...p}><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
);
export const IconHelp = (p) => (
  <svg {...base} width={15} height={15} {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1.1-1.5 2.2M12 17h.01" /></svg>
);
export const IconClose = (p) => (
  <svg {...base} width={18} height={18} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
);

/** The Steady mark: uneven bars, one steady line. */
export function SteadyMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#5B3E96" />
      <rect x="7" y="13" width="3.5" height="12" rx="1" fill="#B9C6E8" />
      <rect x="12.5" y="8" width="3.5" height="17" rx="1" fill="#B9C6E8" />
      <rect x="18" y="16" width="3.5" height="9" rx="1" fill="#EBC48A" />
      <rect x="23.5" y="11" width="3.5" height="14" rx="1" fill="#B9C6E8" />
      <path d="M5 15.5c4-1.6 7-1.6 11 0s7 1.6 11 0" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
