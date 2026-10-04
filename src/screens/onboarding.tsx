import { useState } from 'preact/hooks';
import { CEFR, CEFR_INFO, type Cefr } from '../cefr';

export function LevelPicker({ value, onChange }: { value: Cefr; onChange: (l: Cefr) => void }) {
  return (
    <div class="levels" role="radiogroup" aria-label="Level">
      {CEFR.map((l) => (
        <button
          type="button"
          role="radio"
          aria-checked={value === l}
          class={value === l ? 'level on' : 'level'}
          onClick={() => onChange(l)}
        >
          <b>{l}</b>
          <span>
            <strong>{CEFR_INFO[l].name}</strong>
            <small>{CEFR_INFO[l].blurb}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

export function Onboarding({
  initialName, onDone,
}: { initialName: string; onDone: (name: string, level: Cefr) => void }) {
  const [name, setName] = useState(initialName);
  const [level, setLevel] = useState<Cefr>('B2');

  return (
    <main class="screen">
      <header class="hero">
        <p class="eyebrow">Welcome</p>
        <h1>Let’s set up your path.</h1>
        <p class="muted">
          Pick the CEFR level that fits you. The content adapts to it, and you can change it at any time from your
          profile without losing any progress.
        </p>
      </header>
      <label class="field">
        What should we call you?
        <input value={name} maxLength={30} onInput={(e) => setName((e.target as HTMLInputElement).value)} />
      </label>
      <h2 class="section">Your level</h2>
      <LevelPicker value={level} onChange={setLevel} />
      <p class="tiny">Not sure? Start with B1 or B2: the app will suggest moving up or down based on your results.</p>
      <button class="btn primary" disabled={!name.trim()} onClick={() => onDone(name, level)}>
        Start
      </button>
    </main>
  );
}
