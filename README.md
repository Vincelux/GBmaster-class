# GB Master Class

Mobile-first PWA for advanced English learners: irregular verbs and professional vocabulary.
Works offline once installed; progress is stored locally (spaced repetition, Leitner boxes).

## Themes (1,381 items)
- **Language**: Irregular verbs (290), Phrasal verbs (118), False friends (100)
- **Professional**: Legal English (176), Finance (177), Business conversation (195), Tech & IT (88), Marketing (74), Human resources (77), Medical English (86)

Verbs: flashcards, multiple choice, typing. Vocabulary packs: flashcards, multiple choice, in-context gap fill.

## Players, levels and rewards
- **Players, no account**: a "Who is learning today?" screen lets each person create a profile (first name and avatar).
  Each player's progress is stored separately on the device. No e-mail, no password, no server, works offline.
  Players can be added, switched (🔄 on the home screen) or deleted (with confirmation).
- **Levels (CEFR A1 to C2)**: chosen when a profile is created and changeable at any time from the profile page.
  Progress is never lost when the level changes; only what is *suggested* changes. Every item carries its own level.
- **Rewards**: XP and corporate-style ranks, 22 badges, daily and weekly challenges, streaks.
- Limit: data lives in the browser of the device, so clearing site data or switching device means starting again.

## Features
- Spoken pronunciation (browser speech synthesis, British English preferred), optional auto-play
- Daily streak and daily goal
- Daily reminder: downloads a repeating calendar event (.ics), so it works with the app closed
- Offline PWA; progress stored locally

## Develop
```
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
```

## Add a theme
1. Create `src/data/<theme>.ts` with rows `[term, French, English definition, example with {target}]`.
2. Register a pack in `src/data/index.ts`.

Everything else (spaced repetition, stats, exercise modes) is shared.

## Deploy
A GitHub Actions workflow builds on every push and deploys to GitHub Pages from `main`.
One-off setup: repository Settings → Pages → Source: **GitHub Actions**.
