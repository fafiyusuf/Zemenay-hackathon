/** Chat Client SDK (packaged) */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  conversation_id?: string
  created_at?: string
}

export interface ChatClientOptions {
  baseUrl: string
  fetchImpl?: typeof fetch
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

  async sendMessage(conversationId: string, message: string): Promise<ChatMessage> {
    if (!conversationId) throw new Error('conversationId required')
    if (!message?.trim()) throw new Error('message required')
    const res = await this.fetcher(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.defaultHeaders },
      body: JSON.stringify({ conversationId, message }),
    })
    const data = await this.parse(res)
    if (data?.message?.id) return data.message as ChatMessage
    if (data?.response) {
      return { id: crypto.randomUUID(), role: 'assistant', content: data.response, conversation_id: conversationId }
    }
    throw new Error('Unexpected sendMessage response shape')
  }

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

export function createChatClient(options: ChatClientOptions) {
  return new ChatClient(options)
}

export default ChatClient
export { ChatWidget } from './ChatWidget'

