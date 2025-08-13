import React, { useEffect, useRef, useState } from 'react';
export const ChatWidget = ({ client, welcomeText = 'Ask me anything.', placeholder = 'Type your message…', title = 'Chat Assistant', accentColor = '#000', className = '', startConversationLazy = true, onError, }) => {
    const [open, setOpen] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);
    useEffect(() => { var _a; (_a = endRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);
    async function ensureConversation() {
        if (conversationId)
            return conversationId;
        const id = await client.startConversation().catch(err => { onError === null || onError === void 0 ? void 0 : onError(err); throw err; });
        setConversationId(id);
        return id;
    }
    async function send(e) {
        e === null || e === void 0 ? void 0 : e.preventDefault();
        const text = input.trim();
        if (!text || loading)
            return;
        setInput('');
        const userMsg = { id: crypto.randomUUID(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        try {
            const conv = await ensureConversation();
            const reply = await client.sendMessage(conv, text);
            setMessages(prev => [...prev, { id: reply.id, role: reply.role, content: reply.content }]);
        }
        catch (err) {
            onError === null || onError === void 0 ? void 0 : onError(err);
            setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Error. Please retry.' }]);
        }
        finally {
            setLoading(false);
        }
    }
    async function handleOpen() {
        setOpen(true);
        if (!startConversationLazy && !conversationId) {
            try {
                await ensureConversation();
            }
            catch { }
        }
    }
    return (<>
      {!open && (<button onClick={handleOpen} style={{ background: accentColor }} className={`zcw-launch-btn ${className}`}>Chat</button>)}
      {open && <div className="zcw-overlay" onClick={() => setOpen(false)}/>}
      <div className={`zcw-panel ${open ? 'open' : ''} ${className}`}>
        <div className="zcw-header">{title}<button onClick={() => setOpen(false)}>×</button></div>
        <div className="zcw-messages">
          {messages.length === 0 && <div className="zcw-empty">{welcomeText}</div>}
          {messages.map(m => <div key={m.id} className={`zcw-msg ${m.role}`}>{m.content}</div>)}
          {loading && <div className="zcw-loading">Thinking…</div>}
          <div ref={endRef}/>
        </div>
        <form onSubmit={send} className="zcw-input-row">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder={placeholder}/>
          <button disabled={!input.trim() || loading}>Send</button>
        </form>
      </div>
      <style>{`
        .zcw-launch-btn { position:fixed; bottom:24px; right:24px; color:#fff; border:none; padding:14px 18px; border-radius:999px; font-weight:600; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,.15); }
        .zcw-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); }
        .zcw-panel { position:fixed; bottom:24px; right:24px; width:340px; max-height:520px; background:#fff; border:1px solid #e5e5e5; border-radius:16px; display:flex; flex-direction:column; transform:translateY(20px); opacity:0; pointer-events:none; transition:all .25s ease; font:14px system-ui, sans-serif; }
        .zcw-panel.open { transform:translateY(0); opacity:1; pointer-events:auto; }
        .zcw-header { display:flex; justify-content:space-between; align-items:center; padding:10px 14px; font-weight:600; border-bottom:1px solid #eee; }
        .zcw-header button { background:none; border:none; font-size:18px; cursor:pointer; }
        .zcw-messages { flex:1; overflow:auto; padding:12px; display:flex; flex-direction:column; gap:8px; }
        .zcw-msg { max-width:80%; padding:8px 10px; border-radius:12px; line-height:1.4; white-space:pre-wrap; }
        .zcw-msg.user { margin-left:auto; background:${accentColor}; color:#fff; }
        .zcw-msg.assistant { margin-right:auto; background:#f2f2f2; }
        .zcw-empty { color:#777; font-size:12px; }
        .zcw-loading { color:#999; font-size:12px; }
        .zcw-input-row { display:flex; gap:6px; padding:10px; border-top:1px solid #eee; }
        .zcw-input-row input { flex:1; border:1px solid #ccc; border-radius:8px; padding:8px 10px; font:inherit; }
        .zcw-input-row button { background:${accentColor}; color:#fff; border:none; padding:8px 14px; border-radius:8px; font-weight:600; cursor:pointer; }
        .zcw-input-row button:disabled { opacity:.5; cursor:not-allowed; }
      `}</style>
    </>);
};
export default ChatWidget;
