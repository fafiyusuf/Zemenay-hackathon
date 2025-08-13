function defaultSystemPrompt() {
    return 'You are a helpful assistant.';
}
function createChatHandlers(opts) {
    const system = opts.systemPrompt || defaultSystemPrompt();
    async function start(req, res) {
        if (req.method !== 'POST') {
            res.setHeader('Allow', 'POST');
            return res.status(405).end();
        }
        const { user_id } = req.body || {};
        try {
            const { data, error } = await opts.db.from('chat_conversations').insert({ user_id }).select('*').single();
            if (error)
                throw error;
            res.status(201).json(data);
        }
        catch (e) {
            res.status(500).json({ error: e.message || 'Failed to start' });
        }
    }
    async function chat(req, res) {
        if (req.method !== 'POST') {
            res.setHeader('Allow', 'POST');
            return res.status(405).end();
        }
        try {
            let { conversationId, message, prompt } = req.body || {};
            if (!message && prompt)
                message = prompt;
            if (!conversationId) {
                const { data: conv, error: convErr } = await opts.db.from('chat_conversations').insert({}).select('id').single();
                if (convErr)
                    throw convErr;
                conversationId = conv.id;
            }
            if (!message)
                return res.status(400).json({ error: 'message required' });
            await opts.db.from('chat_messages').insert({ conversation_id: conversationId, role: 'user', content: message });
            const reply = await opts.generateText(message, { systemInstruction: system });
            const { data: inserted, error } = await opts.db.from('chat_messages').insert({ conversation_id: conversationId, role: 'assistant', content: reply }).select('*').single();
            if (error)
                throw error;
            res.status(200).json({ message: inserted, conversationId });
        }
        catch (e) {
            res.status(500).json({ error: e.message || 'Failed to process chat' });
        }
    }
    async function history(req, res) {
        const { conversationId } = req.query;
        if (!conversationId || typeof conversationId !== 'string')
            return res.status(400).json({ error: 'conversationId required' });
        if (req.method !== 'GET') {
            res.setHeader('Allow', 'GET');
            return res.status(405).end();
        }
        try {
            const { data, error } = await opts.db.from('chat_messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
            if (error)
                throw error;
            res.status(200).json(data);
        }
        catch (e) {
            res.status(500).json({ error: e.message || 'Failed to fetch history' });
        }
    }
    return { start, chat, history };
}

module.exports = { createChatHandlers, default: typeof __default!=='undefined'?__default:undefined };
