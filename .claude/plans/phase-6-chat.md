# Phase 6 — Chat: Stream → Supabase Realtime

**Status: not started.** See [00-STATUS.md](00-STATUS.md) for repo traps and the validation gate.
Chat is intentionally dead until this phase — do not "fix" Stream connection errors earlier.

**Migration numbering note**: `0006` went to an out-of-band data seed (`0006_seed_webnovel_communities.sql`,
2026-08-30 - popular web-novel communities, unrelated to this phase). Chat's schema migration is
`0007_chat.sql`, not `0006_chat.sql` as originally numbered below.

### Task 6.1: Schema
- **Action**: `supabase/migrations/0007_chat.sql`:
  `conversations(id uuid pk default gen_random_uuid(), is_group boolean default false, name text, created_by uuid references profiles, created_at timestamptz default now())`;
  `conversation_members(conversation_id uuid references conversations on delete cascade, user_id uuid references profiles on delete cascade, joined_at timestamptz default now(), primary key(conversation_id, user_id))`;
  `messages(id uuid pk default gen_random_uuid(), conversation_id uuid references conversations on delete cascade, sender_id uuid references profiles, content text not null, created_at timestamptz default now())`.
  RLS: members-only read/write (exists check on conversation_members).
  `alter publication supabase_realtime add table messages;`
- **Validate**: SQL clean; RLS blocks non-members (test with 2 accounts in SQL editor).

### Task 6.2: Client
- **Action**: new `src/services/chatService.js`: getOrCreateDirectConversation(a,b), sendMessage,
  useMessages(conversationId) hook subscribing via
  `supabase.channel(...).on('postgres_changes', {event:'INSERT', table:'messages', filter:`conversation_id=eq.${id}`})`.
  Rebuild `pages/ChatRooms.jsx` + `components/chat/Conversation.jsx` on the Phase 2 primitives
  (conversation list + message thread + composer). Group chat = same tables with is_group, creation
  from `CreateGroupChat.jsx` (rewire, keep UI).
- **Validate**: two browsers, two accounts, live message delivery both ways; group chat with 3 accounts.

### Task 6.3: Excise Stream
- **Action**: `npm rm stream-chat stream-chat-react`; delete `services/streamClient.js`,
  `services/tokenGeneration.js`, token-server script from `package.json`, `ChatContext` stream logic
  (replace with conversation state or delete if redundant); remove Stream CSS import; grep `stream`
  case-insensitive across src to catch stragglers (note: `LoadingIndicator` from stream-chat-react is
  imported in CommunityView.jsx, CommentSection.jsx, AND RecommendedCommunities.jsx — the third one
  found while building Phase 3, missed in this task's original scope — replace all three with
  ui/Skeleton). Update
  `acceptFriendRequest` in database.js: replace Stream channel creation with
  `getOrCreateDirectConversation`.
- **Validate**: build green; bundle main chunk shrinks (was ~1.96MB); all chat + friend-accept flows
  work; no `:3001` requests anywhere.
