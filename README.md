# GB Master Class

Mobile-first PWA for advanced English learners: irregular verbs and professional vocabulary.
Works offline once installed; progress is stored locally (spaced repetition, Leitner boxes).

## Themes
- **Irregular verbs** (106): flashcards, multiple choice, typing
- **Legal English**, **Finance**, **Business conversation** (~30 each): flashcards, multiple choice, in-context gap fill

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
