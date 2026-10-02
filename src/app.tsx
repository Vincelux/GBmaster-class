import { useState } from 'preact/hooks';
import type { Mode, Pack } from './types';
import { PACKS } from './data';
import { overall, packStats } from './srs';
import { Session } from './screens/session';
import { Settings } from './screens/settings';
import { getSettings, goalReached, streak, todayCount } from './activity';

type View =
  | { name: 'home' }
  | { name: 'settings' }
  | { name: 'pack'; pack: Pack }
  | { name: 'session'; pack: Pack; mode: Mode };

const MODE_INFO: Record<Mode, { label: string; hint: string }> = {
  flip: { label: 'Flashcards', hint: 'Recall, then check yourself' },
  choice: { label: 'Multiple choice', hint: 'Pick the right answer' },
  type: { label: 'Type it', hint: 'Write the forms from memory' },
  cloze: { label: 'In context', hint: 'Fill the gap in a real sentence' },
};

export function App() {
  const [view, setView] = useState<View>({ name: 'home' });
  const home = () => setView({ name: 'home' });

  if (view.name === 'settings') return <Settings onBack={home} />;

  if (view.name === 'session') {
    return (
      <Session
        pack={view.pack}
        mode={view.mode}
        onExit={() => setView({ name: 'pack', pack: view.pack })}
      />
    );
  }

  if (view.name === 'pack') {
    const { pack } = view;
    const s = packStats(pack.items);
    return (
      <main class="screen">
        <button class="back" onClick={home}>‹ Themes</button>
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
        <h2 class="section">Choose a training mode</h2>
        <div class="list">
          {pack.modes.map((m) => (
            <button class="row" onClick={() => setView({ name: 'session', pack, mode: m })}>
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

  const o = overall(PACKS.map((p) => p.items));
  const pct = o.total ? Math.round((o.mastered / o.total) * 100) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const goal = getSettings().goal;
  const today = Math.min(todayCount(), goal);
  const days = streak();
  const reached = goalReached();

  return (
    <main class="screen">
      <header class="hero">
        <div class="hero-top">
          <p class="eyebrow">GB Master Class</p>
          <button class="icon-btn" aria-label="Settings" onClick={() => setView({ name: 'settings' })}>⚙</button>
        </div>
        <h1>{greeting}.</h1>
        <p class="muted">
          {o.due > 0 ? `${o.due} item${o.due > 1 ? 's' : ''} ready for review today.` : 'Nothing overdue. Learn something new?'}
        </p>

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

        <p class="tiny">{o.mastered} of {o.total} items mastered · {pct}%</p>
      </header>

      <h2 class="section">Your themes</h2>
      <div class="list">
        {PACKS.map((p) => {
          const s = packStats(p.items);
          return (
            <button class="card" onClick={() => setView({ name: 'pack', pack: p })}>
              <span class="badge">{p.icon}</span>
              <span class="grow">
                <strong>{p.title}</strong>
                <small>{p.subtitle}</small>
                <span class="mini"><i style={{ width: `${(s.mastered / s.total) * 100}%` }} /></span>
              </span>
              <span class="count">{s.due > 0 ? <em>{s.due}</em> : null}<small>{s.total}</small></span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
