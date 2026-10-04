import { useState } from 'preact/hooks';
import type { Mode, Pack } from '../types';
import { PACKS } from '../data';
import { overall, packStats } from '../srs';
import { getSettings, goalReached, streak, todayCount } from '../activity';
import { challenges, getGame, levelAdvice, rankInfo } from '../game';
import { BANDS, rank, type Cefr } from '../cefr';
import { getProfile } from '../profile';

/* ---------- level scope ---------- */

export type Scope = 'mine' | 'A' | 'B' | 'C' | 'all';

/** Which items of a pack are offered, given the learner's level. */
export function withScope(pack: Pack, scope: Scope, mine: Cefr): Pack {
  if (scope === 'all') return pack;
  const keep = (c: Cefr) =>
    scope === 'mine' ? Math.abs(rank(c) - rank(mine)) <= 1 : (BANDS[scope] as readonly string[]).includes(c);
  return { ...pack, items: pack.items.filter((it) => keep(it.cefr)) } as Pack;
}

const SCOPES: { id: Scope; label: string }[] = [
  { id: 'mine', label: 'My level' },
  { id: 'A', label: 'A' },
  { id: 'B', label: 'B' },
  { id: 'C', label: 'C' },
  { id: 'all', label: 'All' },
];

const MODE_INFO: Record<Mode, { label: string; hint: string }> = {
  flip: { label: 'Flashcards', hint: 'Recall, then check yourself' },
  choice: { label: 'Multiple choice', hint: 'Pick the right answer' },
  type: { label: 'Type it', hint: 'Write the forms from memory' },
  cloze: { label: 'In context', hint: 'Fill the gap in a real sentence' },
};

/* ---------- home ---------- */

interface HomeProps {
  onOpenPack: (p: Pack) => void;
  onProfile: () => void;
  onSettings: () => void;
}

export function Home({ onOpenPack, onProfile, onSettings }: HomeProps) {
  const profile = getProfile()!;
  const o = overall(PACKS.map((p) => p.items));
  const pct = o.total ? Math.round((o.mastered / o.total) * 100) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const goal = getSettings().goal;
  const today = Math.min(todayCount(), goal);
  const days = streak();
  const reached = goalReached();
  const g = getGame();
  const rk = rankInfo();
  const list = challenges();
  const advice = levelAdvice(profile.cefr);

  return (
    <main class="screen">
      <header class="hero">
        <div class="hero-top">
          <p class="eyebrow">GB Master Class</p>
          <div class="hero-actions">
            <button class="icon-btn" aria-label="Settings" onClick={onSettings}>⚙</button>
            <button class="avatar" aria-label="My profile" onClick={onProfile}>{profile.name.slice(0, 1).toUpperCase()}</button>
          </div>
        </div>
        <h1>{greeting}, {profile.name}.</h1>
        <p class="muted">
          {o.due > 0 ? `${o.due} item${o.due > 1 ? 's' : ''} ready for review today.` : 'Nothing overdue. Learn something new?'}
        </p>

        <button class="rank-card" onClick={onProfile}>
          <span class="level-pill">{profile.cefr}</span>
          <span class="grow">
            <b>{rk.name}</b>
            <span class="tiny"> · {g.xp} XP</span>
            <span class="progress"><i style={{ width: `${rk.progress * 100}%` }} /></span>
          </span>
          <span class="chev">›</span>
        </button>

        <div class="today">
          <div class="streak" title="Days in a row with your daily goal met">
            <b>{days}</b>
            <span>day streak</span>
          </div>
          <div class="goal">
            <p>
              {reached
                ? 'Daily goal reached. Well done.'
                : days > 0
                  ? `${goal - today} more to keep your streak alive`
                  : `${goal - today} answers to start a streak`}
            </p>
            <div class="progress"><i style={{ width: `${(today / goal) * 100}%` }} /></div>
            <p class="tiny">{today} / {goal} today</p>
          </div>
        </div>
      </header>

      {advice && (
        <button class={`advice ${advice.dir}`} onClick={onProfile}>
          <p><b>{advice.dir === 'up' ? 'Ready for more?' : 'Take it easier?'}</b> {advice.why} Tap to review your level.</p>
        </button>
      )}

      <section class="panel challenges">
        <h2>Challenges</h2>
        {list.map((c) => (
          <div class={c.done ? 'challenge done' : 'challenge'}>
            <span class="check">{c.done ? '✓' : c.weekly ? '★' : '○'}</span>
            <span class="grow">
              <strong>{c.title}</strong>
              <span class="mini"><i style={{ width: `${(c.progress / c.goal) * 100}%` }} /></span>
            </span>
            <span class="reward">{c.done ? 'Done' : `+${c.xp} XP`}</span>
          </div>
        ))}
        <p class="tiny">{o.mastered} of {o.total} items mastered · {pct}%</p>
      </section>

      {[...new Set(PACKS.map((p) => p.group))].map((group) => (
        <section key={group} class="group">
          <h2 class="section">{group}</h2>
          <div class="list">
            {PACKS.filter((p) => p.group === group).map((p) => {
              const s = packStats(withScope(p, 'mine', profile.cefr).items);
              return (
                <button class="card" onClick={() => onOpenPack(p)}>
                  <span class="badge">{p.icon}</span>
                  <span class="grow">
                    <strong>{p.title}</strong>
                    <small>{p.subtitle}</small>
                    <span class="mini"><i style={{ width: `${s.total ? (s.mastered / s.total) * 100 : 0}%` }} /></span>
                  </span>
                  <span class="count">{s.due > 0 ? <em>{s.due}</em> : null}<small>{s.total}</small></span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}

/* ---------- theme page ---------- */

export function PackScreen({
  pack, onBack, onStart,
}: { pack: Pack; onBack: () => void; onStart: (mode: Mode, scope: Scope) => void }) {
  const mine = getProfile()!.cefr;
  const [scope, setScope] = useState<Scope>('mine');
  const s = packStats(withScope(pack, scope, mine).items);

  return (
    <main class="screen">
      <button class="back" onClick={onBack}>‹ Themes</button>
      <header class="pack-head">
        <span class="badge big">{pack.icon}</span>
        <h1>{pack.title}</h1>
        <p class="muted">{pack.subtitle}</p>
      </header>
      <div class="stats">
        <div><b>{s.due}</b><span>to review</span></div>
        <div><b>{s.fresh}</b><span>new</span></div>
        <div><b>{s.mastered}</b><span>mastered</span></div>
      </div>

      <h2 class="section">Difficulty</h2>
      <div class="chips" role="tablist">
        {SCOPES.map((c) => (
          <button
            role="tab"
            aria-selected={scope === c.id}
            class={scope === c.id ? 'chip on' : 'chip'}
            onClick={() => setScope(c.id)}
          >
            {c.id === 'mine' ? `My level · ${mine}` : c.label} <small>{withScope(pack, c.id, mine).items.length}</small>
          </button>
        ))}
      </div>
      <p class="tiny">
        “My level” offers {mine} items plus the level just below and above. New items always come from your level first.
      </p>

      <h2 class="section">Choose a training mode</h2>
      <div class="list">
        {pack.modes.map((m) => (
          <button class="row" disabled={s.total === 0} onClick={() => onStart(m, scope)}>
            <span>
              <strong>{MODE_INFO[m].label}</strong>
              <small>{MODE_INFO[m].hint}</small>
            </span>
            <span class="chev">›</span>
          </button>
        ))}
      </div>
    </main>
  );
}
