# BookPals

Dissertation project (submitted; now being revived to actually finish/harden). Address the developer as **Mr Salad**.

## What this is

A reading-community platform: users sign up, answer a preference questionnaire, get matched with similar readers, join/create communities, post/comment/react, and chat 1:1 or in groups in real time.

Original goals (recovered from `Reference/`, the salvaged docs from earlier deprecated attempts at this project):
- Secure auth + profile management (Supabase Auth)
- Reader categorization: 5-10 question preference questionnaire feeding a matching/recommendation system
- Public, searchable profiles (search by username/email)
- Communities: create/join, discussion posts, comments, reactions
- Real-time chat: 1:1 and group (Stream/GetStream), separate from communities
- NFRs: 100-1000 concurrent users, GDPR-compliant/encrypted data, <15s response times, intuitive UI

## Stack

- Frontend: React 19 + Vite + Tailwind CSS 4 (`@theme` design tokens, `.dark`-class theming), `react-router-dom` v6
- Backend-as-a-service: Supabase (Postgres, Auth, Realtime, RLS) — project `nfhkdwwydzigdojikzeu`
- Chat: 1:1 and group, built directly on Supabase tables + Realtime (`src/services/chatService.js`) — no separate chat vendor or token server; `npm run dev` is the only process needed locally
- Route-level code splitting via `React.lazy`/`Suspense` (`src/App.jsx`)

Everything under "Known issues" as of the original 2026-07-02 audit (App.jsx's broken imports, AuthContext's dead signIn/signUp stubs, the fully-untracked git tree, the Stream/Express token server's `VITE_`-prefixed secret exposure, unsanitized ids in `database.js`'s `.or()` filters) has since been fixed and committed — see git log / `.claude/plans/DB-AUDIT-LOG.md` for the live-DB side of that history. This section intentionally isn't a running changelog; check git log for what's actually landed recently rather than trusting a static summary here to stay current.

## Reference folder

`Reference/` holds documents salvaged from older, now-deleted local copies of this project (multiple past dissertation iterations). It's historical context only — original requirements, use cases, old architecture docs, coding-rule files from earlier Cursor/Claude sessions — not part of the live app. Don't treat anything in there as current implementation truth; cross-check against actual `src/` code.

## Working conventions (carried over from Mr Salad's earlier project rules)

- Explain implementation choices as you go — Mr Salad is learning the stack (React/Vite/Supabase/Node), treat this as a teaching engagement, not just delivery.
- Prefer Tailwind utility classes over new CSS for styling (matches existing code).
- No TODOs/placeholders left in code; keep diffs beginner-readable.
- If a task is trivial enough that Mr Salad could do it himself meaningfully, say so instead of just doing it.
- Next phase after the app itself is working: containerizing (Docker) and CI/CD (and possibly Kubernetes) — taught hands-on, not just handed over.
