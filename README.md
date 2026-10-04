# GB Master Class

Mobile-first PWA for advanced English learners: irregular verbs and professional vocabulary.
Works offline once installed; progress is stored locally (spaced repetition, Leitner boxes).

## Themes (1,381 items)
- **Language**: Irregular verbs (290), Phrasal verbs (118), False friends (100)
- **Professional**: Legal English (176), Finance (177), Business conversation (195), Tech & IT (88), Marketing (74), Human resources (77), Medical English (86)

Verbs: flashcards, multiple choice, typing. Vocabulary packs: flashcards, multiple choice, in-context gap fill.

## Accounts, levels and rewards
- **Levels (CEFR A1 to C2)**: chosen at first sign-in and changeable at any time from the profile. Progress is
  never lost when the level changes; only what is *suggested* changes. Every item carries its own level.
- **Rewards**: XP and corporate-style ranks, 22 badges, daily and weekly challenges, streaks.
- **Two modes**:
  - *Device profiles* (default, no setup): several profiles on one device, no password, data stays on the device.
  - *Cloud accounts* (e-mail + password, progress follows you across devices): needs a free Supabase project.

### Enable cloud accounts (one-off, about 10 minutes)
1. Create a free project at <https://supabase.com> (choose an EU region).
2. In **SQL Editor**, run the contents of `supabase/schema.sql`.
3. In **Authentication -> Providers**, keep *Email* enabled. For the simplest sign-up, turn off *Confirm email*
   (otherwise users must click a link in an e-mail before signing in).
4. In **Authentication -> URL Configuration**, set *Site URL* to the app address
   (e.g. `https://<user>.github.io/GBmaster-class/`) so password-reset links come back to the app.
5. In **Project Settings -> API**, copy the *Project URL* and the *anon public* key.
6. In the GitHub repository: **Settings -> Secrets and variables -> Actions -> Variables**, add
   `SUPABASE_URL` and `SUPABASE_ANON_KEY`, then re-run the *Build and deploy* workflow.

The anon key is public by design; each user can only read and write their own row (see the policies in
`supabase/schema.sql`). For local development, copy `.env.example` to `.env.local`.

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
