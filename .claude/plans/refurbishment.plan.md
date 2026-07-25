# Plan: BookPals Refurbishment ("The Modernisation")

**Complexity**: Large — 6 phases, each independently shippable
**Executor notes**: Written by Opus 4.8 for execution by a cheaper model over multiple sessions.
Execute phases IN ORDER. Never start a phase with a red build. Commit after every green phase.
The developer is **Mr Salad** — address him as such, and explain implementation choices as you go (he is learning React/Vite/Supabase).

---

## REPO TRAPS — read before touching anything

Things a fresh session WILL get wrong without this list:

1. **Folder names are weird but load-bearing.** Components live in
   `src/components/Side-Top bars/` (space in name), `src/components/Reccomendations/`
   (misspelled), `src/components/Categorisation/`. Do NOT rename these folders until
   Phase 1 Task 4 says so, and when renaming, update every importer in the same commit.
2. **Supabase FK names are referenced by string in code.** `database.js` embeds
   `profiles!discussions_user_id_fkey1` and `profiles!comments_user_id_fkey1`.
   The migration `supabase/migrations/0001_init.sql` creates them with exactly those names.
   Any schema change must preserve them (or change code + SQL together).
3. **Storage bucket `dicussion-posts` is misspelled on purpose** — the code spells it
   that way (`database.js` createPost). Keep code and bucket in sync; if you fix the
   spelling, fix BOTH.
4. **Env**: real keys are in `.env.local` (gitignored, never commit, never print).
   `.env` has placeholders. `VITE_STREAM_API_KEY=placeholder` is intentional (chat deferred).
5. **Two questionnaires exist**: `components/Categorisation/Interests.jsx` →
   `user_preferences` table (structured columns) and
   `components/Categorisation/ReaderCategorization.jsx` → `reader_preferences` table
   (jsonb blob). This duplication is resolved in Phase 1 Task 4.
6. **Chat is intentionally dead.** Console errors `:3001/get-stream-token
   ERR_CONNECTION_REFUSED` are expected until Phase 6 replaces Stream with Supabase
   Realtime. Do not "fix" them earlier; do not run the token server.
7. **Validation gate for every task**: `npm run build` must be green
   (ignore Browserslist warnings). Runtime check: `npm run dev`, open the app.
8. **Two known security bugs** are fixed in Phase 1 Task 3 — don't ship past Phase 1
   without them.
9. `.claude/settings.local.json` sets `ECC_GATEGUARD=off` — leave it.

## Current state (verified 2026-07-25)

- Build green (`vite build`, 2987 modules). App renders; signup/login/questionnaire
  reached against the live Supabase project.
- Stack: React 18.2, Vite 5.4, Tailwind 3, react-router-dom 6 (v7 future flags on),
  framer-motion 12.42, stream-chat(-react) installed but inert, @supabase/supabase-js.
- Schema deployed from `supabase/migrations/0001_init.sql`:
  profiles, user_preferences, reader_preferences, user_connections, communities,
  community_members, discussions, comments (+RLS) + buckets avatars,
  community-banners, dicussion-posts.
- Original dissertation requirements (Volere, in `Reference/Requirement ID 1...txt`):
  accounts/profiles; preference matching; communities + live discussion; 1:1/group chat;
  public searchable profiles; 100–1000 concurrent; GDPR; intuitive accessible UI; <15s.

---

## Phase 1 — Foundation & Safety Net

### Task 1.1: Commit current working state
- **Action**: `git status`; stage everything EXCEPT `.env.local` (verify `.gitignore`
  covers `.env*` — if not, add `.env` and `.env.local` to it first). Commit:
  `"Fix mid-refactor import debris; app builds and runs again"`.
- **Validate**: `git status` clean except intentionally-ignored files.

### Task 1.2: Dependency modernisation (one lib per commit)
- **Action**, in order, `npm run build` between each:
  1. `npm i react@19 react-dom@19` (also update any `ReactDOM.render` → already
     `createRoot` in main.jsx, verify).
  2. `npm i react-router-dom@7` — v7 future flags already enabled in `App.jsx`;
     imports stay `react-router-dom`. Remove the `future={{...}}` prop (v7 default).
  3. `npm i vite@7 @vitejs/plugin-react@latest`.
  4. Tailwind 4: `npm i tailwindcss@4 @tailwindcss/vite` — switch from PostCSS config
     to the Vite plugin; replace `tailwind.config.js` theme with CSS `@theme` in
     `src/index.css`. Keep existing utility classes working (Tailwind 4 is mostly
     compatible; run the app and click through every route).
  5. `npm i @tanstack/react-query@5`; wrap app in `QueryClientProvider` in `main.jsx`.
     (Migration of individual fetches happens opportunistically in later phases —
     do NOT mass-refactor now.)
