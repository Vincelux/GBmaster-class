import type { CloudBackend } from './types';

export type { CloudBackend, CloudUser } from './types';

/** The cloud service is optional: without configuration the app runs with
 *  profiles stored on the device only. */
export async function getCloudBackend(): Promise<CloudBackend | null> {
  const env = import.meta.env;
  if (__FAKE_BACKEND__) return (await import('./fake')).fake;
  if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
    return (await import('./supabase')).createSupabaseBackend(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  }
  return null;
}
