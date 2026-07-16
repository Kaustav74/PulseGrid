'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/data/store';

export default function ChatWidget() {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatHistory = useAppStore(s => s.chatHistory);
  const addChatMessage = useAppStore(s => s.addChatMessage);
  const chatbotOpen = useAppStore(s => s.chatbotOpen);
  const setChatbotOpen = useAppStore(s => s.setChatbotOpen);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg = { role: 'user' as const, content: input };
    addChatMessage(userMsg);
    setInput('');
    setSending(true);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [...chatHistory, userMsg] }) });
      if (!res.ok) throw new Error('API missing');
      const data = await res.json();
      addChatMessage({ role: 'assistant', content: data.reply || 'Unable to respond.' });
    } catch { addChatMessage({ role: 'assistant', content: 'Chatbot endpoint not implemented yet. (Missing /api/chat)' }); }
    setSending(false);
  };

  return (
    <>
      <button onClick={() => setChatbotOpen(!chatbotOpen)} className="fixed bottom-6 right-6 w-14 h-14 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition z-50">
        <span className="text-2xl material-symbols-outlined">chat</span>
      </button>
      {chatbotOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-surface-container-low rounded-xl shadow-2xl flex flex-col z-50 border border-surface-container-highest">
          <div className="flex items-center justify-between p-3 border-b border-surface-container-highest">
            <span className="font-bold text-secondary font-mono text-xs tracking-wider">AI ASSISTANT</span>
            <button onClick={() => setChatbotOpen(false)} className="text-on-surface-variant hover:text-on-surface">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface'}`}>{msg.content}</div>
              </div>
            ))}
            {sending && <div className="text-on-surface-variant text-sm animate-pulse">Assistant typing...</div>}
          </div>
          <div className="p-3 border-t border-surface-container-highest">
            <div className="flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask about patients..." className="flex-1 bg-surface-container-lowest border border-surface-container-highest rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-outline-variant transition-colors" />
              <button onClick={sendMessage} disabled={sending} className="bg-secondary text-on-secondary px-3 py-2 rounded text-sm font-bold hover:bg-secondary-fixed transition">SEND</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
