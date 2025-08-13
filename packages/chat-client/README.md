# @zemenay/chat-client

Plug‑and‑play AI chat (persistent conversations + messages) for Next.js or any Node server.

## Features
- Tiny TypeScript SDK (ESM + CJS)
- Drop-in floating `<ChatWidget />`
- Server handler factory (`createChatHandlers`) for Next.js pages API
- SQL migration for PostgreSQL / Supabase
- Zero external runtime deps

## Install
```bash
npm install @zemenay/chat-client
```

## 1. Quickstart (90‑second version)
1. Install & migrate DB
2. Add 3 API routes (or Express endpoints)
3. Drop the `<ChatWidget />` in your layout
4. Set `NEXT_PUBLIC_BASE_URL`
5. Deploy

## 2. Database Migration
Run the SQL (Supabase SQL editor or psql). The packaged file lives at: `node_modules/@zemenay/chat-client/migrations/001_init.sql`.
```sql
-- from migrations/001_init.sql
create table if not exists chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  created_at timestamp with time zone default now()
);
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references chat_conversations(id) on delete cascade,
  role text check (role in ('user','assistant')),
  content text,
  created_at timestamp with time zone default now()
);
create index if not exists idx_chat_messages_conversation_id_created_at
  on chat_messages(conversation_id, created_at);
```
## 3. API Routes (Next.js Pages Router)
Create these files: `pages/api/chat/_handlers.ts`, `start.ts`, `index.ts`, `[conversationId].ts`.
```ts
// pages/api/chat/_handlers.ts (optional consolidation)
import { createChatHandlers } from '@zemenay/chat-client/server'
import { getDbClient } from '../../lib/supabaseClient'
import { generateText } from '../../lib/gemini'
export const handlers = createChatHandlers({ db: getDbClient(true), generateText })
```
```ts
// pages/api/chat/start.ts
import { handlers } from './_handlers'
export default handlers.start
```
```ts
// pages/api/chat/index.ts
import { handlers } from './_handlers'
export default handlers.chat
```
```ts
// pages/api/chat/[conversationId].ts
import { handlers } from '../_handlers'
export default handlers.history
```
### Express / Other Server (optional)
```ts
import express from 'express'
import cors from 'cors'
import { createChatHandlers } from '@zemenay/chat-client/server'
import { db, generateText } from './deps' // implement your own

const { start, chat, history } = createChatHandlers({ db, generateText })
const app = express()
app.use(cors())
app.use(express.json())
app.post('/api/chat/start', start as any)
app.post('/api/chat', chat as any)
app.get('/api/chat/:conversationId', history as any)
app.listen(3000)
```

## 4. Add the Widget
```tsx
import { ChatWidget, ChatClient } from '@zemenay/chat-client'
const client = new ChatClient({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL! })
export function Layout({ children }) {
  return <>{children}<ChatWidget client={client} /></>
}
```

Set `NEXT_PUBLIC_BASE_URL` to your deployed origin, e.g. `https://app.example.com`.

## 5. Environment Variables
```
NEXT_PUBLIC_BASE_URL=https://your-domain.com
SUPABASE_URL=...            # server only usage inside handlers
SUPABASE_SERVICE_ROLE_KEY=...  # never expose publicly
GEMINI_API_KEY=... (or GOOGLE_API_KEY)
```

## 6. Programmatic SDK

```ts
import { ChatClient } from '@zemenay/chat-client'
const chat = new ChatClient({ baseUrl: 'https://your-app' })
const conv = await chat.startConversation('optional-user-id')
const reply = await chat.sendMessage(conv, 'Hello!')
console.log(reply.content)
```

## 7. Theming / Customization
`<ChatWidget accentColor="#2563eb" title="Q^A Assistant" startConversationLazy={false} />`

Override CSS using the generated class names (`.zcw-panel`, `.zcw-msg.user`, etc.).

## 8. Error Handling
Provide `onError` to the widget or wrap calls to `chat.sendMessage` in try/catch. Server errors respond with `{ error: "..." }` and the client surfaces them.

## 9. CORS
If frontend + API are different domains, set explicit origin instead of `*` inside your CORS middleware:
```ts
res.setHeader('Access-Control-Allow-Origin', 'https://your-frontend.com')
```

## 10. Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| 405 Method Not Allowed | Wrong HTTP verb | Ensure POST for /api/chat & /api/chat/start |
| 400 conversationId required | Missing ID in payload | Use start endpoint first or let implicit creation run |
| Generic error in widget | API returned { error } | Check server logs / model key / DB RLS |
| CORS error in browser | Missing headers | Add / adjust withCors middleware |
| Only user messages stored | Assistant insert failing | Verify DB permissions / RLS policies |

## 11. Roadmap (Optional Enhancements)
- Streaming / partial token updates
- Rate limiting & moderation hooks
- Conversation listing / deletion
- Theming via CSS variables package

## 12. Contributing
Issues & PRs welcome. Run tests/build:
```bash
npm run build
```

## 13. License
MIT
---
Questions? Open an issue or start a discussion.
