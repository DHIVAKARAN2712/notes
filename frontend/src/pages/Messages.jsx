import React, { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const timeAgo = (d) => {
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff/60000);
  if (m<1) return 'just now';
  if (m<60) return `${m}m`;
  const h = Math.floor(m/60);
  if (h<24) return `${h}h`;
  return new Date(d).toLocaleDateString();
};

export default function Messages() {
  const { user, isAdmin } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showContacts, setShowContacts] = useState(false);
  const [searchContact, setSearchContact] = useState('');
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    messagesAPI.getContacts().then(r => setContacts(r.data.users||[])).catch(()=>{});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 5s
  useEffect(() => {
    if (!activeConvo) return;
    pollRef.current = setInterval(() => {
      messagesAPI.getMessages(activeConvo.conversation_id)
        .then(r => setMessages(r.data.messages||[]))
        .catch(()=>{});
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [activeConvo]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const r = await messagesAPI.getConversations();
      setConversations(r.data.conversations||[]);
    } catch(e){} finally { setLoading(false); }
  };

  const openConversation = async (convo) => {
    setActiveConvo(convo);
    clearInterval(pollRef.current);
    try {
      const r = await messagesAPI.getMessages(convo.conversation_id);
      setMessages(r.data.messages||[]);
    } catch(e){}
    fetchConversations(); // refresh unread counts
  };

  const startNewChat = async (contact) => {
    setShowContacts(false);
    const tempConvo = {
      conversation_id: `conv_${Math.min(user.id, contact.id)}_${Math.max(user.id, contact.id)}`,
      receiver_id: contact.id,
      receiver_name: contact.name,
      receiver_role: contact.role,
      sender_id: user.id,
      content: '',
      is_new: true
    };
    setActiveConvo(tempConvo);
    setMessages([]);
    // Check if existing conversation
    try {
      const r = await messagesAPI.getMessages(tempConvo.conversation_id);
      setMessages(r.data.messages||[]);
    } catch(e){}
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || sending || !activeConvo) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      const receiverId = activeConvo.sender_id === user.id ? activeConvo.receiver_id : activeConvo.sender_id;
      const r = await messagesAPI.send({
        receiver_id: receiverId || activeConvo.receiver_id,
        content,
        conversation_id: activeConvo.conversation_id
      });
      setMessages(p => [...p, r.data.message]);
      if (activeConvo.is_new) {
        setActiveConvo(prev => ({ ...prev, is_new: false }));
        fetchConversations();
      }
    } catch(e){ alert(e.response?.data?.message||'Failed to send'); }
    finally { setSending(false); }
  };

  const getOtherPerson = (convo) => {
    if (!convo) return {};
    if (convo.sender_id === user.id) return { name: convo.receiver_name, role: convo.receiver_role, avatar: convo.receiver_avatar };
    return { name: convo.sender_name, role: convo.sender_role, avatar: convo.sender_avatar };
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.email.toLowerCase().includes(searchContact.toLowerCase())
  );

  const otherPerson = getOtherPerson(activeConvo);

  return (
    <div className="flex-1 flex overflow-hidden t-bg">
      {/* Left: Conversation List */}
      <div className={`${activeConvo ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r flex-shrink-0`}
        style={{borderColor:'var(--border)'}}>

        {/* Header */}
        <div className="px-4 py-4 border-b flex items-center justify-between flex-shrink-0" style={{borderColor:'var(--border)'}}>
          <div>
            <h1 className="t-text font-bold text-lg">Messages</h1>
            <p className="t-muted text-xs">{conversations.length} conversations</p>
          </div>
          <button onClick={() => setShowContacts(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="skeleton w-10 h-10 rounded-full"/>
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-24 rounded"/>
                    <div className="skeleton h-3 w-full rounded"/>
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{background:'var(--bg-input)'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="t-muted">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <p className="t-text font-semibold text-sm">No conversations yet</p>
              <p className="t-muted text-xs mt-1">Click New to start a chat</p>
            </div>
          ) : conversations.map(convo => {
            const other = getOtherPerson(convo);
            const isActive = activeConvo?.conversation_id === convo.conversation_id;
            return (
              <button key={convo.conversation_id||convo.id} onClick={() => openConversation(convo)}
                className={`w-full text-left px-4 py-3.5 border-b transition-colors ${isActive ? 'bg-blue-500/10' : 't-hover'}`}
                style={{borderColor:'var(--border)'}}>
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold
                      ${other.role==='admin' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-purple-400 to-pink-500'}`}>
                      {other.name?.[0]?.toUpperCase()||'?'}
                    </div>
                    {convo.unread_count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                        {convo.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="t-text text-sm font-semibold truncate">{other.name}</p>
                      <span className="t-muted text-[10px] flex-shrink-0 ml-2">{timeAgo(convo.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {other.role === 'admin' && (
                        <span className="text-[9px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full font-semibold">Admin</span>
                      )}
                      <p className="t-muted text-xs truncate">{convo.content}</p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Chat Window */}
      {activeConvo ? (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Chat header */}
          <div className="px-5 py-3.5 border-b flex items-center gap-3 flex-shrink-0" style={{borderColor:'var(--border)'}}>
            <button onClick={() => setActiveConvo(null)} className="md:hidden p-1.5 t-muted hover:t-text rounded-lg t-hover">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0
              ${otherPerson.role==='admin' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-purple-400 to-pink-500'}`}>
              {otherPerson.name?.[0]?.toUpperCase()||'?'}
            </div>
            <div>
              <p className="t-text font-semibold text-sm">{otherPerson.name}</p>
              <p className="t-muted text-xs capitalize">{otherPerson.role}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <p className="t-muted text-sm">Start the conversation!</p>
              </div>
            )}
            {messages.map((m, i) => {
              const isMine = m.sender_id === user.id;
              return (
                <div key={m.id||i} className={`flex ${isMine?'justify-end':'justify-start'} gap-2`}>
                  {!isMine && (
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold mt-0.5
                      ${m.sender_role==='admin' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-purple-400 to-pink-500'}`}>
                      {m.sender_name?.[0]?.toUpperCase()||'?'}
                    </div>
                  )}
                  <div className={`max-w-[70%] flex flex-col ${isMine?'items-end':'items-start'}`}>
                    {!isMine && <p className="t-muted text-[10px] mb-1 px-1">{m.sender_name}</p>}
                    <div className={`px-3.5 py-2.5 text-sm leading-relaxed ${isMine?'bubble-sent':'bubble-recv'}`}>
                      {m.content}
                    </div>
                    <p className="t-muted text-[10px] mt-1 px-1">{timeAgo(m.created_at)}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="px-4 py-3.5 border-t flex gap-2 flex-shrink-0" style={{borderColor:'var(--border)'}}>
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder={`Message ${otherPerson.name}...`}
              className="flex-1 t-input rounded-2xl px-4 py-2.5 text-sm border focus:outline-none focus:border-blue-500/50 transition-all"/>
            <button type="submit" disabled={!input.trim()||sending}
              className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 flex-shrink-0">
              {sending
                ? <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
              }
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center t-bg">
          <div className="text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{background:'var(--bg-input)'}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="t-muted">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="t-text font-semibold">Select a conversation</p>
            <p className="t-muted text-sm mt-1">or click New to start one</p>
          </div>
        </div>
      )}

      {/* New Chat - Contacts Modal */}
      {showContacts && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="t-card rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor:'var(--border)'}}>
              <h3 className="t-text font-bold">New Message</h3>
              <button onClick={() => setShowContacts(false)} className="t-muted hover:t-text p-1.5 rounded-lg t-hover">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-4">
              <input value={searchContact} onChange={e => setSearchContact(e.target.value)} placeholder="Search people..."
                className="w-full t-input rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:border-blue-500/50 mb-3"/>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredContacts.length === 0
                  ? <p className="t-muted text-sm text-center py-4">No users found</p>
                  : filteredContacts.map(c => (
                    <button key={c.id} onClick={() => startNewChat(c)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl t-hover transition-colors text-left">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0
                        ${c.role==='admin' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-purple-400 to-pink-500'}`}>
                        {c.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="t-text text-sm font-semibold">{c.name}</p>
                        <p className="t-muted text-xs capitalize">{c.role} · {c.email}</p>
                      </div>
                    </button>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
