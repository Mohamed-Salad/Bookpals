# BookPals Refurbishment — Status & Index

**Developer**: Mr Salad. Explain implementation choices as you go — he's learning React/Vite/Supabase.
**Executor notes**: this plan is split by phase so a fresh session only needs to load the file for
the phase it's working on, plus this status file. Execute phases IN ORDER. Never start a phase with
a red build. Commit after every green task/phase.

Phase files: [phase-1-foundation.md](phase-1-foundation.md) · [phase-2-design-system.md](phase-2-design-system.md) ·
[phase-3-matching-engine.md](phase-3-matching-engine.md) · [phase-4-onboarding.md](phase-4-onboarding.md) ·
[phase-5-creators.md](phase-5-creators.md) · [phase-6-chat.md](phase-6-chat.md)

**[DB-AUDIT-LOG.md](DB-AUDIT-LOG.md)** — every action taken against the *live* Supabase project gets
logged there (read-only checks included). Check it before assuming any migration has/hasn't run.

---

## Current state (verified 2026-08-30, cross-checked against `git log`)

- **Phase 1 — DONE & committed** (`1ae8e95`..`4d6553a`, marked complete `cbf870e`).
- **Phase 2.1 (design tokens) — DONE & committed** (`7a759f7`).
- **Phase 2.2 (primitives + page sweep) — DONE & committed.** All 9 `src/components/ui/` primitives
  exist (Avatar, Badge, Button, Card, EmptyState, Input, Modal, Skeleton, Tabs). All 8 pages swept:
  Landing, Login/Signup, Home (token pass only), Communities, CommunityView, Profile, Discover, Search
  (`d3e411e`..`9edb9c5`).
- **Phase 2.3 (app shell & Home rethink) — DONE & committed** (`45df5cb`). Home is now a feed
  (community activity + Top Matches rail with placeholder `MatchCard` data + Discover Communities
  rail); new `layout/Sidebar.jsx` wired into `App.jsx`/`Navbar.jsx`.
  - Found and fixed along the way: `DiscussionItem.jsx` and `PostCreator.jsx` were dead legacy
    components calling a `createDiscussion` export that no longer exists (renamed to `createPost`
    at some point, callers never updated) — broke the production build. Both deleted; the Home feed
    uses the already-correct `PostItem` component instead. Build verified green (`vite build`),
    landing page smoke-tested with Playwright (0 console errors). Home feed itself not yet visually
    verified logged-in — do that next time you're in the app.
