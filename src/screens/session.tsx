import { useEffect, useMemo, useState } from 'preact/hooks';
import { Fragment } from 'preact';
import type { ComponentChildren } from 'preact';
import type { Item, Mode, Pack, VerbItem, VocabItem } from '../types';
import { pickSession, record, shuffle } from '../srs';
import { audioSupported, speak } from '../audio';
import { getSettings } from '../activity';
import { onAnswer, onSessionEnd, type GameEvent } from '../game';

const SESSION_SIZE = 10;

interface Props {
  pack: Pack;
  mode: Mode;
  onExit: () => void;
}

export function Session({ pack, mode, onExit }: Props) {
  const [round, setRound] = useState(0);
  const items = useMemo(() => pickSession<Item>(pack.items, SESSION_SIZE), [pack, round]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [summary, setSummary] = useState<{ xp: number; events: GameEvent[] } | null>(null);

  const answer = (ok: boolean) => {
    const { first } = record(items[idx].id, ok);
    setXp((x) => x + onAnswer(pack.id, ok, first));
    if (ok) setScore((s) => s + 1);
    setIdx((i) => i + 1);
  };

  // Close the session exactly once, when the last card has been answered.
  useEffect(() => {
    if (items.length > 0 && idx >= items.length && !summary) setSummary(onSessionEnd(score, items.length));
  }, [idx, items.length]);

  if (items.length === 0) {
    return (
      <main class="screen center">
        <p class="muted">Nothing to practise at this level yet.</p>
        <button class="btn" onClick={onExit}>Back</button>
      </main>
    );
  }

  if (idx >= items.length) {
    const pct = Math.round((score / items.length) * 100);
    const perfect = score === items.length;
    const total = xp + (summary?.xp ?? 0);
    return (
      <main class="screen center">
        {(perfect || (summary?.events.length ?? 0) > 0) && <Confetti />}
        <p class="eyebrow">Session complete</p>
        <div class="score">{score}<span>/{items.length}</span></div>
        <p class="muted">
          {perfect ? 'Flawless.' : pct >= 70 ? 'Solid work.' : 'Those will come back soon, which is the point.'}
        </p>
        <div class="xp-earned"><b>+{total} XP</b><span>{perfect ? 'incl. flawless bonus' : 'earned this session'}</span></div>
        {summary?.events.map((e) => (
          <div class="reward-row"><span>{e.icon}</span><span>{e.kind === 'badge' ? `Badge unlocked: ${e.title}` : e.title}</span>{e.xp && <b>+{e.xp}</b>}</div>
        ))}
        <div class="actions">
          <button class="btn primary" onClick={() => { setIdx(0); setScore(0); setXp(0); setSummary(null); setRound((r) => r + 1); }}>
            Another session
          </button>
          <button class="btn" onClick={onExit}>Done</button>
        </div>
      </main>
    );
  }

  const item = items[idx];
  const props = { onAnswer: answer };

  return (
    <main class="screen">
      <div class="topbar">
        <button class="back" onClick={onExit}>✕</button>
        <div class="progress thin"><i style={{ width: `${(idx / items.length) * 100}%` }} /></div>
        <span class="cefr-tag" title="Level of this item">{item.cefr}</span>
        <span class="tiny">{idx + 1}/{items.length}</span>
      </div>
      <Fragment key={item.id}>
      {pack.kind === 'verbs' ? (
        mode === 'flip' ? <VerbFlip item={item as VerbItem} {...props} /> :
        mode === 'type' ? <VerbType item={item as VerbItem} {...props} /> :
        <VerbChoice item={item as VerbItem} all={pack.items as VerbItem[]} {...props} />
      ) : (
        mode === 'flip' ? <VocabFlip item={item as unknown as VocabItem} {...props} /> :
        mode === 'cloze' ? <VocabCloze item={item as unknown as VocabItem} all={pack.items as VocabItem[]} {...props} /> :
        <VocabChoice item={item as unknown as VocabItem} all={pack.items as VocabItem[]} {...props} />
      )}
      </Fragment>
    </main>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div class="confetti" aria-hidden="true">
      {pieces.map((i) => (
        <i style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * 0.12}s`, background: ['#c9a24b', '#14213d', '#1f6f54', '#a3342b'][i % 4] }} />
      ))}
    </div>
  );
}

/* ---------- shared bits ---------- */

const join = (a: string[]) => a.join(' / ');
const verbForms = (v: VerbItem) => `${join(v.past)}  ·  ${join(v.pp)}`;
const strip = (s: string) => s.replace(/[{}]/g, '');
const clean = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');
const verbSay = (v: VerbItem) => `${v.base}. ${v.past.join(', or ')}. ${v.pp.join(', or ')}.`;
const vocabSay = (v: VocabItem) => `${v.term}. ${strip(v.example)}`;

function Speak({ text, label = 'Listen' }: { text: string; label?: string }) {
  if (!audioSupported) return null;
  return (
    <button type="button" class="speak" onClick={() => speak(text)}>
      <span aria-hidden="true">🔊</span> {label}
    </button>
  );
}

function useAutoplay(text: string | null) {
  useEffect(() => {
    if (text && getSettings().autoplay) speak(text);
  }, [text]);
}

function Highlighted({ text }: { text: string }) {
  const parts = text.split(/(\{[^}]+\})/g);
  return (
    <>
      {parts.map((p) => (p.startsWith('{') ? <mark>{p.slice(1, -1)}</mark> : p))}
    </>
  );
}

function Next({
  ok, onNext, say, children,
}: { ok: boolean; onNext: () => void; say?: string; children: ComponentChildren }) {
  useAutoplay(say ?? null);
  return (
    <div class={`feedback ${ok ? 'good' : 'bad'}`}>
      <p class="verdict">{ok ? 'Correct' : 'Not quite'}</p>
      {children}
      <button class="btn primary" autoFocus onClick={onNext}>Continue</button>
    </div>
  );
}

function VerbDetails({ v }: { v: VerbItem }) {
  return (
    <div class="detail">
      <p class="forms"><b>{v.base}</b> → {join(v.past)} → {join(v.pp)}</p>
      <p class="muted">{v.fr}</p>
      {v.tip && <p class="tip">{v.tip}</p>}
      <div class="speak-row"><Speak text={verbSay(v)} label="Pronunciation" /></div>
    </div>
  );
}

function VocabDetails({ v }: { v: VocabItem }) {
  return (
    <div class="detail">
      <p class="forms"><b>{v.term}</b> · {v.fr}</p>
      <p class="muted">{v.def}</p>
      <p class="example"><Highlighted text={v.example} /></p>
      <div class="speak-row">
        <Speak text={v.term} label="Word" />
        <Speak text={strip(v.example)} label="Sentence" />
      </div>
    </div>
  );
}

function Choices({
  options, picked, correct, onPick,
}: { options: string[]; picked: number | null; correct: number; onPick: (i: number) => void }) {
  return (
    <div class="options">
      {options.map((o, i) => {
        const state = picked === null ? '' : i === correct ? 'right' : i === picked ? 'wrong' : 'dim';
        return (
          <button class={`option ${state}`} disabled={picked !== null} onClick={() => onPick(i)}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

type P<T> = { item: T; onAnswer: (ok: boolean) => void };

/* ---------- flashcards ---------- */

function Flip({
  front, back, say, onAnswer,
}: { front: ComponentChildren; back: ComponentChildren; say: string; onAnswer: (ok: boolean) => void }) {
  const [shown, setShown] = useState(false);
  useAutoplay(shown ? say : null);
  return (
    <>
      <div class="prompt-card" onClick={() => setShown(true)}>{front}</div>
      {shown ? (
        <>
          {back}
          <div class="actions two">
            <button class="btn" onClick={() => onAnswer(false)}>Review again</button>
            <button class="btn primary" onClick={() => onAnswer(true)}>I knew it</button>
          </div>
        </>
      ) : (
        <div class="actions"><button class="btn primary" onClick={() => setShown(true)}>Show answer</button></div>
      )}
    </>
  );
}

function VerbFlip({ item, onAnswer }: P<VerbItem>) {
  return (
    <Flip
      onAnswer={onAnswer}
      say={verbSay(item)}
      front={<><span class="label">Infinitive</span><span class="big-word">to {item.base}</span></>}
      back={<VerbDetails v={item} />}
    />
  );
}

function VocabFlip({ item, onAnswer }: P<VocabItem>) {
  return (
    <Flip
      onAnswer={onAnswer}
      say={vocabSay(item)}
      front={<><span class="label">Define or translate</span><span class="big-word small">{item.term}</span></>}
      back={<VocabDetails v={item} />}
    />
  );
}

/* ---------- verbs: multiple choice ---------- */

function VerbChoice({ item, all, onAnswer }: P<VerbItem> & { all: VerbItem[] }) {
  const q = useMemo(() => {
    const label = (past: string, pp: string) => `${past}  ·  ${pp}`;
    const correct = verbForms(item);
    const p = item.past[0], pp = item.pp[0];
    const reg = item.base.endsWith('e') ? `${item.base}d` : `${item.base}ed`;
    const valid = new Set(item.past.flatMap((a) => item.pp.map((b) => label(a, b))));
    const cand = [label(p, p), label(pp, pp), label(pp, p), label(reg, reg), label(p, reg), label(reg, pp)]
      .filter((c) => !valid.has(c) && c !== correct);
    const others = shuffle(all.filter((v) => v.id !== item.id)).map((v) => label(v.past[0], v.pp[0]));
    const wrong = [...new Set([...shuffle([...new Set(cand)]).slice(0, 3), ...others])]
      .filter((c) => !valid.has(c))
      .slice(0, 3);
    const options = shuffle([correct, ...wrong]);
    return { options, correct: options.indexOf(correct) };
  }, [item.id]);
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <>
      <div class="prompt-card"><span class="label">Past simple · past participle</span><span class="big-word">to {item.base}</span></div>
      <Choices options={q.options} picked={picked} correct={q.correct} onPick={setPicked} />
      {picked !== null && (
        <Next ok={picked === q.correct} onNext={() => onAnswer(picked === q.correct)} say={verbSay(item)}>
          <VerbDetails v={item} />
        </Next>
      )}
    </>
  );
}

/* ---------- verbs: typing ---------- */

function VerbType({ item, onAnswer }: P<VerbItem>) {
  const [past, setPast] = useState('');
  const [pp, setPp] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const acceptable = (value: string, list: string[]) => list.map(clean).includes(clean(value));

  const submit = (e: Event) => {
    e.preventDefault();
    if (result !== null || !past.trim() || !pp.trim()) return;
    setResult(acceptable(past, item.past) && acceptable(pp, item.pp));
  };

  return (
    <>
      <div class="prompt-card">
        <span class="label">Give the two forms</span>
        <span class="big-word">to {item.base}</span>
        <span class="muted">{item.fr}</span>
      </div>
      <form class="inputs" onSubmit={submit}>
        <label>Past simple
          <input value={past} disabled={result !== null} autoCapitalize="off" autoCorrect="off" spellcheck={false}
            onInput={(e) => setPast((e.target as HTMLInputElement).value)} />
        </label>
        <label>Past participle
          <input value={pp} disabled={result !== null} autoCapitalize="off" autoCorrect="off" spellcheck={false}
            onInput={(e) => setPp((e.target as HTMLInputElement).value)} />
        </label>
        {result === null && <button class="btn primary" type="submit">Check</button>}
      </form>
      {result !== null && (
        <Next ok={result} onNext={() => onAnswer(result)} say={verbSay(item)}>
          <VerbDetails v={item} />
        </Next>
      )}
    </>
  );
}

/* ---------- vocab: meaning, in either direction ---------- */

function VocabChoice({ item, all, onAnswer }: P<VocabItem> & { all: VocabItem[] }) {
  const q = useMemo(() => {
    const toFrench = Math.random() < 0.5;
    const pool = shuffle(all.filter((v) => v.id !== item.id)).slice(0, 3);
    const text = (v: VocabItem) => (toFrench ? v.fr : v.term);
    const options = shuffle([item, ...pool]).map(text);
    return { toFrench, options, correct: options.indexOf(text(item)) };
  }, [item.id]);
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <>
      <div class="prompt-card">
        <span class="label">{q.toFrench ? 'What does it mean?' : 'Which expression?'}</span>
        <span class="big-word small">{q.toFrench ? item.term : item.fr}</span>
        {!q.toFrench && <span class="muted">{item.def}</span>}
      </div>
      <Choices options={q.options} picked={picked} correct={q.correct} onPick={setPicked} />
      {picked !== null && (
        <Next ok={picked === q.correct} onNext={() => onAnswer(picked === q.correct)} say={vocabSay(item)}>
          <VocabDetails v={item} />
        </Next>
      )}
    </>
  );
}

/* ---------- vocab: fill the gap ---------- */

function VocabCloze({ item, all, onAnswer }: P<VocabItem> & { all: VocabItem[] }) {
  const q = useMemo(() => {
    const pool = shuffle(all.filter((v) => v.id !== item.id)).slice(0, 3);
    const options = shuffle([item, ...pool]).map((v) => v.term);
    return { options, correct: options.indexOf(item.term) };
  }, [item.id]);
  const [picked, setPicked] = useState<number | null>(null);
  const gap = item.example.replace(/\{[^}]+\}/, '______');

  return (
    <>
      <div class="prompt-card">
        <span class="label">Complete the sentence</span>
        <span class="sentence">{picked === null ? gap : <Highlighted text={item.example} />}</span>
      </div>
      <Choices options={q.options} picked={picked} correct={q.correct} onPick={setPicked} />
      {picked !== null && (
        <Next ok={picked === q.correct} onNext={() => onAnswer(picked === q.correct)} say={vocabSay(item)}>
          <div class="detail">
            <p class="forms"><b>{item.term}</b> · {item.fr}</p>
            <p class="muted">{strip(item.def)}</p>
            <div class="speak-row">
              <Speak text={item.term} label="Word" />
              <Speak text={strip(item.example)} label="Sentence" />
            </div>
          </div>
        </Next>
      )}
    </>
  );
}
