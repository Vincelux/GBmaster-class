import { useState } from 'preact/hooks';
import type { CloudBackend, CloudUser } from '../backend';
import { addLocalProfile, listLocalProfiles, type LocalProfile } from '../accounts';

const friendly = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  if (/invalid login/i.test(m)) return 'Incorrect e-mail or password.';
  if (/already registered/i.test(m)) return 'An account already exists with this e-mail. Please sign in.';
  if (/at least 6/i.test(m)) return 'The password must be at least 6 characters long.';
  if (/rate limit/i.test(m)) return 'Too many attempts. Please try again in a few minutes.';
  if (/fetch|network/i.test(m)) return 'Could not connect. Please check your network.';
  return m;
};

function Brand() {
  return (
    <header class="brand">
      <span class="badge big">GB</span>
      <h1>GB Master Class</h1>
      <p class="muted">Advanced English, one short session at a time.</p>
    </header>
  );
}

/* ---------- cloud account ---------- */

export function AuthScreen({ backend, onUser }: { backend: CloudBackend; onUser: (u: CloudUser) => void }) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e: Event) => {
    e.preventDefault();
    if (busy) return;
    setErr('');
    setInfo('');
    setBusy(true);
    try {
      const mail = email.trim().toLowerCase();
      if (mode === 'reset') {
        await backend.resetPassword(mail);
        setInfo('If an account exists, a reset e-mail has just been sent.');
      } else if (mode === 'signup') {
        const r = await backend.signUp(mail, pw);
        if (r.user) onUser(r.user);
        else setInfo('Account created. Confirm your address using the e-mail we sent, then sign in.');
        if (!r.user) setMode('signin');
      } else {
        onUser(await backend.signIn(mail, pw));
      }
    } catch (x) {
      setErr(friendly(x));
    } finally {
      setBusy(false);
    }
  };

  const title = mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create an account' : 'Forgot your password?';

  return (
    <main class="screen">
      <Brand />
      <form class="panel" onSubmit={submit}>
        <h2>{title}</h2>
        <label class="field">
          E-mail
          <input type="email" autoComplete="email" required value={email}
            onInput={(e) => setEmail((e.target as HTMLInputElement).value)} />
        </label>
        {mode !== 'reset' && (
          <label class="field">
            Password
            <input type="password" required minLength={mode === 'signup' ? 6 : undefined}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={pw}
              onInput={(e) => setPw((e.target as HTMLInputElement).value)} />
          </label>
        )}
        {err && <p class="notice bad" role="alert">{err}</p>}
        {info && <p class="notice good">{info}</p>}
        <button class="btn primary" type="submit" disabled={busy}>
          {busy ? '…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create my account' : 'Send the link'}
        </button>
        <div class="links">
          {mode !== 'signin' && <button type="button" class="link" onClick={() => setMode('signin')}>I already have an account</button>}
          {mode === 'signin' && <button type="button" class="link" onClick={() => setMode('signup')}>Create an account</button>}
          {mode === 'signin' && <button type="button" class="link" onClick={() => setMode('reset')}>Forgot your password?</button>}
        </div>
      </form>
      <p class="tiny center-text">Your progress is saved online and follows you across all your devices.</p>
    </main>
  );
}

export function RecoveryScreen({ backend, onDone }: { backend: CloudBackend; onDone: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: Event) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await backend.updatePassword(pw);
      onDone();
    } catch (x) {
      setErr(friendly(x));
    } finally {
      setBusy(false);
    }
  };
  return (
    <main class="screen">
      <Brand />
      <form class="panel" onSubmit={submit}>
        <h2>New password</h2>
        <label class="field">
          Choose a new password
          <input type="password" required minLength={6} autoComplete="new-password" value={pw}
            onInput={(e) => setPw((e.target as HTMLInputElement).value)} />
        </label>
        {err && <p class="notice bad" role="alert">{err}</p>}
        <button class="btn primary" type="submit" disabled={busy}>Save</button>
      </form>
    </main>
  );
}

/* ---------- device-only profiles ---------- */

export function LocalPicker({
  onPick, onCreate,
}: { onPick: (p: LocalProfile) => void; onCreate: (p: LocalProfile) => void }) {
  const profiles = listLocalProfiles();
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(profiles.length === 0);

  const create = (e: Event) => {
    e.preventDefault();
    onCreate(addLocalProfile(name));
  };

  return (
    <main class="screen">
      <Brand />
      {profiles.length > 0 && (
        <section class="list">
          <h2 class="section">Who is learning?</h2>
          {profiles.map((p) => (
            <button class="card" onClick={() => onPick(p)}>
              <span class="avatar">{p.name.slice(0, 1).toUpperCase()}</span>
              <span class="grow"><strong>{p.name}</strong></span>
              <span class="chev">›</span>
            </button>
          ))}
        </section>
      )}
      {adding ? (
        <form class="panel" onSubmit={create}>
          <h2>New profile</h2>
          <label class="field">
            First name or nickname
            <input value={name} required maxLength={30} autoFocus
              onInput={(e) => setName((e.target as HTMLInputElement).value)} />
          </label>
          <button class="btn primary" type="submit">Continue</button>
        </form>
      ) : (
        <button class="btn" onClick={() => setAdding(true)}>+ New profile</button>
      )}
      <p class="tiny center-text">These profiles stay on this device (no password).</p>
    </main>
  );
}
