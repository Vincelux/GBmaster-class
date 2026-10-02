import { useState } from 'preact/hooks';
import { audioSupported, speak } from '../audio';
import { getSettings, reminderIcs, setSettings } from '../activity';

export function Settings({ onBack }: { onBack: () => void }) {
  const [s, setS] = useState(getSettings());
  const update = (patch: Partial<typeof s>) => {
    setSettings(patch);
    setS({ ...s, ...patch });
  };

  const downloadReminder = () => {
    const ics = reminderIcs(s.reminder, location.href.split('#')[0]);
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gb-master-class-reminder.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  return (
    <main class="screen">
      <button class="back" onClick={onBack}>‹ Back</button>
      <h1 class="page-title">Settings</h1>

      <section class="panel">
        <h2>Daily goal</h2>
        <p class="muted small">Answers per day to keep your streak alive.</p>
        <div class="segmented">
          {[10, 20, 30].map((g) => (
            <button class={s.goal === g ? 'on' : ''} onClick={() => update({ goal: g })}>{g}</button>
          ))}
        </div>
      </section>

      <section class="panel">
        <h2>Daily reminder</h2>
        <p class="muted small">
          Add a repeating event to your phone's calendar. It rings on time even when the app is closed.
        </p>
        <label class="inline">
          Time
          <input type="time" value={s.reminder} onInput={(e) => update({ reminder: (e.target as HTMLInputElement).value })} />
        </label>
        <button class="btn primary" onClick={downloadReminder}>Add to my calendar</button>
      </section>

      <section class="panel">
        <h2>Audio</h2>
        {audioSupported ? (
          <>
            <label class="switch">
              <span>Play pronunciation after each answer</span>
              <input type="checkbox" checked={s.autoplay} onChange={(e) => update({ autoplay: (e.target as HTMLInputElement).checked })} />
            </label>
            <button class="btn" onClick={() => speak('Thoroughly, although, rough. The quick brown fox jumped over the lazy dog.')}>
              🔊 Test the voice
            </button>
            <p class="muted small">British English is used when your device has a voice for it.</p>
          </>
        ) : (
          <p class="muted small">Speech synthesis isn't available in this browser.</p>
        )}
      </section>
    </main>
  );
}
