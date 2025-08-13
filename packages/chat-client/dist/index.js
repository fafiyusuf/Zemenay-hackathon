export class ChatClient {
    constructor(opts) {
        if (!(opts === null || opts === void 0 ? void 0 : opts.baseUrl))
            throw new Error('baseUrl is required');
        this.baseUrl = opts.baseUrl.replace(/\/$/, '');
        this.fetcher = opts.fetchImpl || globalThis.fetch;
        if (!this.fetcher)
            throw new Error('No fetch implementation available');
        this.defaultHeaders = opts.headers || {};
    }
    async startConversation(userId) {
        const res = await this.fetcher(`${this.baseUrl}/api/chat/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...this.defaultHeaders },
            body: JSON.stringify({ user_id: userId }),
        });
        const data = await this.parse(res);
        if (!(data === null || data === void 0 ? void 0 : data.id))
            throw new Error('Conversation start response missing id');
        return data.id;
    }
    async sendMessage(conversationId, message) {
        var _a;
        if (!conversationId)
            throw new Error('conversationId required');
        if (!(message === null || message === void 0 ? void 0 : message.trim()))
            throw new Error('message required');
        const res = await this.fetcher(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...this.defaultHeaders },
            body: JSON.stringify({ conversationId, message }),
        });
        const data = await this.parse(res);
        if ((_a = data === null || data === void 0 ? void 0 : data.message) === null || _a === void 0 ? void 0 : _a.id)
            return data.message;
        if (data === null || data === void 0 ? void 0 : data.response) {
            return { id: crypto.randomUUID(), role: 'assistant', content: data.response, conversation_id: conversationId };
        }
        throw new Error('Unexpected sendMessage response shape');
    }
    async getChatHistory(conversationId) {
        if (!conversationId)
            throw new Error('conversationId required');
        const res = await this.fetcher(`${this.baseUrl}/api/chat/${encodeURIComponent(conversationId)}`, {
            method: 'GET',
            headers: { ...this.defaultHeaders },
        });
        const data = await this.parse(res);
        if (!Array.isArray(data))
            throw new Error('History response expected array');
        return data;
    }
    async parse(res) {
        let payload = null;
        const text = await res.text().catch(() => '');
        try {
            payload = text ? JSON.parse(text) : null;
        }
        catch { /* ignore */ }
        if (!res.ok) {
            const msg = (payload === null || payload === void 0 ? void 0 : payload.error) || (payload === null || payload === void 0 ? void 0 : payload.message) || res.statusText || 'Request failed';
            throw new Error(msg);
        }
        return payload;
    }
}
export function createChatClient(options) {
    return new ChatClient(options);
}
export default ChatClient;
export { ChatWidget } from './ChatWidget';
