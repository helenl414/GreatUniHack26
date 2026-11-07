import { useEffect, useId, useRef, useState } from 'react';
import { usePreferences } from '../lib/preferences';
import { useProfile } from '../lib/store';
import { go } from '../lib/useHashRoute';
import { IconClose, IconMonitor, IconMoon, IconSliders, IconSun } from './Icons';

function Segmented({ legend, name, value, options, onChange }) {
  return (
    <fieldset className="settings-group">
      <legend>{legend}</legend>
      <div className="segmented">
        {options.map((o) => (
          <label key={o.value}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.icon}
            <span style={o.style}>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Switch({ label, hint, checked, onChange }) {
  const id = useId();
  return (
    <label className="switch-row" htmlFor={id}>
      <span>
        {label}
        <small>{hint}</small>
      </span>
      <input id={id} className="switch" type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

/** Display settings popover in the top bar: theme, text size, contrast, motion, and data deletion. */
export function DisplaySettings() {
  const { prefs, set, reset } = usePreferences();
  const { profile, clear } = useProfile();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    panelRef.current?.querySelector('input')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onClick = (e) => {
      if (!panelRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onClick);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setConfirmDelete(false);
  }, [open]);

  const deleteData = () => {
    clear();
    setOpen(false);
    go('plan');
  };

  return (
    <div className="settings-wrap">
      <button
        ref={btnRef}
        className="settings-btn"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Display and accessibility settings"
        onClick={() => setOpen((o) => !o)}
      >
        <IconSliders width={18} height={18} />
        <span className="settings-label">Display</span>
      </button>

      {open && (
        <div ref={panelRef} id={panelId} className="settings-panel fade-in" role="dialog" aria-label="Display and accessibility settings">
          <div className="settings-head">
            <div>
              <h2>Display</h2>
              <p>Make Sothis comfortable to read.</p>
            </div>
            <button className="icon-btn" style={{ border: 0 }} aria-label="Close settings" onClick={() => { setOpen(false); btnRef.current?.focus(); }}>
              <IconClose />
            </button>
          </div>

          <Segmented
            legend="Appearance"
            name="theme"
            value={prefs.theme}
            onChange={(theme) => set({ theme })}
            options={[
              { value: 'system', label: 'Auto', icon: <IconMonitor /> },
              { value: 'light', label: 'Light', icon: <IconSun /> },
              { value: 'dark', label: 'Dark', icon: <IconMoon /> },
            ]}
          />

          <Segmented
            legend="Text size"
            name="text"
            value={prefs.textSize}
            onChange={(textSize) => set({ textSize })}
            options={[
              { value: 'standard', label: 'Standard', style: { fontSize: '0.85rem' } },
              { value: 'large', label: 'Large', style: { fontSize: '0.95rem' } },
              { value: 'larger', label: 'Largest', style: { fontSize: '1.05rem' } },
            ]}
          />

          <fieldset className="settings-group settings-toggles">
            <legend className="sr-only">Other options</legend>
            <Switch
              label="High contrast"
              hint="Bolder text, borders and focus rings"
              checked={prefs.highContrast}
              onChange={(highContrast) => set({ highContrast })}
            />
            <Switch
              label="Reduce motion"
              hint="Keep the screen still"
              checked={prefs.reduceMotion}
              onChange={(reduceMotion) => set({ reduceMotion })}
            />
          </fieldset>

          <div className="settings-foot">
            <button className="btn btn-ghost btn-small" onClick={reset}>Reset display</button>
            {profile && !confirmDelete && (
              <button className="btn btn-secondary btn-small" onClick={() => setConfirmDelete(true)}>Delete my data</button>
            )}
          </div>
          {confirmDelete && (
            <div className="callout warn" role="alert" style={{ marginTop: 12, flexDirection: 'column' }}>
              <span>This removes your income, bills and savings from this device. You can&rsquo;t undo it.</span>
              <div className="row">
                <button className="btn btn-primary btn-small" onClick={deleteData}>Yes, delete it</button>
                <button className="btn btn-ghost btn-small" onClick={() => setConfirmDelete(false)}>Keep my data</button>
              </div>
            </div>
          )}
          <p className="settings-saved">Saved on this device only.</p>
        </div>
      )}
    </div>
  );
}
