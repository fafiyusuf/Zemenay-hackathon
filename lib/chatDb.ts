import { getDbClient } from './supabaseClient';
import { Message } from './gemini';

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

export class ChatDatabase {
  private db = getDbClient(true);

  // Create a new conversation
  async createConversation(userId: string, title?: string): Promise<Conversation> {
    const { data, error } = await this.db
      .from('chat_conversations')
      .insert({ 
        user_id: userId, 
        title: title || `Conversation ${new Date().toLocaleString()}` 
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Get conversation by ID
  async getConversation(conversationId: string, userId: string): Promise<Conversation | null> {
    const { data, error } = await this.db
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  }

  // Get all conversations for a user
  async getUserConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await this.db
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Add a message to a conversation
  async addMessage(
    conversationId: string, 
    userId: string, 
    role: 'user' | 'assistant' | 'system', 
    content: string,
    metadata?: Record<string, any>
  ): Promise<ChatMessage> {
    const { data, error } = await this.db
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        role,
        content,
        metadata: metadata || {}
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Get conversation history
  async getConversationHistory(conversationId: string, userId: string): Promise<ChatMessage[]> {
    const { data, error } = await this.db
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Get conversation history as Message[] for AI context
  async getConversationHistoryForAI(conversationId: string, userId: string): Promise<Message[]> {
    const messages = await this.getConversationHistory(conversationId, userId);
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  // Update conversation title
  async updateConversationTitle(conversationId: string, userId: string, title: string): Promise<Conversation> {
    const { data, error } = await this.db
      .from('chat_conversations')
      .update({ title })
      .eq('id', conversationId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Delete conversation (soft delete)
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const { error } = await this.db
      .from('chat_conversations')
      .update({ is_active: false })
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}

// Export singleton instance
export const chatDb = new ChatDatabase();
