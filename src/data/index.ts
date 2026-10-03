import type { Pack, VerbItem, VocabItem } from '../types';
import { ESSENTIAL, INTERMEDIATE, VERBS } from './verbs';
import { LEGAL } from './legal';
import { FINANCE } from './finance';
import { BUSINESS } from './business';
import { PHRASAL } from './phrasal';
import { FALSE_FRIENDS } from './falsefriends';
import { TECH } from './tech';
import { MARKETING } from './marketing';
import { HR } from './hr';
import { MEDICAL } from './medical';

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
  level: ESSENTIAL.has(base) ? 1 : INTERMEDIATE.has(base) ? 2 : 3,
}));

// To add a theme: create a data file and register a pack here.
export const PACKS: Pack[] = [
  {
    id: 'verbs',
    kind: 'verbs',
    title: 'Irregular verbs',
    subtitle: 'Des verbes de base aux plus rares, par niveaux',
    icon: '↺',
    group: 'Language',
    modes: ['flip', 'choice', 'type'],
    items: verbItems,
  },
  {
    id: 'legal',
    kind: 'vocab',
    title: 'Legal English',
    subtitle: 'Contrats, contentieux, procédure',
    icon: '⚖',
    group: 'Professional',
    modes: ['flip', 'choice', 'cloze'],
    items: vocab('legal', LEGAL),
  },
  {
    id: 'finance',
    kind: 'vocab',
    title: 'Finance',
    subtitle: 'Marchés, comptabilité, investissement',
    icon: '£',
    group: 'Professional',
    modes: ['flip', 'choice', 'cloze'],
    items: vocab('finance', FINANCE),
  },
  {
    id: 'business',
    kind: 'vocab',
    title: 'Business conversation',
    subtitle: 'Réunions, e-mails, expressions du quotidien pro',
    icon: '☕',
    group: 'Professional',
    modes: ['flip', 'choice', 'cloze'],
    items: vocab('business', BUSINESS),
  },
  {
    id: 'phrasal',
    kind: 'vocab',
    title: 'Phrasal verbs',
    subtitle: 'Les verbes à particule du quotidien professionnel',
    icon: '↗',
    group: 'Language',
    modes: ['flip', 'choice', 'cloze'],
    items: vocab('phrasal', PHRASAL),
  },
  {
    id: 'falsefriends',
    kind: 'vocab',
    title: 'False friends',
    subtitle: 'Les faux amis français / anglais',
    icon: '≠',
    group: 'Language',
    modes: ['flip', 'choice', 'cloze'],
    items: vocab('falsefriends', FALSE_FRIENDS),
  },
  {
    id: 'tech',
    kind: 'vocab',
    title: 'Tech & IT',
    subtitle: 'Logiciel, cloud, sécurité, IA',
    icon: '</>',
    group: 'Professional',
    modes: ['flip', 'choice', 'cloze'],
    items: vocab('tech', TECH),
  },
  {
    id: 'marketing',
    kind: 'vocab',
    title: 'Marketing',
    subtitle: 'Marque, digital, vente, communication',
    icon: '◎',
    group: 'Professional',
    modes: ['flip', 'choice', 'cloze'],
    items: vocab('marketing', MARKETING),
  },
  {
    id: 'hr',
    kind: 'vocab',
    title: 'Human resources',
    subtitle: 'Recrutement, contrats, carrière, relations sociales',
    icon: '☺',
    group: 'Professional',
    modes: ['flip', 'choice', 'cloze'],
    items: vocab('hr', HR),
  },
  {
    id: 'medical',
    kind: 'vocab',
    title: 'Medical English',
    subtitle: 'Symptômes, soins, hôpital, traitements',
    icon: '✚',
    group: 'Professional',
    modes: ['flip', 'choice', 'cloze'],
    items: vocab('medical', MEDICAL),
  },
];
