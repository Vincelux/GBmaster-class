import { createClient } from '@supabase/supabase-js';
import type { Snapshot } from '../store';
import type { CloudBackend, CloudUser } from './types';

const toUser = (u: { id: string; email?: string | null }): CloudUser => ({ id: u.id, email: u.email ?? '' });

export function createSupabaseBackend(url: string, anonKey: string): CloudBackend {
  const sb = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  return {
    async init() {
      const { data } = await sb.auth.getSession();
      return data.session ? toUser(data.session.user) : null;
    },
    async signUp(email, password) {
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw error;
      return { user: data.session && data.user ? toUser(data.user) : null, needsConfirmation: !data.session };
    },
    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return toUser(data.user);
    },
    async signOut() {
      await sb.auth.signOut();
    },
    async resetPassword(email) {
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: location.origin + location.pathname,
      });
      if (error) throw error;
    },
    onRecovery(cb) {
      sb.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') cb();
      });
    },
    async updatePassword(password) {
      const { error } = await sb.auth.updateUser({ password });
      if (error) throw error;
    },
    async pull(user) {
      const { data, error } = await sb.from('user_state').select('state').eq('user_id', user.id).maybeSingle();
      if (error) throw error;
      return (data?.state as Snapshot | undefined) ?? null;
    },
    async push(user, snapshot) {
      const { error } = await sb
        .from('user_state')
        .upsert({ user_id: user.id, state: snapshot, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
  };
}