- **Validate**: build green after EACH step; dev server renders landing, login,
  home, communities, profile.

### Task 1.3: Security fixes
- **Action**:
  1. `src/services/tokenGeneration.js`: rename `VITE_STREAM_API_SECRET` →
     `STREAM_API_SECRET`, `VITE_SUPABASE_SERVICE_ROLE` → `SUPABASE_SERVICE_ROLE_KEY`,
     read via `process.env` (it's an Express server file, not client code). Update
     `.env.example` accordingly. (File dies in Phase 6 anyway; fix is 5 lines.)
  2. `src/services/database.js` `sendFriendRequest`: before the `.or(...)` filter,
     validate both ids with
     `const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;`
     throw if either fails. Same in any other function interpolating ids into `.or()`
     strings (grep `\.or\(` across `src/`).
- **Validate**: build green; friend-request flow still works in dev.

### Task 1.4: Kill duplication & dead code
- **Action**:
  1. Delete `signIn`/`signUp` stubs from `context/AuthContext.jsx` (Login/Signup call
     `services/auth.js` directly — confirm with grep before deleting).
  2. Consolidate questionnaires: KEEP `Interests.jsx` (+ `user_preferences` table),
     DELETE `ReaderCategorization.jsx`, its `/reader-categorization` route in
     `App.jsx`, and any links to it. Leave `reader_preferences` table in DB (empty,
     harmless; note in commit message).
  3. Rename folders: `Side-Top bars` → `layout`, `Reccomendations` → `recommendations`,
     `Categorisation` → `onboarding`. Use `git mv`. Update ALL importers
     (grep for each old path); build must be green in the same commit.
- **Validate**: `npm run build`; every route renders; commit per sub-task.

---

## Phase 2 — Design System & UI Refurbish

Goal: kill the "tacky" via system, not taste. No new dependencies beyond Radix
primitives if needed (`npm i radix-ui`) — shadcn-style components are copied in, not
installed as a lib.

### Task 2.1: Tokens
- **Action**: in `src/index.css` `@theme`: one brand hue (recommend a warm
  literary palette: ink `#1a1612`, paper `#faf7f2`, accent amber-600 family),
  semantic tokens (`--color-surface`, `--color-surface-raised`, `--color-ink`,
  `--color-ink-muted`, `--color-accent`), 4px spacing scale, 2 font families
  (serif display for headings — e.g. 'Fraunces' via @fontsource, sans for body),
  radius tokens. Replace the existing purple/pink gradient look everywhere it appears
  (grep `gradient` in `src/`).
- **Validate**: app renders with new palette in light AND dark (`dark:` classes).

### Task 2.2: Primitives (`src/components/ui/`)
- **Action**: Build Button, Card, Input, Modal, Avatar, Badge, Tabs, EmptyState,
  Skeleton. Props-minimal, Tailwind-only, forwardRef where needed, focus-visible
  rings, aria labels. Then sweep each page replacing raw markup with these
  (one page per commit: Landing → Login/Signup → Home → Communities → CommunityView
  → Profile → Discover → Search).
- **Validate**: visual pass on every route; keyboard-tab through forms.

### Task 2.3: App shell & Home rethink
- **Action**: unify `layout/Navbar` + `layout/UnifiedSidebar` into a consistent shell
  (sidebar: Home, Discover, Communities, Matches, Creators*, Chat*, Profile;
  * = placeholder until later phases). Rebuild `pages/Home.jsx` as a feed:
  (a) activity from joined communities (recent discussions via existing
  `getCommunityDiscussions` per membership), (b) "Top matches" rail (placeholder data
  until Phase 3 — build the card component now), (c) "Discover communities" rail.
  Remove the current widget clutter.
- **Validate**: Home renders with real community data for a member account.

---

## Phase 3 — Matching Engine

### Task 3.1: Scoring RPC migration
- **Action**: new file `supabase/migrations/0002_matching.sql`. Function:

```sql
create or replace function public.match_users(p_user_id uuid, p_limit int default 20)
returns table (
  user_id uuid, username text, avatar_url text, bio text,
  score numeric, genre_score numeric, type_score numeric,
  author_score numeric, freq_score numeric, format_score numeric, time_score numeric
) language sql stable security invoker as $$
  with me as (select * from user_preferences where user_id = p_user_id),
  candidates as (
    select up.*, p.username, p.avatar_url, p.bio
    from user_preferences up
    join profiles p on p.id = up.user_id
    where up.user_id <> p_user_id
      and not exists (  -- exclude existing connections either direction
        select 1 from user_connections uc
        where (uc.user_id = p_user_id and uc.connected_user_id = up.user_id)
           or (uc.user_id = up.user_id and uc.connected_user_id = p_user_id))
  )
  select c.user_id, c.username, c.avatar_url, c.bio,
    round((
      0.40 * coalesce(jaccard(c.favorite_genres, me.favorite_genres), 0)
    + 0.20 * (c.reading_type = me.reading_type)::int
    + 0.15 * coalesce(jaccard(c.favorite_authors, me.favorite_authors), 0)
    + 0.10 * freq_adjacency(c.reading_frequency, me.reading_frequency)
    + 0.10 * (c.preferred_reading_format = me.preferred_reading_format)::int
    + 0.05 * (c.preferred_reading_time = me.preferred_reading_time)::int
    )::numeric, 3) as score,
    -- expose components for "why you matched" UI
    round(coalesce(jaccard(c.favorite_genres, me.favorite_genres),0)::numeric,3),
    (c.reading_type = me.reading_type)::int::numeric,
    round(coalesce(jaccard(c.favorite_authors, me.favorite_authors),0)::numeric,3),
    freq_adjacency(c.reading_frequency, me.reading_frequency)::numeric,
    (c.preferred_reading_format = me.preferred_reading_format)::int::numeric,
    (c.preferred_reading_time = me.preferred_reading_time)::int::numeric
  from candidates c, me
  order by score desc limit p_limit;
$$;
```

  Plus helpers in the same migration: `jaccard(text[], text[]) returns float`
  (`|A∩B| / |A∪B|`, null-safe) and `freq_adjacency(text, text) returns float`
  (equal→1, adjacent in Daily>Weekly>Occasionally>Rarely→0.5, else 0). Both
  `immutable`. Grant execute to `authenticated`.
- **Validate**: run in Supabase SQL editor with two seeded test users; scores 0–1.

### Task 3.2: Client rewrite
- **Action**: gut `src/services/recommendationService.js` → single
  `supabase.rpc("match_users", { p_user_id, p_limit })` call wrapped in a
  TanStack Query hook `useMatches(userId)`. Delete the old client-side scoring code.
- **Validate**: Home "Top matches" rail shows real scored users (seed 3+ test
  accounts with overlapping genres via the app's own signup + questionnaire).

### Task 3.3: Match UI
- **Action**: `MatchCard` shows score as %, top-2 shared genres as Badges, and a
  breakdown popover ("Genres 0.8 · Type ✓ · Authors 0.2 …"). CTA = "Connect"
  → existing `sendFriendRequest`. Full `/matches` page listing top 20.
- **Validate**: connect flow end-to-end between two test accounts.

---

## Phase 4 — Inclusive Registration & Onboarding

### Task 4.1: Broaden the taxonomy
- **Action**: in `src/utils/questions.js`: READING_TYPES += Webtoons/Webcomics,
  Fanfiction, Light Novels, Poetry, Audiobooks & Podcasts, Zines & Indie Press,
  Interactive Fiction. GENRES += LGBTQ+, Neurodiversity & Disability voices,
  World Literature (translated), Mythology & Folklore. Multi-select for
  reading_type? NO — keep single primary type (matching weights depend on it) but
  add optional `secondary_types text[]` question + column
  (migration `0003_inclusive.sql`: alter user_preferences add secondary_types,
  alter profiles add pronouns text, display_name text, role text default 'reader').
- **Validate**: questionnaire saves all new fields; matching still runs.

### Task 4.2: Multi-step onboarding
- **Action**: rebuild post-signup flow as steps: (1) welcome + display name +
  optional pronouns, (2) "I'm here as: Reader / Creator / Both" → sets
  `profiles.role`, (3) the Interests questionnaire (existing, restyled with Phase 2
  primitives), (4) suggested communities from chosen genres. Route `/onboarding`;
  redirect there after first login when `user_preferences` row absent.
- **Validate**: fresh signup lands in onboarding; completing it lands on Home with
  matches; skipping optional fields works.

### Task 4.3: A11y pass
- **Action**: every form field labelled (`<label htmlFor>`), buttons have
  discernible text, focus order sane, color contrast ≥ 4.5:1 (check the amber
  accent on paper background), `prefers-reduced-motion` respected on framer-motion
  animations (wrap with `useReducedMotion`).
- **Validate**: keyboard-only signup → onboarding → post creation succeeds.

---

## Phase 5 — Creators Space

### Task 5.1: Schema
- **Action**: `supabase/migrations/0004_creators.sql`:
  `creator_profiles(user_id uuid pk references profiles, craft text[] /* writer, illustrator, poet, translator, editor, narrator */, tagline text, portfolio_url text, open_to_collab boolean default false, created_at timestamptz default now())`;
  `works(id uuid pk default gen_random_uuid(), creator_id uuid references creator_profiles(user_id) on delete cascade, title text not null, work_type text, blurb text, link_url text, cover_url text, genres text[], created_at timestamptz default now())`.
  RLS mirroring existing patterns (read: authenticated; write: own rows).
  Storage bucket `work-covers` (public read, auth write).
- **Validate**: SQL runs clean on live project.

### Task 5.2: Creators directory + profile tab
- **Action**: `/creators` page: grid of creator cards (avatar, craft badges, tagline,
  top work), filter by craft + genre. Profile page gains a "Creator" tab (visible
  when `role in ('creator','both')`): edit creator_profile, CRUD works (cover upload
  reuses the existing avatar-upload pattern in `database.js` updateProfilePicture).
  Sidebar "Creators" link goes live.
- **Validate**: creator account can publish a work; reader account can browse/filter.

### Task 5.3: Matching bonus
- **Action**: `0005_creator_matching.sql`: in `match_users`, add
  `+ 0.10 * creator_genre_overlap` bonus term when candidate is a creator sharing
  ≥1 genre with the seeker (cap total at 1.0). Update breakdown UI with
  "Creator you may like" badge.
- **Validate**: creator with shared genres outranks equivalent non-creator.

---

## Phase 6 — Chat: Stream → Supabase Realtime

### Task 6.1: Schema
- **Action**: `supabase/migrations/0006_chat.sql`:
  `conversations(id uuid pk default gen_random_uuid(), is_group boolean default false, name text, created_by uuid references profiles, created_at timestamptz default now())`;
  `conversation_members(conversation_id uuid references conversations on delete cascade, user_id uuid references profiles on delete cascade, joined_at timestamptz default now(), primary key(conversation_id, user_id))`;
  `messages(id uuid pk default gen_random_uuid(), conversation_id uuid references conversations on delete cascade, sender_id uuid references profiles, content text not null, created_at timestamptz default now())`.
  RLS: members-only read/write (exists check on conversation_members).
  `alter publication supabase_realtime add table messages;`
- **Validate**: SQL clean; RLS blocks non-members (test with 2 accounts in SQL editor).

### Task 6.2: Client
- **Action**: new `src/services/chatService.js`: getOrCreateDirectConversation(a,b),
  sendMessage, useMessages(conversationId) hook subscribing via
  `supabase.channel(...).on('postgres_changes', {event:'INSERT', table:'messages', filter:`conversation_id=eq.${id}`})`.
  Rebuild `pages/ChatRooms.jsx` + `components/chat/Conversation.jsx` on the Phase 2
  primitives (conversation list + message thread + composer). Group chat = same
  tables with is_group, creation from `CreateGroupChat.jsx` (rewire, keep UI).
- **Validate**: two browsers, two accounts, live message delivery both ways;
  group chat with 3 accounts.

### Task 6.3: Excise Stream
- **Action**: `npm rm stream-chat stream-chat-react`; delete
  `services/streamClient.js`, `services/tokenGeneration.js`, token-server script from
  `package.json`, `ChatContext` stream logic (replace with conversation state or
  delete if redundant); remove Stream CSS import; grep `stream` case-insensitive
  across src to catch stragglers (note: `LoadingIndicator` from stream-chat-react is
  imported in CommunityView.jsx and CommentSection.jsx — replace with ui/Skeleton).
  Update `acceptFriendRequest` in database.js: replace Stream channel creation with
  `getOrCreateDirectConversation`.
- **Validate**: build green; bundle main chunk shrinks (was ~1.96MB); all chat +
  friend-accept flows work; no `:3001` requests anywhere.

---

## Validation (every phase)
```bash
npm run build          # must be green (ignore Browserslist warnings)
npm run dev            # click through every route touched
git status             # .env.local NEVER staged
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| React 19 breaks a lib (framer-motion, toastify) | MED | upgrade one dep per commit; pin last-good on failure and note it |
| Tailwind 4 class drift | MED | full-route visual pass in Task 1.2.4; Phase 2 restyles anyway |
| RLS recursion/perf in chat policies | MED | use exists-subquery pattern from 0001; test with 2 accounts before UI work |
| Cheap-model executor drifts from spec | MED | this file is the contract — re-read the phase before each session; never skip validation gates |
| Data loss | LOW | DB near-empty; migrations are additive; never run destructive SQL without explicit approval from Mr Salad |

## Acceptance
- [x] P1: build green on React 19/Vite 7/Tailwind 4; security fixes in; one questionnaire (done 2026-07-25, commits e75479c..4d6553a)
- [ ] P2: design tokens + ui/ primitives on every route; Home is a feed
- [ ] P3: match_users RPC live; /matches page with score breakdowns
- [ ] P4: inclusive taxonomy; 4-step onboarding; keyboard-only pass
- [ ] P5: /creators directory; works CRUD; creator match bonus
- [ ] P6: realtime chat on Supabase; Stream fully removed
