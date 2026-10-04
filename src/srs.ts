// Leitner-style spaced repetition, stored locally on the device.
import type { Item } from './types';
import { bumpToday } from './activity';
import { rank } from './cefr';
import { getProfile } from './profile';
import { onReset, read, write } from './store';

const DAY = 86_400_000;
const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16, 32];
export const MASTERED_BOX = 4;

export interface Card {
  box: number;
  due: number;
  seen: number;
  ok: number;
  /** last update time, used to merge progress from several devices */
  t?: number;
}
type Store = Record<string, Card>;

let cache: Store | null = null;
onReset(() => (cache = null));

function load(): Store {
  return (cache ??= read<Store>('progress', {}));
}

function save() {
  write('progress', cache);
}

export const getCard = (id: string): Card | undefined => load()[id];

/** Returns whether this was the first time the card was ever answered. */
export function record(id: string, correct: boolean): { first: boolean } {
  const s = load();
  const first = !s[id];
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
  c.t = Date.now();
  s[id] = c;
  save();
  bumpToday();
  return { first };
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
  // New cards come from the learner's own level first, then neighbouring levels
  // (slightly easier before slightly harder), randomised within a level.
  const mine = rank(getProfile()?.cefr ?? 'B1');
  const dist = (it: Item) => {
    const r = rank(it.cefr);
    return Math.abs(r - mine) * 2 + (r > mine ? 1 : 0);
  };
  const ordered = shuffle(fresh).sort((x, y) => dist(x) - dist(y));
  return [...due, ...ordered, ...later].slice(0, n);
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
