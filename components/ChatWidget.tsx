"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    const prompt = input.trim();
    if (!prompt || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await resp.json();
      const text = data.response || data.error || "Sorry, something went wrong.";
      const aiMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: text };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const aiMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: "Network error. Please try again." };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button (hidden when open) */}
      {!open && (
        <button
          aria-label="Open chat"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-black text-white shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black flex items-center justify-center text-sm font-semibold"
        >
          Q^A
        </button>
      )}

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />
      )}

      {/* Chat panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed z-50 bottom-6 right-6 w-[90vw] max-w-sm rounded-xl border bg-white shadow-xl transition-transform ${open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"}`}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="font-semibold">Q^A Assistant</div>
          <button aria-label="Close" onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-80 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-sm text-gray-500">Ask me anything about the site.</div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"}`}>
              <div className={`${m.role === "user" ? "bg-black text-white" : "bg-gray-100"} rounded-lg px-3 py-2 text-sm whitespace-pre-wrap`}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="text-xs text-gray-400">Thinking…</div>
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={sendMessage} className="flex items-center gap-2 border-t p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-1 rounded-md bg-black px-3 py-2 text-white text-sm disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>
      </div>
    </>
  );
}
