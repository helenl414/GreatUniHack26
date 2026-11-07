import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { buildPlan } from './engine';

// Everything the user enters stays on their device (localStorage). Nothing is sent
// anywhere unless they ask for an AI explanation, which only receives calculated figures.
const KEY = 'steady.profile.v1';
const Ctx = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(load);

  useEffect(() => {
    try {
      if (profile) localStorage.setItem(KEY, JSON.stringify(profile));
      else localStorage.removeItem(KEY);
    } catch {
      /* storage unavailable: keep working in memory */
    }
  }, [profile]);

  const plan = useMemo(() => (profile && profile.sources.length ? buildPlan(profile) : null), [profile]);

  const value = useMemo(() => ({ profile, setProfile, plan, clear: () => setProfile(null) }), [profile, plan]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useProfile = () => useContext(Ctx);
