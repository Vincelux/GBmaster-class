// Light gamification: XP and ranks, badges, daily and weekly challenges.
// The tone is deliberately grown-up: corporate ranks rather than cartoon levels.

import { PACKS } from './data';
import { rank as cefrRank, CEFR, type Cefr } from './cefr';
import { dayKey, goalReached, streak } from './activity';
import { getCard, MASTERED_BOX } from './srs';
import { onReset, read, write } from './store';
import { toast } from './toast';

interface Day {
  a: number; // answers
  c: number; // correct
  s: number; // sessions
  p: number; // perfect sessions
  t: string[]; // themes practised
}
export interface Game {
  xp: number;
  badges: Record<string, number>;
  stats: {
    sessions: number;
    perfect: number;
    answers: number;
    correct: number;
    challenges: number;
    levelUps: number;
    early: boolean;
    late: boolean;
    themes: string[];
  };
  days: Record<string, Day>;
  claims: Record<string, number>;
  /** outcome of the last answers (1 = correct), used to advise on level changes */
  recent: number[];
}

const empty = (): Game => ({
  xp: 0,
  badges: {},
  stats: { sessions: 0, perfect: 0, answers: 0, correct: 0, challenges: 0, levelUps: 0, early: false, late: false, themes: [] },
  days: {},
  claims: {},
  recent: [],
});

let cache: Game | null = null;
onReset(() => (cache = null));

export function getGame(): Game {
  if (!cache) {
    const raw = read<Partial<Game>>('game', {});
    const e = empty();
    cache = { ...e, ...raw, stats: { ...e.stats, ...(raw.stats ?? {}) } };
  }
  return cache;
}
const save = () => write('game', cache);

/* ---------- ranks ---------- */

const RANKS = [
  { name: 'Intern', xp: 0 },
  { name: 'Junior Associate', xp: 150 },
  { name: 'Associate', xp: 500 },
  { name: 'Senior Associate', xp: 1200 },
  { name: 'Manager', xp: 2500 },
  { name: 'Senior Manager', xp: 4500 },
  { name: 'Director', xp: 7500 },
  { name: 'Vice President', xp: 12000 },
  { name: 'Partner', xp: 20000 },
];

export function rankInfo(xp = getGame().xp) {
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1].xp) i++;
  const cur = RANKS[i];
  const next = RANKS[i + 1];
  return {
    index: i,
    name: cur.name,
    next: next?.name,
    toNext: next ? next.xp - xp : 0,
    progress: next ? (xp - cur.xp) / (next.xp - cur.xp) : 1,
  };
}

function award(amount: number) {
  const g = getGame();
  const before = rankInfo(g.xp).index;
  g.xp += amount;
  const after = rankInfo(g.xp);
  if (after.index > before) toast('🏅', `Promoted: ${after.name}`, 'Your hard work is paying off.');
}

/* ---------- mastery ---------- */

export function masteredCounts() {
  const byPack: Record<string, number> = {};
  let total = 0;
  for (const p of PACKS) {
    let n = 0;
    for (const it of p.items) if ((getCard(it.id)?.box ?? 0) >= MASTERED_BOX) n++;
    byPack[p.id] = n;
    total += n;
  }
  return { total, byPack };
}

/* ---------- badges ---------- */

interface Ctx {
  g: Game;
  streak: number;
  mastered: number;
  byPack: Record<string, number>;
}
export interface BadgeDef {
  id: string;
  icon: string;
  title: string;
  desc: string;
  test: (c: Ctx) => boolean;
}

