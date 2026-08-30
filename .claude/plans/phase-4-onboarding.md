# Phase 4 — Inclusive Registration & Onboarding

**Status: Task 4.1's taxonomy half DONE (2026-08-30); secondary_types/profile columns still pending.**
See [00-STATUS.md](00-STATUS.md) for repo traps and the validation gate.

### Task 4.1a: Broaden the taxonomy — DONE
`src/utils/questions.js` `READING_TYPES`/`GENRES`/`READING_FORMATS` expanded, driven by the user
wanting the platform to cover "every literary reader whether online or not," not just the plan's
original narrower list. Pure client-side change — `reading_type` is `text` and `favorite_genres` is
already `text[]`, so no migration needed.
- READING_TYPES += Web Fiction/Serials, Fanfiction, Light Novels, Webtoons/Manhwa, Audiobooks &
  Podcasts, Interactive Fiction/Visual Novels, Zines & Indie Press. (Dropped "Poetry" from this list —
  the original plan listed it as both a reading *type* and already-existing *genre*, same word in two
  categories; kept it only as a genre.)
- GENRES += LGBTQ+ Voices, Disability & Neurodivergent Voices, World Literature (Translated),
  Mythology & Folklore, Religious & Spiritual (additive alongside existing "Christian," not a
  replacement — renaming would silently orphan any user's already-stored value), True Crime,
  Literary Fiction, Cookbooks & Food Writing, Nature & Environmental Writing, LitRPG/GameLit, War &
  Military Fiction, Western, Politics & Current Affairs, Adult (user's call, PG-plain label over
  "Erotica" — asked and confirmed 2026-08-30, see chat).
- READING_FORMATS += Web/App (previously unrepresented despite being how most online-native readers
  actually read), Large Print.
- Matching algorithm needed zero code changes — `reading_type`/`favorite_genres` scoring is plain
  string comparison, generalizes to any list. Verified: `Interests.jsx`'s option grid is
  `grid-cols-2/3` auto-wrapping, doesn't break with more options. Build green.

### Task 4.1b: `secondary_types` + profile columns — NOT started
- **Action**: keep single primary `reading_type` (matching weights depend on it) but add optional
  `secondary_types text[]` question + column (migration `0003_inclusive.sql`: alter user_preferences
  add secondary_types, alter profiles add pronouns text, display_name text, role text default
  'reader').
- **Validate**: questionnaire saves all new fields; matching still runs.

### Task 4.2: Multi-step onboarding
- **Action**: rebuild post-signup flow as steps: (1) welcome + display name + optional pronouns,
  (2) "I'm here as: Reader / Creator / Both" → sets `profiles.role`, (3) the Interests questionnaire
  (existing, restyled with Phase 2 primitives), (4) suggested communities from chosen genres. Route
  `/onboarding`; redirect there after first login when `user_preferences` row absent.
- **Validate**: fresh signup lands in onboarding; completing it lands on Home with matches; skipping
  optional fields works.

### Task 4.3: A11y pass
- **Action**: every form field labelled (`<label htmlFor>`), buttons have discernible text, focus
  order sane, color contrast ≥ 4.5:1 (check the amber accent on paper background),
  `prefers-reduced-motion` respected on framer-motion animations (wrap with `useReducedMotion`).
- **Validate**: keyboard-only signup → onboarding → post creation succeeds.
