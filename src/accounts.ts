// Device-only profiles, used when no cloud service is configured.
// No password: these simply keep several people's progress apart on one device.

export interface LocalProfile {
  id: string;
  name: string;
}

const LIST = 'gbm.profiles';
const CURRENT = 'gbm.currentProfile';

export function listLocalProfiles(): LocalProfile[] {
  try {
    return JSON.parse(localStorage.getItem(LIST) || '[]');
  } catch {
    return [];
  }
}
const saveList = (l: LocalProfile[]) => localStorage.setItem(LIST, JSON.stringify(l));

export function currentLocalProfile(): string | null {
  const id = localStorage.getItem(CURRENT);
  return id && listLocalProfiles().some((p) => p.id === id) ? id : null;
}
export const setCurrentLocalProfile = (id: string | null) =>
  id ? localStorage.setItem(CURRENT, id) : localStorage.removeItem(CURRENT);

export function addLocalProfile(name: string): LocalProfile {
  const p = { id: 'p' + Date.now().toString(36), name: name.trim() || 'Learner' };
  saveList([...listLocalProfiles(), p]);
  return p;
}

export function renameLocalProfile(id: string, name: string) {
  saveList(listLocalProfiles().map((p) => (p.id === id ? { ...p, name } : p)));
}

export function removeLocalProfile(id: string) {
  saveList(listLocalProfiles().filter((p) => p.id !== id));
  Object.keys(localStorage)
    .filter((k) => k.startsWith(`gbm.${id}.`))
    .forEach((k) => localStorage.removeItem(k));
  if (localStorage.getItem(CURRENT) === id) localStorage.removeItem(CURRENT);
}
