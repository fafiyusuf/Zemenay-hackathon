<<<<<<< HEAD
import { Message } from './gemini';

export interface ChatClientConfig {
  baseUrl?: string;
  apiKey?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ChatResponse {
  response: string;
  conversationId?: string;
  messageId?: string;
}

export class ChatClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: ChatClientConfig = {}) {
    this.baseUrl = config.baseUrl || (typeof window !== 'undefined' ? '' : 'http://localhost:3000');
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Start a new conversation
   * @param userId - The user ID
   * @param title - Optional conversation title
   * @returns Promise<string> - The conversation ID
   */
  async startConversation(userId: string, title?: string): Promise<string> {
    const conversation = await this.request<Conversation>('/chat/start', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, title })
    });
    return conversation.id;
  }

  /**
   * Send a message to a conversation
   * @param conversationId - The conversation ID
   * @param message - The message content
   * @param userId - The user ID
   * @returns Promise<ChatResponse> - The AI response
   */
  async sendMessage(
    conversationId: string, 
    message: string, 
    userId: string
  ): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        prompt: message,
        conversationId,
        userId
      })
    });
  }

  /**
   * Get chat history for a conversation
   * @param conversationId - The conversation ID
   * @param userId - The user ID
   * @returns Promise<ChatMessage[]> - Array of messages
   */
  async getChatHistory(conversationId: string, userId: string): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>(`/chat/${conversationId}`, {
      method: 'GET',
      body: JSON.stringify({ userId })
    });
  }

  /**
   * Update conversation title
   * @param conversationId - The conversation ID
   * @param title - New title
   * @param userId - The user ID
   * @returns Promise<Conversation> - Updated conversation
   */
  async updateConversationTitle(
    conversationId: string, 
    title: string, 
    userId: string
  ): Promise<Conversation> {
    return this.request<Conversation>(`/chat/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify({ title, userId })
    });
  }

  /**
   * Delete a conversation
   * @param conversationId - The conversation ID
   * @param userId - The user ID
   * @returns Promise<void>
   */
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    await this.request(`/chat/${conversationId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId })
    });
  }

  /**
   * Get all conversations for a user
   * @param userId - The user ID
   * @returns Promise<Conversation[]> - Array of conversations
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    // Note: This endpoint would need to be implemented in the API
    // For now, we'll throw an error
    throw new Error('getUserConversations not implemented in API yet');
  }
}

// Export default instance with default configuration
export const chatClient = new ChatClient();

// Export factory function for creating instances with custom config
export function createChatClient(config: ChatClientConfig): ChatClient {
  return new ChatClient(config);
}
=======
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
>>>>>>> da2ea298d9854f32ad5950ea73bf407d6695e00b
