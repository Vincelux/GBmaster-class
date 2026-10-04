// In-browser stand-in for the cloud service, used only by automated tests
// (build with VITE_BACKEND=fake). It is removed from normal builds.
import type { Snapshot } from '../store';
import type { CloudBackend, CloudUser } from './types';

const get = <T,>(k: string, d: T): T => {
  try {
    return JSON.parse(localStorage.getItem(k) || 'null') ?? d;
  } catch {
    return d;
  }
};
const set = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));
const wait = () => new Promise((r) => setTimeout(r, 30));

export const fake: CloudBackend = {
  async init() {
    await wait();
    return get<CloudUser | null>('fake.session', null);
  },
  async signUp(email, password) {
    await wait();
    const users = get<Record<string, { id: string; pw: string }>>('fake.users', {});
    if (users[email]) throw new Error('User already registered');
    if (password.length < 6) throw new Error('Password should be at least 6 characters');
    users[email] = { id: 'u_' + Math.random().toString(36).slice(2, 10), pw: password };
    set('fake.users', users);
    const user = { id: users[email].id, email };
    set('fake.session', user);
    return { user, needsConfirmation: false };
  },
  async signIn(email, password) {
    await wait();
    const u = get<Record<string, { id: string; pw: string }>>('fake.users', {})[email];
    if (!u || u.pw !== password) throw new Error('Invalid login credentials');
    const user = { id: u.id, email };
    set('fake.session', user);
    return user;
  },
  async signOut() {
    localStorage.removeItem('fake.session');
  },
  async resetPassword() {
    await wait();
  },
  onRecovery() {},
  async updatePassword() {},
  async pull(user) {
    await wait();
    return get<Record<string, Snapshot>>('fake.cloud', {})[user.id] ?? null;
  },
  async push(user, snapshot) {
    await wait();
    const all = get<Record<string, Snapshot>>('fake.cloud', {});
    all[user.id] = snapshot;
    set('fake.cloud', all);
  },
};
