# Zemenay Hackathon

## Overview
AI chat assistant with persistent conversations backed by Supabase + Gemini.

You can use it in two ways:
1. In‑repo implementation (current app) – useful for hacking.
2. Plug‑and‑play npm package `@zemenay/chat-client` – drop into any Next.js project in minutes.

## Built‑In Chat Widget (legacy in this repo)
- Floating Q^A chat button appears bottom-right on all pages.
- Originally called `POST /api/chat` with `{ prompt }`; now supports conversation persistence.

## Environment
Create `.env.local` with one of:

```
GEMINI_API_KEY=your_gemini_key
# or
GOOGLE_API_KEY=your_gemini_key
```

Restart dev server after changes.

## Plug & Play Package (@zemenay/chat-client)
The packaged SDK + UI lives in `packages/chat-client` and ships these pieces:
- `ChatClient` (programmatic API)
- `<ChatWidget />` floating assistant component
- `createChatHandlers` (server handler factory for Next.js pages API)
- SQL migration (`migrations/001_init.sql`)

### 5‑Step Quickstart (TL;DR)
1. Install: `npm install @zemenay/chat-client`
2. Run migration SQL (or skip if tables already exist) from: `node_modules/@zemenay/chat-client/migrations/001_init.sql`
3. Wire handlers: create `pages/api/chat/_handlers.ts` with `createChatHandlers({ db, generateText, systemPrompt })` and export `start`, `chat`, `history` routes.
4. Add widget: `<ChatWidget client={new ChatClient({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL! })} />` in your layout.
5. Test: Send a message; check messages persisted in `chat_messages` table.

### Quickstart (in a fresh Next.js app)
```
npm install @zemenay/chat-client
```
Run the SQL (Supabase SQL editor or psql) from `node_modules/@zemenay/chat-client/migrations/001_init.sql`. (Skip if tables already exist.)

Add API route handlers (pages directory example):
```ts
// pages/api/chat/_handlers.ts
import { createChatHandlers } from '@zemenay/chat-client/server'
import { getDbClient } from '../lib/supabaseClient' // adjust path
import { generateText } from '../lib/gemini'
export const handlers = createChatHandlers({ db: getDbClient(true), generateText, systemPrompt: 'You are a helpful assistant.' })
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
import { handlers } from './_handlers'
export default handlers.history
```

Place the widget (e.g. in `_app.tsx` or layout):
```tsx
import { ChatWidget, ChatClient } from '@zemenay/chat-client'
const client = new ChatClient({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000' })

export default function App({ Component, pageProps }) {
	return <>
		<Component {...pageProps} />
		<ChatWidget client={client} accentColor="#2563eb" />
	</>
}
```

Programmatic usage:
```ts
import { ChatClient } from '@zemenay/chat-client'
const chat = new ChatClient({ baseUrl: 'http://localhost:3000' })
const conv = await chat.startConversation()
const reply = await chat.sendMessage(conv, 'Hello!')
console.log(reply.content)
```

### Theming & Customization
- Change primary color via `accentColor` prop.
- Override styles by targeting `.zcw-*` classes.
- Supply `systemPrompt` via `createChatHandlers` options.

### Roadmap (nice-to-haves)
- CORS + rate limit helper middleware
- Streaming responses (SSE)
- Theming tokens & dark mode auto-detect
- Analytics/hooks (onMessagePersist)

## In-Repo Chat Client Wrapper (legacy)
The original single-file wrapper still exists at `lib/chatClient.ts` (useful before installing the package). It exposes the same three core methods.

### Local Installation (legacy mode)
Copy `lib/chatClient.ts` into another project if you prefer not to install from npm.

### Import
```ts
import { ChatClient, createChatClient } from './lib/chatClient'
```

### API

#### createChatClient(options)
Factory returning a `ChatClient` instance.
Options:
- `baseUrl: string` Base URL of the deployment (e.g. `http://localhost:3000` or `https://app.example.com`). Trailing slash optional.
- `fetchImpl?: typeof fetch` Custom fetch (useful for Node tests / polyfills).
- `headers?: Record<string,string>` Extra headers sent with every request.

#### client.startConversation(userId?: string): Promise<string>
POST `/api/chat/start` → creates a new conversation row and returns its id.

#### client.sendMessage(conversationId: string, message: string): Promise<ChatMessage>
POST `/api/chat` with `{ conversationId, message }` → persists user & assistant messages and returns the assistant reply.

#### client.getChatHistory(conversationId: string): Promise<ChatMessage[]>
GET `/api/chat/:conversationId` → returns an array of messages (oldest first).

### Types
```ts
interface ChatMessage {
	id: string
	role: 'user' | 'assistant'
	content: string
	conversation_id?: string
	created_at?: string
}
```

### Usage Example
```ts
import { createChatClient } from './lib/chatClient'

const chat = createChatClient({ baseUrl: 'http://localhost:3000' })

async function demo() {
	const conversationId = await chat.startConversation()
	const reply = await chat.sendMessage(conversationId, 'How do I create a blog post?')
	console.log('Assistant:', reply.content)
	const history = await chat.getChatHistory(conversationId)
	console.log('History messages:', history.length)
}

demo()
```

### Testing
Run a lightweight test (uses a mocked fetch):
```
npm run test
```
Output should include `All chatClient tests passed.`

### Environment Notes
The chat API stores conversation & messages in Supabase tables (`chat_conversations`, `chat_messages`). Ensure these tables exist with columns: `id uuid pk`, `user_id uuid?`, `created_at timestamptz default now()`, and for messages: `id uuid pk`, `conversation_id uuid fk`, `role text`, `content text`, `created_at timestamptz default now()`.

If using a Service Role key the server will persist messages automatically via the updated API routes.