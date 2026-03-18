import React, { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../services/api';

export default function AIModal({ note, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    aiAPI.getHistory(note.id).then(r => {
      const hist = r.data.chats || [];
      const msgs = [];
      hist.forEach(c => {
        msgs.push({ role:'user', text: c.question });
        msgs.push({ role:'ai',   text: c.answer });
      });
      setMessages(msgs);
    }).catch(() => {});
  }, [note.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const r = await aiAPI.summarize(note.id);
      setSummary(r.data.summary);
    } catch(e) {
      setSummary('❌ Failed to generate summary. Please check your GEMINI_API_KEY in .env');
    } finally { setSummarizing(false); }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(p => [...p, { role:'user', text: q }]);
    setLoading(true);
    try {
      const r = await aiAPI.ask(note.id, q);
      setMessages(p => [...p, { role:'ai', text: r.data.answer }]);
    } catch(e) {
      setMessages(p => [...p, { role:'ai', text: '❌ AI unavailable. Check GEMINI_API_KEY in .env', error: true }]);
    } finally { setLoading(false); }
  };

  const quickQ = ['Summarize the key points', 'What are the main concepts?', 'Give me an example', 'Explain in simple terms'];

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10"/><path d="m16 8 2 2 4-4"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">AI Study Assistant</p>
              <p className="text-gray-400 text-xs truncate max-w-[200px]">{note.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Summary */}
        <div className="px-5 pt-4 pb-3 border-b border-white/5 flex-shrink-0">
          {summary ? (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 max-h-36 overflow-y-auto">
              <p className="text-yellow-400 text-xs font-bold mb-1.5">📋 AI Summary</p>
              <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-line">{summary}</p>
            </div>
          ) : (
            <button onClick={handleSummarize} disabled={summarizing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-yellow-500/30 text-yellow-400 text-sm hover:bg-yellow-500/10 transition-colors disabled:opacity-60">
              {summarizing
                ? <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Generating...</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h8M4 18h12"/></svg> Generate Summary & Key Points</>
              }
            </button>
          )}
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 min-h-0">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-4">Ask me anything about this note!</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickQ.map(q => (
                  <button key={q} onClick={() => setInput(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-400 hover:border-yellow-500/40 hover:text-yellow-400 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'} gap-2`}>
              {m.role==='ai' && (
                <div className="w-7 h-7 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10"/></svg>
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed
                ${m.role==='user' ? 'bg-blue-600 text-white rounded-br-sm'
                  : m.error ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-white/10 text-gray-200 rounded-bl-sm'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start gap-2">
              <div className="w-7 h-7 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              </div>
              <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                {[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:`${i*150}ms`}}/>)}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <form onSubmit={handleAsk} className="px-5 py-4 border-t border-white/10 flex gap-2 flex-shrink-0">
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask a question about this note..."
            className="flex-1 bg-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm border border-white/10 focus:outline-none focus:border-yellow-500/50 transition-all"/>
          <button type="submit" disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-yellow-500 text-gray-900 rounded-xl font-semibold text-sm hover:bg-yellow-400 transition-colors disabled:opacity-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