- **Phase 3 (Matching Engine) — DONE, migration applied 2026-08-30.** `useMatches` hook, `MatchCard`
  (score + breakdown popover + Connect CTA), and the full `/matches` page all built and wired.
  `0002_matching.sql` run by Mr Salad via the Supabase SQL Editor; verified live via a read-only RPC
  probe (see DB-AUDIT-LOG.md) — function exists, executes, RLS correctly returns nothing for an
  unauthenticated/nonexistent caller. **Not yet done**: a real logged-in pass to see actual scored
  matches (this session has no login). Minor hardening note, not urgent: `match_users` is currently
  invocable by the `anon` role too (Postgres grants `EXECUTE` to `PUBLIC` by default unless revoked;
  the migration only added `to authenticated`, didn't revoke from `public`) — harmless today because
  `security invoker` + RLS on `user_preferences`/`profiles` already restricts anon reads to zero rows
  regardless, but `revoke execute ... from public` before the grant would be the tidier belt-and-braces
  version. Worth a one-line follow-up migration if you want it, not done here since it's not asked for
  and isn't an active leak.
- **Phase 4 — DONE except one item.** Taxonomy broadened (4.1a), `secondary_types`/`pronouns`/
  `display_name`/`role` schema written and applied (4.1b, migration confirmed live 2026-08-30 via
  REST probe — see DB-AUDIT-LOG.md), full multi-step `/onboarding` wizard built and routed (4.2),
  amber-accent WCAG AA contrast bugs found and fixed app-wide (4.3, partial). See phase-4-onboarding.md.
  - Remaining, not urgent: wrap `framer-motion` transitions with `useReducedMotion` (WCAG AAA, 7+ files,
    needs OS-level motion emulation to verify — not rushed blind).
- **Phases 5–6 — not started.**
- **Also added this session, outside the phase plan**: minimal GitHub Actions CI (`.github/workflows/ci.yml`,
  runs `npm ci --legacy-peer-deps && npm run build` on push/PR to `main`) and a multi-stage `Dockerfile`
  + `nginx.conf` (builds the Vite app, serves via nginx, ~97MB image, verified working locally).
  Neither is CD (nothing deploys anywhere yet) - see repo trap #9 below for the peer-dep gotcha both
  depend on.

## Repo traps — read before touching anything

A fresh session WILL get these wrong without this list:

1. **Folder names were renamed in Phase 1.4.3** — `Side-Top bars` → `layout`, `Reccomendations` →
   `recommendations`, `Categorisation` → `onboarding`. If you see the old names in a stray doc or your
   own memory, they're stale; the live tree uses the new names.
2. **Supabase FK names are referenced by string in code.** `database.js` embeds
   `profiles!discussions_user_id_fkey1` and `profiles!comments_user_id_fkey1`. The migration
   `supabase/migrations/0001_init.sql` creates them with exactly those names. Any schema change must
   preserve them (or change code + SQL together).
3. **Storage bucket `dicussion-posts` is misspelled on purpose** — the code spells it that way
   (`database.js` createPost). Keep code and bucket in sync; if you fix the spelling, fix BOTH.
4. **Env**: real keys are in `.env.local` (gitignored, never commit, never print). `.env` has
   placeholders. `VITE_STREAM_API_KEY=placeholder` is intentional (chat deferred to Phase 6).
5. **Chat is intentionally dead.** Console errors `:3001/get-stream-token ERR_CONNECTION_REFUSED` are
   expected until Phase 6 replaces Stream with Supabase Realtime. Do not "fix" them earlier; do not
   run the token server.
6. **Validation gate for every task**: `npm run build` must be green (ignore Browserslist warnings).
   Runtime check: `npm run dev`, open the app.
7. `.claude/settings.local.json` sets `ECC_GATEGUARD=off` — leave it.
8. **`Reference/` is historical only and gitignored**, salvaged docs from older deprecated attempts
   at this project. Reviewed 2026-08-25: `Reference/docs/` (17 files) was confirmed to describe a
   fictional/superseded app (invented tables, a REST API that never existed, a purple/glassmorphism
   design already torn out) and was deleted (zip backup at `Reference/docs-archive-2026-08-25.zip`).
   The Volere requirement `.txt` files directly under `Reference/` are the only genuine signal and
   are already captured in the "Original goals" section of the project's root `CLAUDE.md`.
9. **`npm ci` (strict) fails on a peer-dependency conflict that `npm install` silently tolerates.**
   `@emoji-mart/react@1.1.1` (pulled in via `stream-chat-react`, dead code until Phase 6) only
   declares peer support for React ≤18; React 19 is installed and works fine at runtime, but `npm ci`
   validates peer ranges strictly regardless of what the lockfile already resolved. Always
   `npm ci --legacy-peer-deps` (CI and Dockerfile already do this) — plain `npm ci` will fail. Real
   fix is Phase 6 removing `stream-chat-react` entirely.

## Validation (every phase)
```bash
npm run build          # must be green (ignore Browserslist warnings)
npm run dev            # click through every route touched
git status              # .env.local NEVER staged
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| React 19 breaks a lib (framer-motion, toastify) | MED | upgrade one dep per commit; pin last-good on failure and note it |
| Tailwind 4 class drift | MED | full-route visual pass; Phase 2 restyles anyway |
| RLS recursion/perf in chat policies | MED | use exists-subquery pattern from 0001; test with 2 accounts before UI work |
| Plan drifts from actual `git log` | MED | update this status file at the end of every session, before ending it |
| Data loss | LOW | DB near-empty; migrations are additive; never run destructive SQL without explicit approval from Mr Salad |

## Acceptance
- [x] P1: build green on React 19/Vite 8/Tailwind 4; security fixes in; one questionnaire (done 2026-07-25)
- [x] P2: design tokens ✅ + ui/ primitives on every route ✅ + Home is a feed ✅ (done 2026-08-25)
- [x] P3: match_users RPC live (client done 2026-08-28, migration applied + verified 2026-08-30)
- [x] P4: inclusive taxonomy ✅ + 4-step onboarding ✅ + contrast fixed ✅ + migration applied &
      verified ✅ (done 2026-08-30); keyboard-only pass + reduced-motion still open (not blocking)
- [ ] P5: /creators directory; works CRUD; creator match bonus
- [ ] P6: realtime chat on Supabase; Stream fully removed
