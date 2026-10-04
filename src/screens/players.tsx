import { useState } from 'preact/hooks';
import {
  addLocalProfile, AVATARS, listLocalProfiles, removeLocalProfile, type LocalProfile,
} from '../accounts';

export function AvatarGrid({ value, onChange }: { value: string; onChange: (a: string) => void }) {
  return (
    <div class="avatar-grid" role="radiogroup" aria-label="Avatar">
      {AVATARS.map((a) => (
        <button
          type="button"
          role="radio"
          aria-checked={value === a}
          aria-label={a}
          class={value === a ? 'avatar-opt on' : 'avatar-opt'}
          onClick={() => onChange(a)}
        >
          {a}
        </button>
      ))}
    </div>
  );
}

export function PlayerPicker({ onPick, onCreate }: { onPick: (p: LocalProfile) => void; onCreate: (p: LocalProfile) => void }) {
  const [profiles, setProfiles] = useState(listLocalProfiles());
  const [adding, setAdding] = useState(profiles.length === 0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  const create = (e: Event) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(addLocalProfile(name, avatar));
  };

  const remove = (p: LocalProfile) => {
    if (confirm(`Delete ${p.name} and all their progress? This cannot be undone.`)) {
      removeLocalProfile(p.id);
      const rest = listLocalProfiles();
      setProfiles(rest);
      if (rest.length === 0) setAdding(true);
    }
  };

  return (
    <main class="screen">
      <header class="brand">
        <span class="badge big">GB</span>
        <h1>GB Master Class</h1>
        <p class="muted">Advanced English, one short session at a time.</p>
      </header>

      {profiles.length > 0 && (
        <section class="list">
          <h2 class="section">Who is learning today?</h2>
          {profiles.map((p) => (
            <div class="player">
              <button class="card" onClick={() => onPick(p)}>
                <span class="avatar">{p.avatar}</span>
                <span class="grow"><strong>{p.name}</strong></span>
                <span class="chev">›</span>
              </button>
              <button class="trash" aria-label={`Delete ${p.name}`} onClick={() => remove(p)}>🗑</button>
            </div>
          ))}
        </section>
      )}

      {adding ? (
        <form class="panel" onSubmit={create}>
          <h2>{profiles.length ? 'New player' : 'Create your profile'}</h2>
          <label class="field">
            First name or nickname
            <input value={name} required maxLength={30} autoFocus onInput={(e) => setName((e.target as HTMLInputElement).value)} />
          </label>
          <div class="field">
            Choose an avatar
            <AvatarGrid value={avatar} onChange={setAvatar} />
          </div>
          <button class="btn primary" type="submit" disabled={!name.trim()}>Continue</button>
          {profiles.length > 0 && <button type="button" class="link" onClick={() => setAdding(false)}>Cancel</button>}
        </form>
      ) : (
        <button class="btn" onClick={() => setAdding(true)}>+ Add a player</button>
      )}
      <p class="tiny center-text">No account needed. Each player’s progress stays on this device.</p>
    </main>
  );
}