export const BADGES: BadgeDef[] = [
  { id: 'first_session', icon: '🏁', title: 'Off the blocks', desc: 'Complete your first session.', test: (c) => c.g.stats.sessions >= 1 },
  { id: 'ten_sessions', icon: '📅', title: 'Regular', desc: 'Complete 10 sessions.', test: (c) => c.g.stats.sessions >= 10 },
  { id: 'perfect', icon: '🎯', title: 'Flawless', desc: 'Finish a session with no mistakes.', test: (c) => c.g.stats.perfect >= 1 },
  { id: 'perfect_5', icon: '💎', title: 'Perfectionist', desc: 'Finish 5 flawless sessions.', test: (c) => c.g.stats.perfect >= 5 },
  { id: 'streak_3', icon: '🔥', title: 'On a roll', desc: 'Reach a 3-day streak.', test: (c) => c.streak >= 3 },
  { id: 'streak_7', icon: '⚡', title: 'Week warrior', desc: 'Reach a 7-day streak.', test: (c) => c.streak >= 7 },
  { id: 'streak_30', icon: '🏆', title: 'Iron discipline', desc: 'Reach a 30-day streak.', test: (c) => c.streak >= 30 },
  { id: 'master_25', icon: '🌱', title: 'Getting there', desc: 'Master 25 items.', test: (c) => c.mastered >= 25 },
  { id: 'master_100', icon: '🌳', title: 'Solid foundations', desc: 'Master 100 items.', test: (c) => c.mastered >= 100 },
  { id: 'master_250', icon: '🏛', title: 'Well-versed', desc: 'Master 250 items.', test: (c) => c.mastered >= 250 },
  { id: 'master_500', icon: '👑', title: 'Wordsmith', desc: 'Master 500 items.', test: (c) => c.mastered >= 500 },
  { id: 'answers_500', icon: '💪', title: 'Workhorse', desc: 'Answer 500 questions.', test: (c) => c.g.stats.answers >= 500 },
  { id: 'answers_2000', icon: '🚀', title: 'Relentless', desc: 'Answer 2,000 questions.', test: (c) => c.g.stats.answers >= 2000 },
  { id: 'explorer', icon: '🧭', title: 'Explorer', desc: 'Practise 5 different themes.', test: (c) => c.g.stats.themes.length >= 5 },
  { id: 'polyglot', icon: '🌍', title: 'All-rounder', desc: 'Practise every theme.', test: (c) => c.g.stats.themes.length >= PACKS.length },
  { id: 'specialist', icon: '🎓', title: 'Specialist', desc: 'Master 30 items in one theme.', test: (c) => Object.values(c.byPack).some((n) => n >= 30) },
  { id: 'verb_virtuoso', icon: '↺', title: 'Verb virtuoso', desc: 'Master 50 irregular verbs.', test: (c) => (c.byPack.verbs ?? 0) >= 50 },
  { id: 'level_up', icon: '📈', title: 'Stepping up', desc: 'Raise your level.', test: (c) => c.g.stats.levelUps >= 1 },
  { id: 'early_bird', icon: '🌅', title: 'Early bird', desc: 'Finish a session before 8 am.', test: (c) => c.g.stats.early },
  { id: 'night_owl', icon: '🌙', title: 'Night owl', desc: 'Finish a session after 10 pm.', test: (c) => c.g.stats.late },
  { id: 'challenger', icon: '⭐', title: 'Challenger', desc: 'Complete 5 challenges.', test: (c) => c.g.stats.challenges >= 5 },
  { id: 'challenge_master', icon: '🌟', title: 'Challenge master', desc: 'Complete 25 challenges.', test: (c) => c.g.stats.challenges >= 25 },
];

/* ---------- challenges ---------- */

export interface Challenge {
  id: string;
  title: string;
  goal: number;
  progress: number;
  xp: number;
  done: boolean;
  weekly: boolean;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function seeded<T>(items: T[], seed: string): T[] {
  let a = hash(seed);
  const rnd = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = [...items];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

const PRO = new Set(PACKS.filter((p) => p.group === 'Professional').map((p) => p.id));
const emptyDay = (): Day => ({ a: 0, c: 0, s: 0, p: 0, t: [] });
const dayOf = (k: string): Day => getGame().days[k] ?? emptyDay();

interface DailyTemplate {
  key: string;
  title: string;
  goal: number;
  xp: number;
  measure: (d: Day) => number;
}
const DAILY: DailyTemplate[] = [
  { key: 'answers', title: 'Answer 20 questions', goal: 20, xp: 20, measure: (d) => d.a },
  { key: 'correct', title: 'Get 15 correct answers', goal: 15, xp: 25, measure: (d) => d.c },
  { key: 'sessions', title: 'Complete 2 sessions', goal: 2, xp: 25, measure: (d) => d.s },
  { key: 'perfect', title: 'Finish a flawless session', goal: 1, xp: 40, measure: (d) => d.p },
  { key: 'themes', title: 'Practise 2 different themes', goal: 2, xp: 25, measure: (d) => d.t.length },
  { key: 'verbs', title: 'Practise irregular verbs', goal: 1, xp: 15, measure: (d) => (d.t.includes('verbs') ? 1 : 0) },
  { key: 'pro', title: 'Practise a professional theme', goal: 1, xp: 15, measure: (d) => (d.t.some((x) => PRO.has(x)) ? 1 : 0) },
];

const mondayOf = (d = new Date()) => {
  const m = new Date(d);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
};
const weekDays = () => {
  const m = mondayOf();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(m);
    d.setDate(m.getDate() + i);
    return dayKey(d);
  });
};

interface WeeklyTemplate {
  key: string;
  title: string;
  goal: number;
  xp: number;
  measure: (days: Day[]) => number;
}
const WEEKLY: WeeklyTemplate[] = [
  { key: 'answers', title: 'Answer 150 questions this week', goal: 150, xp: 100, measure: (ds) => ds.reduce((n, d) => n + d.a, 0) },
  { key: 'sessions', title: 'Complete 8 sessions this week', goal: 8, xp: 100, measure: (ds) => ds.reduce((n, d) => n + d.s, 0) },
  { key: 'active', title: 'Practise on 5 different days this week', goal: 5, xp: 120, measure: (ds) => ds.filter((d) => d.a > 0).length },
];

