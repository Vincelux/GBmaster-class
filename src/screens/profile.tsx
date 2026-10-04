import { useState } from 'preact/hooks';
import { BADGES, getGame, levelAdvice, masteredCounts, rankInfo } from '../game';
import { streak } from '../activity';
import { CEFR_INFO, type Cefr } from '../cefr';
import { getProfile, updateProfile } from '../profile';
import type { LocalProfile } from '../accounts';
import { AvatarGrid } from './players';
import { onLevelChange } from '../game';
import { toast } from '../toast';
import { LevelPicker } from './onboarding';

interface Props {
  player: LocalProfile;
  onBack: () => void;
  onSettings: () => void;
  onSwitch: () => void;
  onReset: () => void;
  onEdit: (patch: { name?: string; avatar?: string }) => void;
}

export function ProfileScreen({ player, onBack, onSettings, onSwitch, onReset, onEdit }: Props) {
  const [profile, setProfile] = useState(getProfile()!);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(player.name);
  const [changing, setChanging] = useState(false);

  const g = getGame();
  const rank = rankInfo();
  const { total: mastered } = masteredCounts();
  const advice = levelAdvice(profile.cefr);
  const unlocked = BADGES.filter((b) => g.badges[b.id]).length;

  const setLevel = (to: Cefr) => {
    const from = profile.cefr;
    if (to === from) return;
    updateProfile({ cefr: to });
    onLevelChange(from, to);
    setProfile(getProfile()!);
    toast('🎚', `Level set to ${to}`, 'Your progress is kept. Only new suggestions change.');
  };

  const saveName = (e: Event) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    updateProfile({ name: n });
    onEdit({ name: n });
    setProfile(getProfile()!);
    setEditing(false);
  };

  return (
    <main class="screen">
      <button class="back" onClick={onBack}>‹ Back</button>

      <header class="me">
        <span class="avatar big">{player.avatar}</span>
        {editing ? (
          <>
            <form class="inline-edit" onSubmit={saveName}>
              <input value={name} maxLength={30} autoFocus onInput={(e) => setName((e.target as HTMLInputElement).value)} />
              <button class="btn primary" type="submit">Save</button>
            </form>
            <AvatarGrid value={player.avatar} onChange={(a) => onEdit({ avatar: a })} />
          </>
        ) : (
          <>
            <h1>{player.name}</h1>
            <button class="link" onClick={() => setEditing(true)}>Edit name and avatar</button>
          </>
        )}
        <p class="rank-line"><b>{rank.name}</b> · {g.xp} XP</p>
        <div class="progress"><i style={{ width: `${rank.progress * 100}%` }} /></div>
        <p class="tiny">{rank.next ? `${rank.toNext} XP to ${rank.next}` : 'Top rank reached'}</p>
      </header>

      <section class="panel">
        <div class="row-between">
          <h2>My level</h2>
          <span class="level-pill">{profile.cefr}</span>
        </div>
        <p class="muted small">{CEFR_INFO[profile.cefr].name}: {CEFR_INFO[profile.cefr].blurb}</p>
        {advice && (
          <div class={`advice ${advice.dir}`}>
            <p>
              <b>{advice.dir === 'up' ? 'Ready for more?' : 'Take it easier?'}</b> {advice.why}
            </p>
            <button class="btn" onClick={() => setLevel(advice.to)}>
              {advice.dir === 'up' ? 'Move up to' : 'Move down to'} {advice.to}
            </button>
          </div>
        )}
        {changing ? (
          <>
            <LevelPicker value={profile.cefr} onChange={setLevel} />
            <button class="btn" onClick={() => setChanging(false)}>Done</button>
          </>
        ) : (
          <button class="btn" onClick={() => setChanging(true)}>Change my level</button>
        )}
        <p class="tiny">You can raise or lower your level whenever you like. Nothing you have learnt is lost.</p>
      </section>

      <section class="stats four">
        <div><b>{streak()}</b><span>day streak</span></div>
        <div><b>{mastered}</b><span>mastered</span></div>
        <div><b>{g.stats.sessions}</b><span>sessions</span></div>
        <div><b>{g.stats.answers ? Math.round((g.stats.correct / g.stats.answers) * 100) : 0}%</b><span>accuracy</span></div>
      </section>

      <section class="panel">
        <div class="row-between">
          <h2>Badges</h2>
          <span class="tiny">{unlocked} / {BADGES.length}</span>
        </div>
        <div class="badges">
          {BADGES.map((b) => (
            <div class={g.badges[b.id] ? 'medal on' : 'medal'} title={b.desc}>
              <span class="medal-icon">{g.badges[b.id] ? b.icon : '🔒'}</span>
              <strong>{b.title}</strong>
              <small>{b.desc}</small>
            </div>
          ))}
        </div>
      </section>

      <section class="panel">
        <h2>Player</h2>
        <p class="muted small">Your progress is stored on this device only.</p>
        <button class="btn" onClick={onSwitch}>🔄 Switch player</button>
        <button class="btn" onClick={onSettings}>Settings: goal, reminder, audio</button>
        <button
          class="btn danger"
          onClick={() => {
            if (confirm('Erase all your progress, XP and badges? Your profile is kept.')) onReset();
          }}
        >
          Reset my progress
        </button>
      </section>
    </main>
  );
}
