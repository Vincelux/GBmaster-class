// Daily activity, streak and user settings (all local to the device).

const KEY = 'gbm.activity.v1';

export interface Settings {
  goal: number;
  autoplay: boolean;
  reminder: string; // HH:MM
}
interface State {
  counts: Record<string, number>;
  done: Record<string, true>;
  settings: Settings;
}

const DEFAULTS: Settings = { goal: 10, autoplay: false, reminder: '08:30' };
let state: State | null = null;

function load(): State {
  if (state) return state;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    state = {
      counts: raw.counts ?? {},
      done: raw.done ?? {},
      settings: { ...DEFAULTS, ...(raw.settings ?? {}) },
    };
  } catch {
    state = { counts: {}, done: {}, settings: { ...DEFAULTS } };
  }
  return state;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* in-memory only */
  }
}

const pad = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dayKey(d);
};

export const getSettings = () => load().settings;
export function setSettings(patch: Partial<Settings>) {
  const s = load();
  s.settings = { ...s.settings, ...patch };
  save();
}

export function bumpToday() {
  const s = load();
  const k = dayKey();
  s.counts[k] = (s.counts[k] ?? 0) + 1;
  if (s.counts[k] >= s.settings.goal) s.done[k] = true;
  save();
}

export const todayCount = () => load().counts[dayKey()] ?? 0;
export const goalReached = () => !!load().done[dayKey()];

/** Consecutive days with the daily goal met. Today only counts once done, but
 *  an unfinished today does not break a streak that was alive yesterday. */
export function streak(): number {
  const { done } = load();
  let i = done[daysAgo(0)] ? 0 : 1;
  let n = 0;
  while (done[daysAgo(i)]) {
    n++;
    i++;
  }
  return n;
}

export function reminderIcs(time: string, url: string): string {
  const [h, m] = time.split(':').map(Number);
  const start = new Date();
  start.setHours(h, m, 0, 0);
  if (start.getTime() < Date.now()) start.setDate(start.getDate() + 1);
  const end = new Date(start.getTime() + 10 * 60_000);
  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const summary = 'GB Master Class: your daily English practice';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GB Master Class//EN',
    'BEGIN:VEVENT',
    'UID:daily-practice@gb-master-class',
    `DTSTAMP:${now}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:${summary}`,
    `DESCRIPTION:Ten minutes keeps the streak alive. ${url}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${summary}`,
    'TRIGGER:PT0S',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
