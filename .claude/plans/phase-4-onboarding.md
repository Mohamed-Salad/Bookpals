# Phase 4 — Inclusive Registration & Onboarding

**Status: not started.** See [00-STATUS.md](00-STATUS.md) for repo traps and the validation gate.

### Task 4.1: Broaden the taxonomy
- **Action**: in `src/utils/questions.js`: READING_TYPES += Webtoons/Webcomics, Fanfiction, Light
  Novels, Poetry, Audiobooks & Podcasts, Zines & Indie Press, Interactive Fiction. GENRES += LGBTQ+,
  Neurodiversity & Disability voices, World Literature (translated), Mythology & Folklore.
  Multi-select for reading_type? NO — keep single primary type (matching weights depend on it) but
  add optional `secondary_types text[]` question + column (migration `0003_inclusive.sql`: alter
  user_preferences add secondary_types, alter profiles add pronouns text, display_name text,
  role text default 'reader').
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
