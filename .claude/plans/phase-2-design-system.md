# Phase 2 — Design System & UI Refurbish

Goal: kill the "tacky" via system, not taste. No new dependencies beyond Radix primitives if needed
(`npm i radix-ui`) — shadcn-style components are copied in, not installed as a lib. See
[00-STATUS.md](00-STATUS.md) for repo traps and the validation gate.

### Task 2.1: Tokens — DONE (`7a759f7`)
`src/index.css` `@theme`: warm literary palette (ink/paper/amber), semantic tokens
(`--color-surface`, `--color-surface-raised`, `--color-ink`, `--color-ink-muted`, `--color-accent`),
4px spacing scale, serif display + sans body fonts, radius tokens. Replaced the old purple/pink
gradient look everywhere.

### Task 2.2: Primitives (`src/components/ui/`) — DONE
Built Button, Card, Input, Modal, Avatar, Badge, Tabs, EmptyState, Skeleton — props-minimal,
Tailwind-only, forwardRef where needed, focus-visible rings, aria labels. Swept every page onto them,
one commit per page: Landing (`d3e411e`) → Login/Signup (`6091d66`) → Home (`caa7b1d`, token pass
only) → Communities (`0983e90`) → CommunityView (`973bc67`) → Profile (`c51cf87`) → Discover
(`6e08fab`) → Search (`9edb9c5`).

### Task 2.3: App shell & Home rethink — IN PROGRESS (uncommitted)
- **Action**: unify `layout/Navbar` + a new `layout/Sidebar` into a consistent shell (sidebar: Home,
  Discover, Communities, Matches, Creators*, Chat*, Profile; * = placeholder until later phases).
  Rebuild `pages/Home.jsx` as a feed: (a) activity from joined communities (recent discussions via
  existing `getCommunityDiscussions` per membership), (b) "Top matches" rail (placeholder data until
  Phase 3 — `recommendations/MatchCard.jsx` scaffolded now), (c) "Discover communities" rail. Remove
  the current widget clutter.
- **Current working-tree state**: `src/App.jsx`, `src/components/layout/Navbar.jsx`,
  `src/pages/Home.jsx` modified; `src/components/layout/Sidebar.jsx`,
  `src/components/recommendations/MatchCard.jsx` new/untracked — not yet committed.
- **Validate**: `npm run build` green; Home renders with real community data for a member account;
  `MatchCard` renders (placeholder data is fine, real scoring is Phase 3); commit when green.
