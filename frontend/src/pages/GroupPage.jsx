import React, { useState, useEffect } from 'react';
import { groupsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function GroupPage() {
  const { isAdmin } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', subject:'' });
  const [inviteCode, setInviteCode] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchGroups = () => {
    setLoading(true);
    groupsAPI.getAll().then(r => setGroups(r.data.groups || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchGroups(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setError('');
    try {
      const r = await groupsAPI.create(form);
      setSuccess(`✅ Group created! Invite code: ${r.data.invite_code}`);
      setShowCreate(false); setForm({ name:'', description:'', subject:'' }); fetchGroups();
    } catch(e) { setError(e.response?.data?.message || 'Failed to create group'); }
  };

  const handleJoin = async (e) => {
    e.preventDefault(); setError('');
    try {
      const r = await groupsAPI.join(inviteCode);
      setSuccess(r.data.message); setShowJoin(false); setInviteCode(''); fetchGroups();
    } catch(e) { setError(e.response?.data?.message || 'Invalid invite code'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this group?')) return;
    try { await groupsAPI.delete(id); fetchGroups(); } catch(e){}
  };

  return (
    <div className="flex-1 overflow-y-auto t-bg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <nav className="t-muted text-sm mb-1"><span>Notes</span><span className="mx-2">›</span><span className="t-text font-semibold">Groups</span></nav>
          <h1 className="t-text font-bold text-2xl">Groups</h1>
          <p className="t-muted text-sm mt-1">{groups.length} groups</p>
        </div>
        <div className="flex gap-2">
          {isAdmin
            ? <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">+ Create Group</button>
            : <button onClick={() => setShowJoin(true)} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">Join Group</button>
          }
        </div>
      </div>

      {success && <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">{success}</div>}
      {error   && <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-44 rounded-2xl"/>)}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{backgroundColor:'var(--bg-input)'}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="t-muted">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
            </svg>
          </div>
          <p className="t-text font-semibold">No groups yet</p>
          <p className="t-muted text-sm mt-1">{isAdmin ? 'Create your first group' : 'Join a group with an invite code'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(g => (
            <div key={g.id} className="t-card rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 bg-blue-500/15 rounded-xl flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(g.id)} className="t-muted hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                )}
              </div>
              <h3 className="t-text font-bold text-base mb-1">{g.name}</h3>
              {g.subject && <p className="text-blue-400 text-xs font-semibold mb-2">{g.subject}</p>}
              {g.description && <p className="t-text-2 text-sm mb-3 line-clamp-2">{g.description}</p>}
              <div className="flex items-center gap-3 t-muted text-xs mb-3">
                <span>{g.member_count||0} members</span>
                <span>·</span>
                <span>{g.notes_count||0} notes</span>
              </div>
              {isAdmin && g.invite_code && (
                <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{backgroundColor:'var(--bg-input)'}}>
                  <span className="t-muted text-xs">Code:</span>
                  <span className="text-blue-400 font-mono text-xs font-bold flex-1 tracking-widest">{g.invite_code}</span>
                  <button onClick={() => navigator.clipboard.writeText(g.invite_code)} title="Copy" className="t-muted hover:text-white transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="t-card rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{borderColor:'var(--border)'}}>
              <h3 className="t-text font-bold text-lg">Create Group</h3>
              <button onClick={() => setShowCreate(false)} className="t-muted hover:t-text p-1.5 rounded-lg t-hover"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="t-muted text-xs mb-1.5 block">Group Name *</label>
                <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} required placeholder="e.g. Computer Science 2024"
                  className="w-full t-input rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:border-blue-500/50"/>
              </div>
              <div>
                <label className="t-muted text-xs mb-1.5 block">Subject</label>
                <input value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))} placeholder="e.g. Computer Science"
                  className="w-full t-input rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:border-blue-500/50"/>
              </div>
              <div>
                <label className="t-muted text-xs mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={3} placeholder="What is this group about?"
                  className="w-full t-input rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:border-blue-500/50 resize-none"/>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border t-border t-muted text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="t-card rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{borderColor:'var(--border)'}}>
              <h3 className="t-text font-bold text-lg">Join Group</h3>
              <button onClick={() => setShowJoin(false)} className="t-muted hover:t-text p-1.5 rounded-lg t-hover"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
            </div>
            <form onSubmit={handleJoin} className="p-6 space-y-4">
              <div>
                <label className="t-muted text-xs mb-1.5 block">Invite Code</label>
                <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} required placeholder="e.g. A1B2C3D4"
                  className="w-full t-input rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:border-blue-500/50 font-mono tracking-widest text-center text-lg"/>
              </div>
              <p className="t-muted text-xs text-center">Ask your admin for the invite code</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowJoin(false)} className="flex-1 py-2.5 rounded-xl border t-border t-muted text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">Join</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
