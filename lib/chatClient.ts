/**
 * Lightweight TypeScript chat SDK for this project.
 *
 * Features:
 * - startConversation(): POST /api/chat/start -> returns conversation id
 * - sendMessage(): POST /api/chat -> returns assistant message
 * - getChatHistory(): GET /api/chat/:conversationId -> returns message list
 * - Base URL configurable (dev / staging / prod)
 */

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  conversation_id?: string
  created_at?: string
}

export interface ChatClientOptions {
  /** Base URL to your deployed Next.js app (e.g. https://dev.example.com). Can include or omit trailing slash. */
  baseUrl: string
  /** Optional fetch implementation (for tests / non-browser environments). Defaults to global fetch. */
  fetchImpl?: typeof fetch
  /** Optional default headers appended to every request. */
  headers?: Record<string, string>
}

export class ChatClient {
  private baseUrl: string
  private fetcher: typeof fetch
  private defaultHeaders: Record<string, string>

  constructor(opts: ChatClientOptions) {
    if (!opts?.baseUrl) throw new Error('baseUrl is required')
    this.baseUrl = opts.baseUrl.replace(/\/$/, '')
    this.fetcher = opts.fetchImpl || (globalThis as any).fetch
    if (!this.fetcher) throw new Error('No fetch implementation available')
    this.defaultHeaders = opts.headers || {}
  }

  /** Starts a new conversation and returns its id. */
  async startConversation(userId?: string): Promise<string> {
    const res = await this.fetcher(`${this.baseUrl}/api/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.defaultHeaders },
      body: JSON.stringify({ user_id: userId }),
    })
    const data = await this.parse(res)
    if (!data?.id) throw new Error('Conversation start response missing id')
    return data.id
  }

  /** Sends a user message and returns the assistant reply (Message shape). */
  async sendMessage(conversationId: string, message: string): Promise<ChatMessage> {
    if (!conversationId) throw new Error('conversationId required')
    if (!message?.trim()) throw new Error('message required')
    const res = await this.fetcher(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.defaultHeaders },
      body: JSON.stringify({ conversationId, message }),
    })
    const data = await this.parse(res)
    // Prefer returned structured message; fall back to building one from text
    if (data?.message?.id) return data.message as ChatMessage
    if (data?.response) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        conversation_id: conversationId,
      }
    }
    throw new Error('Unexpected sendMessage response shape')
  }

  /** Fetches all messages in a conversation (oldest first). */
  async getChatHistory(conversationId: string): Promise<ChatMessage[]> {
    if (!conversationId) throw new Error('conversationId required')
    const res = await this.fetcher(`${this.baseUrl}/api/chat/${encodeURIComponent(conversationId)}`, {
      method: 'GET',
      headers: { ...this.defaultHeaders },
    })
    const data = await this.parse(res)
    if (!Array.isArray(data)) throw new Error('History response expected array')
    return data as ChatMessage[]
  }

  private async parse(res: Response): Promise<any> {
    let payload: any = null
    const text = await res.text().catch(() => '')
    try { payload = text ? JSON.parse(text) : null } catch { /* ignore */ }
    if (!res.ok) {
      const msg = payload?.error || payload?.message || res.statusText || 'Request failed'
      throw new Error(msg)
    }
    return payload
  }
}

/** Convenience factory */
export function createChatClient(options: ChatClientOptions) {
  return new ChatClient(options)
}

export default ChatClient
