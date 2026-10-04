// Per-user local storage. Every key is namespaced by the current user id so
// several profiles (or accounts) can share one browser without mixing data.

type Listener = () => void;

let ns = 'guest';
const resetters: Listener[] = [];
const changeListeners = new Set<Listener>();

export const KEYS = ['profile', 'progress', 'activity', 'game'] as const;
export type Key = (typeof KEYS)[number];

const k = (key: string) => `gbm.${ns}.${key}`;

/** Modules holding an in-memory cache register here to drop it on user switch. */
export const onReset = (fn: Listener) => void resetters.push(fn);
export const getNamespace = () => ns;

export function setNamespace(id: string) {
  ns = id;
  resetters.forEach((f) => f());
}

export function read<T>(key: Key, fallback: T): T {
  try {
    const raw = localStorage.getItem(k(key));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write(key: Key, value: unknown, silent = false) {
  try {
    localStorage.setItem(k(key), JSON.stringify(value));
  } catch {
    /* storage unavailable: data lives in memory only */
  }
  if (!silent) changeListeners.forEach((f) => f());
}

export function has(key: Key): boolean {
  try {
    return localStorage.getItem(k(key)) !== null;
  } catch {
    return false;
  }
}

/** Subscribe to local data changes (used to schedule cloud sync). */
export function onChange(fn: Listener) {
  changeListeners.add(fn);
  return () => void changeListeners.delete(fn);
}

export type Snapshot = Partial<Record<Key, any>> & { v?: number };

export function snapshot(): Snapshot {
  const s: Snapshot = { v: 1 };
  for (const key of KEYS) if (has(key)) s[key] = read(key, null);
  return s;
}

export function applySnapshot(s: Snapshot) {
  for (const key of KEYS) if (s[key] != null) write(key, s[key], true);
  resetters.forEach((f) => f());
}

/** Before accounts existed, data lived under two global keys. Adopt it once. */
export function adoptLegacyData(): boolean {
  try {
    const p = localStorage.getItem('gbm.progress.v1');
    const a = localStorage.getItem('gbm.activity.v1');
    if (!p && !a) return false;
    if (p) write('progress', JSON.parse(p), true);
    if (a) write('activity', JSON.parse(a), true);
    localStorage.removeItem('gbm.progress.v1');
    localStorage.removeItem('gbm.activity.v1');
    resetters.forEach((f) => f());
    return true;
  } catch {
    return false;
  }
}

/** Erase every stored value of the current user. */
export function wipe() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(`gbm.${ns}.`))
    .forEach((key) => localStorage.removeItem(key));
  resetters.forEach((f) => f());
}
