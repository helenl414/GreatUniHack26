// Adapter for the AI backend. Contract: docs/handoff/ai-api.md
//
// One switch: set VITE_API_URL (e.g. http://localhost:8000) to use the real backend.
// Without it, the clearly-labelled local mocks in src/mocks/ are used instead, so the
// app is fully usable offline and in demos.
import { parseLocally } from '../mocks/parseLocal';
import { explainLocally } from '../mocks/explainLocal';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const usingRealAI = Boolean(API_URL);

async function post(path, body, { timeoutMs = 20000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

/**
 * Turn a free-text (or spoken) description into a draft profile.
 * @returns {Promise<{ result: ParseResult, source: 'ai' | 'local' }>}
 */
export async function parseDescription(text, months) {
  if (usingRealAI) {
    try {
      const result = await post('/api/parse', { text, months });
      return { result, source: 'ai' };
    } catch {
      /* fall back to local parser below */
    }
  }
  return { result: parseLocally(text, months), source: 'local' };
}

/**
 * Plain-language explanation of figures that were already calculated.
 * kind: 'plan' | 'simulation' | 'report'
 * @returns {Promise<{ summary: string, meaning: string[], steps: string[], source: 'ai' | 'local' }>}
 */
export async function explain(kind, figures) {
  if (usingRealAI) {
    try {
      const r = await post('/api/explain', { kind, figures });
      if (r && r.summary && Array.isArray(r.steps)) return { ...r, source: 'ai' };
    } catch {
      /* fall back */
    }
  }
  await new Promise((r) => setTimeout(r, 450));
  return { ...explainLocally(kind, figures), source: 'local' };
}
