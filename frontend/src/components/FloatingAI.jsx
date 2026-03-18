import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';

export default function FloatingAI({ currentNote }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Dragging logic
  const onMouseDown = (e) => {
    if (e.target.closest('.ai-chat-panel')) return;
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging) return;
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(p => [...p, { role: 'user', text: q }]);
    setLoading(true);
    try {
      let res;
      if (currentNote) {
        res = await aiAPI.ask(currentNote.id, q);
        setMessages(p => [...p, { role: 'ai', text: res.data.answer }]);
      } else {
        res = await aiAPI.clarify(q);
        setMessages(p => [...p, { role: 'ai', text: res.data.answer }]);
      }
    } catch(e) {
      setMessages(p => [...p, { role: 'ai', text: '❌ AI unavailable. Check your GEMINI_API_KEY in .env', error: true }]);
    } finally { setLoading(false); }
  };

  const quickQ = ['Summarize this topic', 'Give me key points', 'Explain in simple terms', 'What are important questions?'];

  const fabStyle = pos.x || pos.y
    ? { position: 'fixed', left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' }
    : {};

  return (
    <>
      {/* FAB Button */}
      <div
        ref={dragRef}
        className="ai-fab"
        style={fabStyle}
        onMouseDown={onMouseDown}
        onClick={() => !dragging && setOpen(v => !v)}
        title="AI Study Assistant"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M12 2a10 10 0 1 0 10 10"/>
          <path d="m16 8 2 2 4-4"/>
        </svg>
      </div>

      {/* Chat Panel */}
      {open && (
        <div className="ai-chat-panel fixed bottom-24 right-6 w-80 sm:w-96 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: '70vh' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10"/><path d="m16 8 2 2 4-4"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-sm">AI Study Assistant</p>
                {currentNote && <p className="text-white/70 text-[10px] truncate max-w-[160px]">{currentNote.title}</p>}
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
            {messages.length === 0 && (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p className="t-muted text-xs mb-3">{currentNote ? `Ask about "${currentNote.title}"` : 'Ask me anything!'}</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {quickQ.map(q => (
                    <button key={q} onClick={() => setInput(q)}
                      className="text-[10px] px-2.5 py-1.5 rounded-full border t-border t-muted hover:text-indigo-400 hover:border-indigo-400/40 transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'} gap-2`}>
                {m.role === 'ai' && (
                  <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                      <path d="M12 2a10 10 0 1 0 10 10"/>
                    </svg>
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2 text-xs rounded-2xl leading-relaxed whitespace-pre-line
                  ${m.role==='user' ? 'bubble-sent' : m.error ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bubble-recv'}`}>
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                </div>
                <div className="bubble-recv px-3 py-2">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-current rounded-full animate-bounce opacity-60"
                        style={{animationDelay:`${i*150}ms`}}/>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex gap-2 p-3 border-t flex-shrink-0" style={{borderColor:'var(--border)'}}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 t-input rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-indigo-500/50 transition-all"
            />
            <button type="submit" disabled={!input.trim() || loading}
              className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m22 2-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
