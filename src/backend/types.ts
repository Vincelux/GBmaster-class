import type { Snapshot } from '../store';

export interface CloudUser {
  id: string;
  email: string;
}

export interface CloudBackend {
  /** Restore a previous session, if any. */
  init(): Promise<CloudUser | null>;
  signUp(email: string, password: string): Promise<{ user: CloudUser | null; needsConfirmation: boolean }>;
  signIn(email: string, password: string): Promise<CloudUser>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  /** Called when the user arrives from a password-recovery e-mail link. */
  onRecovery(cb: () => void): void;
  updatePassword(password: string): Promise<void>;
  pull(user: CloudUser): Promise<Snapshot | null>;
  push(user: CloudUser, snapshot: Snapshot): Promise<void>;
}
