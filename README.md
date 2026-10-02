# GB Master Class

Mobile-first PWA for advanced English learners: irregular verbs and professional vocabulary.
Works offline once installed; progress is stored locally (spaced repetition, Leitner boxes).

## Themes
- **Irregular verbs** (155, incl. prefixed verbs and UK/US double forms): flashcards, multiple choice, typing
- **Legal English** (65), **Finance** (63), **Business conversation** (67): flashcards, multiple choice, in-context gap fill

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
