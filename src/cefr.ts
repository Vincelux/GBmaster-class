// Common European Framework of Reference (CEFR) levels.

export const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type Cefr = (typeof CEFR)[number];

export const rank = (l: Cefr): number => CEFR.indexOf(l);

export const CEFR_INFO: Record<Cefr, { name: string; blurb: string }> = {
  A1: { name: 'Beginner', blurb: 'I understand and use very simple expressions.' },
  A2: { name: 'Elementary', blurb: 'I can handle everyday, familiar situations.' },
  B1: { name: 'Intermediate', blurb: "I'm independent in most travel and work situations." },
  B2: { name: 'Upper-intermediate', blurb: 'I converse fluently and understand complex texts.' },
  C1: { name: 'Advanced', blurb: "I express myself spontaneously and with nuance, even in demanding professional settings." },
  C2: { name: 'Mastery', blurb: 'I command the language like a highly educated speaker, subtleties included.' },
};

export const BANDS = { A: ['A1', 'A2'], B: ['B1', 'B2'], C: ['C1', 'C2'] } as const;
