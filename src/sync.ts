// Keeps the local data of a signed-in user and the cloud copy in step.
// Strategy: on sign-in, pull, merge (never lose anything), then push; afterwards
// push a few seconds after each local change.

import type { CloudBackend, CloudUser } from './backend';
import { applySnapshot, onChange, snapshot, type Snapshot } from './store';

export type SyncStatus = 'off' | 'syncing' | 'synced' | 'offline' | 'error';

let status: SyncStatus = 'off';
const listeners = new Set<(s: SyncStatus) => void>();
const setStatus = (s: SyncStatus) => {
  status = s;
  listeners.forEach((f) => f(s));
};
export const getSyncStatus = () => status;
export function onSyncStatus(fn: (s: SyncStatus) => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

let backend: CloudBackend | null = null;
let user: CloudUser | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let unsubscribe: (() => void) | undefined;
let onlineHandler: (() => void) | undefined;

/* ---------- merge ---------- */

const maxN = (a: number | undefined, b: number | undefined) => Math.max(a ?? 0, b ?? 0);
const union = <T,>(a: T[] = [], b: T[] = []) => [...new Set([...a, ...b])];

export function mergeSnapshots(local: Snapshot, remote: Snapshot): Snapshot {
  const out: Snapshot = { v: 1 };

  // profile: most recently edited wins
  if (local.profile || remote.profile) {
    const l = local.profile, r = remote.profile;
    out.profile = !l ? r : !r ? l : (r.updatedAt ?? 0) > (l.updatedAt ?? 0) ? r : l;
  }

  // progress: per card, the most recently updated wins
  if (local.progress || remote.progress) {
    const p: Record<string, any> = { ...(remote.progress ?? {}) };
    for (const [id, c] of Object.entries<any>(local.progress ?? {})) {
      const r = p[id];
      p[id] = !r ? c : (c.t ?? 0) !== (r.t ?? 0) ? ((c.t ?? 0) > (r.t ?? 0) ? c : r) : c.seen >= r.seen ? c : r;
    }
    out.progress = p;
  }

  // activity: per-day maximum, union of completed days, newest settings
  if (local.activity || remote.activity) {
    const l = local.activity ?? {}, r = remote.activity ?? {};
    const counts: Record<string, number> = { ...(r.counts ?? {}) };
    for (const [d, n] of Object.entries<number>(l.counts ?? {})) counts[d] = Math.max(n, counts[d] ?? 0);
    const useLocal = (l.settingsAt ?? 0) >= (r.settingsAt ?? 0);
    out.activity = {
      counts,
      done: { ...(r.done ?? {}), ...(l.done ?? {}) },
      settings: (useLocal ? l.settings : r.settings) ?? l.settings ?? r.settings,
      settingsAt: Math.max(l.settingsAt ?? 0, r.settingsAt ?? 0) || undefined,
    };
  }

  // game: counters only grow, so the maximum is always right
  if (local.game || remote.game) {
    const l = local.game ?? {}, r = remote.game ?? {};
    const ls = l.stats ?? {}, rs = r.stats ?? {};
    const days: Record<string, any> = { ...(r.days ?? {}) };
    for (const [d, v] of Object.entries<any>(l.days ?? {})) {
      const o = days[d];
      days[d] = !o ? v : { a: maxN(v.a, o.a), c: maxN(v.c, o.c), s: maxN(v.s, o.s), p: maxN(v.p, o.p), t: union(v.t, o.t) };
    }
    const badges: Record<string, number> = { ...(r.badges ?? {}) };
    for (const [id, ts] of Object.entries<number>(l.badges ?? {})) badges[id] = Math.min(ts, badges[id] ?? ts);
    out.game = {
      xp: maxN(l.xp, r.xp),
      badges,
      stats: {
        sessions: maxN(ls.sessions, rs.sessions),
        perfect: maxN(ls.perfect, rs.perfect),
        answers: maxN(ls.answers, rs.answers),
        correct: maxN(ls.correct, rs.correct),
        challenges: maxN(ls.challenges, rs.challenges),
        levelUps: maxN(ls.levelUps, rs.levelUps),
        early: !!(ls.early || rs.early),
        late: !!(ls.late || rs.late),
        themes: union(ls.themes, rs.themes),
      },
      days,
      claims: { ...(r.claims ?? {}), ...(l.claims ?? {}) },
      recent: (l.recent?.length ?? 0) >= (r.recent?.length ?? 0) ? (l.recent ?? []) : (r.recent ?? []),
    };
  }
  return out;
}

/* ---------- lifecycle ---------- */

async function pushNow() {
  if (!backend || !user) return;
  if (!navigator.onLine) return setStatus('offline');
  setStatus('syncing');
  try {
    await backend.push(user, snapshot());
    setStatus('synced');
  } catch {
    setStatus('error');
  }
}

export async function startSync(b: CloudBackend, u: CloudUser) {
  stopSync();
  backend = b;
  user = u;
  setStatus('syncing');
  try {
    const remote = await b.pull(u);
    if (remote) applySnapshot(mergeSnapshots(snapshot(), remote));
    await b.push(u, snapshot());
    setStatus('synced');
  } catch {
    setStatus(navigator.onLine ? 'error' : 'offline');
  }
  unsubscribe = onChange(() => {
    clearTimeout(timer);
    timer = setTimeout(pushNow, 2500);
  });
  onlineHandler = () => void pushNow();
  window.addEventListener('online', onlineHandler);
}

export function stopSync() {
  clearTimeout(timer);
  unsubscribe?.();
  if (onlineHandler) window.removeEventListener('online', onlineHandler);
  unsubscribe = onlineHandler = undefined;
  backend = null;
  user = null;
  setStatus('off');
}

/** Push immediately (used before sign-out so nothing is lost). */
export const flushSync = async () => {
  clearTimeout(timer);
  await pushNow();
};
