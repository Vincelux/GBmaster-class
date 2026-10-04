// Players on this device. There are no accounts: everything stays in the browser.

export interface LocalProfile {
  id: string;
  name: string;
  avatar: string;
}

export const AVATARS = ['🦉', '🦊', '🦁', '🐺', '🦅', '🐬', '🐘', '🦋', '🌿', '🧭', '☕', '🎧', '🚀', '⚓', '🎯', '🌍'];

const LIST = 'gbm.profiles';
const CURRENT = 'gbm.currentProfile';

export function listLocalProfiles(): LocalProfile[] {
  try {
    const l = JSON.parse(localStorage.getItem(LIST) || '[]') as LocalProfile[];
    return l.map((p) => ({ ...p, avatar: p.avatar || AVATARS[0] }));
  } catch {
    return [];
  }
}
const saveList = (l: LocalProfile[]) => localStorage.setItem(LIST, JSON.stringify(l));

export function currentLocalProfile(): LocalProfile | null {
  const id = localStorage.getItem(CURRENT);
  return listLocalProfiles().find((p) => p.id === id) ?? null;
}
export const setCurrentLocalProfile = (id: string | null) =>
  id ? localStorage.setItem(CURRENT, id) : localStorage.removeItem(CURRENT);

export function addLocalProfile(name: string, avatar: string): LocalProfile {
  const p = { id: 'p' + Date.now().toString(36), name: name.trim() || 'Learner', avatar };
  saveList([...listLocalProfiles(), p]);
  return p;
}

export function updateLocalProfile(id: string, patch: Partial<Pick<LocalProfile, 'name' | 'avatar'>>) {
  saveList(listLocalProfiles().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

/** Deletes the player and everything they stored. */
export function removeLocalProfile(id: string) {
  saveList(listLocalProfiles().filter((p) => p.id !== id));
  Object.keys(localStorage)
    .filter((k) => k.startsWith(`gbm.${id}.`))
    .forEach((k) => localStorage.removeItem(k));
  if (localStorage.getItem(CURRENT) === id) localStorage.removeItem(CURRENT);
}
