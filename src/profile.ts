import { type Cefr } from './cefr';
import { onReset, read, write } from './store';

export interface Profile {
  name: string;
  cefr: Cefr;
  createdAt: number;
  updatedAt: number;
}

let cache: Profile | null | undefined;
onReset(() => (cache = undefined));

export function getProfile(): Profile | null {
  if (cache === undefined) cache = read<Profile | null>('profile', null);
  return cache;
}

export function createProfile(name: string, cefr: Cefr) {
  const now = Date.now();
  cache = { name: name.trim() || 'Learner', cefr, createdAt: now, updatedAt: now };
  write('profile', cache);
}

/** Changing the level never touches progress: it only changes what is offered. */
export function updateProfile(patch: Partial<Pick<Profile, 'name' | 'cefr'>>) {
  const cur = getProfile();
  if (!cur) return;
  cache = { ...cur, ...patch, updatedAt: Date.now() };
  write('profile', cache);
}
