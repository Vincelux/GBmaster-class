import type { Pack, VerbItem, VocabItem } from '../types';
import { VERBS } from './verbs';
import { LEGAL } from './legal';
import { FINANCE } from './finance';
import { BUSINESS } from './business';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const split = (s: string) => s.split('/').map((x) => x.trim());

function vocab(packId: string, rows: [string, string, string, string][]): VocabItem[] {
  return rows.map(([term, fr, def, example]) => ({ id: `${packId}:${slug(term)}`, term, fr, def, example }));
}

const verbItems: VerbItem[] = VERBS.map(([base, past, pp, fr, tip]) => ({
  id: `verbs:${base}`,
  base,
  past: split(past),
  pp: split(pp),
  fr,
  tip,
}));

// To add a theme: create a data file and register a pack here.
export const PACKS: Pack[] = [
  {
    id: 'verbs',
    kind: 'verbs',
    title: 'Irregular verbs',
    subtitle: 'Les verbes qui font trébucher, même à haut niveau',
    icon: '↺',
    modes: ['flip', 'choice', 'type'],
    items: verbItems,
  },
  {
    id: 'legal',
    kind: 'vocab',
    title: 'Legal English',
    subtitle: 'Contrats, contentieux, procédure',
    icon: '⚖',
    modes: ['flip', 'choice', 'cloze'],
    items: vocab('legal', LEGAL),
  },
  {
    id: 'finance',
    kind: 'vocab',
    title: 'Finance',
    subtitle: 'Marchés, comptabilité, investissement',
    icon: '£',
    modes: ['flip', 'choice', 'cloze'],
    items: vocab('finance', FINANCE),
  },
  {
    id: 'business',
    kind: 'vocab',
    title: 'Business conversation',
    subtitle: 'Réunions, e-mails, expressions du quotidien pro',
    icon: '☕',
    modes: ['flip', 'choice', 'cloze'],
    items: vocab('business', BUSINESS),
  },
];
