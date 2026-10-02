// Leitner-style spaced repetition, stored locally on the device.
import type { Item } from './types';
import { bumpToday } from './activity';

const KEY = 'gbm.progress.v1';
const DAY = 86_400_000;
const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16, 32];
export const MASTERED_BOX = 4;

export interface Card {
  box: number;
  due: number;
  seen: number;
  ok: number;
}
type Store = Record<string, Card>;

let cache: Store | null = null;

function read(): Store {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    cache = {};
  }
  return cache!;
}

function write() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* storage unavailable: progress lives in memory only */
  }
}

export const getCard = (id: string): Card | undefined => read()[id];

export function record(id: string, correct: boolean) {
  const s = read();
  const c = s[id] ?? { box: 0, due: 0, seen: 0, ok: 0 };
  c.seen += 1;
  if (correct) {
    c.ok += 1;
    c.box = Math.min(c.box + 1, INTERVAL_DAYS.length - 1);
    c.due = Date.now() + INTERVAL_DAYS[c.box] * DAY;
  } else {
    c.box = 1;
    c.due = Date.now() + 10 * 60_000;
  }
  s[id] = c;
  write();
  bumpToday();
}

export function packStats(items: Item[]) {
  const now = Date.now();
  let mastered = 0, due = 0, fresh = 0;
  for (const it of items) {
    const c = getCard(it.id);
    if (!c) fresh++;
    else {
      if (c.box >= MASTERED_BOX) mastered++;
      if (c.due <= now) due++;
    }
  }
  return { total: items.length, mastered, due, fresh };
}

export const shuffle = <T,>(a: T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

/** Due cards first (weakest box first), then new ones, then the rest. */
export function pickSession<T extends Item>(items: T[], n = 10): T[] {
  const now = Date.now();
  const due: T[] = [], fresh: T[] = [], later: T[] = [];
  for (const it of items) {
    const c = getCard(it.id);
    if (!c) fresh.push(it);
    else if (c.due <= now) due.push(it);
    else later.push(it);
  }
  due.sort((a, b) => getCard(a.id)!.box - getCard(b.id)!.box);
  later.sort((a, b) => getCard(a.id)!.due - getCard(b.id)!.due);
  return [...due, ...shuffle(fresh), ...later].slice(0, n);
}

export function overall(items: Item[][]) {
  return items.reduce(
    (acc, list) => {
      const s = packStats(list);
      return { total: acc.total + s.total, mastered: acc.mastered + s.mastered, due: acc.due + s.due };
    },
    { total: 0, mastered: 0, due: 0 }
  );
}