export function challenges(): Challenge[] {
  const g = getGame();
  const today = dayKey();
  const d = dayOf(today);
  const daily = seeded(DAILY, today)
    .slice(0, 3)
    .map((t): Challenge => {
      const progress = Math.min(t.measure(d), t.goal);
      return { id: `d:${today}:${t.key}`, title: t.title, goal: t.goal, progress, xp: t.xp, done: !!g.claims[`d:${today}:${t.key}`] || progress >= t.goal, weekly: false };
    });
  const days = weekDays();
  const wk = days[0];
  const w = seeded(WEEKLY, wk)[0];
  const progress = Math.min(w.measure(days.map(dayOf)), w.goal);
  const weekly: Challenge = { id: `w:${wk}:${w.key}`, title: w.title, goal: w.goal, progress, xp: w.xp, done: !!g.claims[`w:${wk}:${w.key}`] || progress >= w.goal, weekly: true };
  return [...daily, weekly];
}

/* ---------- evaluation ---------- */

export interface GameEvent {
  kind: 'badge' | 'challenge';
  icon: string;
  title: string;
  xp?: number;
}

/** Claim finished challenges and unlock badges. Returns what just happened. */
export function evaluate(): GameEvent[] {
  const g = getGame();
  const events: GameEvent[] = [];

  const today = dayKey();
  if (goalReached() && !g.claims[`goal:${today}`]) {
    g.claims[`goal:${today}`] = Date.now();
    award(25);
    events.push({ kind: 'challenge', icon: '✅', title: 'Daily goal reached', xp: 25 });
  }

  for (const c of challenges()) {
    if (c.progress >= c.goal && !g.claims[c.id]) {
      g.claims[c.id] = Date.now();
      g.stats.challenges++;
      award(c.xp);
      events.push({ kind: 'challenge', icon: c.weekly ? '🏅' : '⭐', title: c.title, xp: c.xp });
    }
  }

  const { total, byPack } = masteredCounts();
  const ctx: Ctx = { g, streak: streak(), mastered: total, byPack };
  for (const b of BADGES) {
    if (!g.badges[b.id] && b.test(ctx)) {
      g.badges[b.id] = Date.now();
      events.push({ kind: 'badge', icon: b.icon, title: b.title });
    }
  }

  save();
  for (const e of events) toast(e.icon, e.kind === 'badge' ? `Badge unlocked: ${e.title}` : `Done: ${e.title}`, e.xp ? `+${e.xp} XP` : undefined);
  return events;
}

/* ---------- hooks called by the exercise screens ---------- */

export function onAnswer(packId: string, correct: boolean, first: boolean): number {
  const g = getGame();
  const gain = correct ? 10 + (first ? 5 : 0) : 2;
  award(gain);
  const d = (g.days[dayKey()] ??= emptyDay());
  d.a++;
  if (correct) d.c++;
  if (!d.t.includes(packId)) d.t.push(packId);
  g.stats.answers++;
  if (correct) g.stats.correct++;
  if (!g.stats.themes.includes(packId)) g.stats.themes.push(packId);
  g.recent = [...g.recent, correct ? 1 : 0].slice(-50);
  save();
  evaluate();
  return gain;
}

export function onSessionEnd(score: number, total: number): { xp: number; events: GameEvent[] } {
  const g = getGame();
  const perfect = score === total && total > 0;
  const xp = 20 + (perfect ? 30 : 0);
  award(xp);
  const d = (g.days[dayKey()] ??= emptyDay());
  d.s++;
  if (perfect) d.p++;
  g.stats.sessions++;
  if (perfect) g.stats.perfect++;
  const h = new Date().getHours();
  if (h < 8) g.stats.early = true;
  if (h >= 22) g.stats.late = true;
  save();
  return { xp, events: evaluate() };
}

export function onLevelChange(from: Cefr, to: Cefr) {
  if (cefrRank(to) > cefrRank(from)) {
    const g = getGame();
    g.stats.levelUps++;
    save();
    evaluate();
  }
}

/** Suggest a level change from recent results and mastery at the current level. */
export function levelAdvice(current: Cefr): { dir: 'up' | 'down'; to: Cefr; why: string } | null {
  const g = getGame();
  const i = cefrRank(current);
  const accuracy = g.recent.length >= 30 ? g.recent.reduce((a, b) => a + b, 0) / g.recent.length : null;

  let n = 0;
  let mastered = 0;
  for (const p of PACKS) {
    for (const it of p.items) {
      if (it.cefr !== current) continue;
      n++;
      if ((getCard(it.id)?.box ?? 0) >= MASTERED_BOX) mastered++;
    }
  }
  if (accuracy !== null && accuracy < 0.5 && i > 0) {
    return { dir: 'down', to: CEFR[i - 1], why: `Only ${Math.round(accuracy * 100)}% of your recent answers were right.` };
  }
  if (n >= 20 && mastered / n >= 0.6 && i < CEFR.length - 1) {
    return { dir: 'up', to: CEFR[i + 1], why: `You have mastered ${Math.round((mastered / n) * 100)}% of the ${current} items.` };
  }
  return null;
}
