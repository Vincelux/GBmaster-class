export type Mode = 'flip' | 'choice' | 'type' | 'cloze';

export interface VerbItem {
  id: string;
  base: string;
  past: string[];
  pp: string[];
  fr: string;
  tip?: string;
}

export interface VocabItem {
  id: string;
  term: string;
  fr: string;
  def: string;
  /** Example sentence; the target expression is wrapped in {braces}. */
  example: string;
}

interface PackBase {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  modes: Mode[];
}
export interface VerbPack extends PackBase {
  kind: 'verbs';
  items: VerbItem[];
}
export interface VocabPack extends PackBase {
  kind: 'vocab';
  items: VocabItem[];
}
export type Pack = VerbPack | VocabPack;
export type Item = VerbItem | VocabItem;
