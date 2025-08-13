/** Chat Client SDK (packaged) */
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    conversation_id?: string;
    created_at?: string;
}
export interface ChatClientOptions {
    baseUrl: string;
    fetchImpl?: typeof fetch;
    headers?: Record<string, string>;
}
export declare class ChatClient {
    private baseUrl;
    private fetcher;
    private defaultHeaders;
    constructor(opts: ChatClientOptions);
    startConversation(userId?: string): Promise<string>;
    sendMessage(conversationId: string, message: string): Promise<ChatMessage>;
    getChatHistory(conversationId: string): Promise<ChatMessage[]>;
    private parse;
}
export declare function createChatClient(options: ChatClientOptions): ChatClient;
export default ChatClient;
export { ChatWidget } from './ChatWidget';
