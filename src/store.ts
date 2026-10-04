// Per-player local storage. Every key is namespaced by the current player id so
// several players can share one device without mixing data.

type Listener = () => void;

let ns = 'guest';
const resetters: Listener[] = [];
export type Key = 'profile' | 'progress' | 'activity' | 'game';

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

export function write(key: Key, value: unknown) {
  try {
    localStorage.setItem(k(key), JSON.stringify(value));
  } catch {
    /* storage unavailable: data lives in memory only */
  }
}

export function has(key: Key): boolean {
  try {
    return localStorage.getItem(k(key)) !== null;
  } catch {
    return false;
  }
}

/** Before profiles existed, data lived under two global keys. Adopt it once. */
export function adoptLegacyData(): boolean {
  try {
    const p = localStorage.getItem('gbm.progress.v1');
    const a = localStorage.getItem('gbm.activity.v1');
    if (!p && !a) return false;
    if (p) write('progress', JSON.parse(p));
    if (a) write('activity', JSON.parse(a));
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
