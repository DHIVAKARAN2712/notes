import React, { useState, useEffect } from 'react';
import { notesAPI } from '../services/api';

export default function TrashNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrash = () => {
    setLoading(true);
    notesAPI.getTrash().then(r => setNotes(r.data.notes||[])).catch(()=>{}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchTrash(); }, []);

  const handleRestore = async (id) => {
    try { await notesAPI.restore(id); fetchTrash(); } catch(e){}
  };

  return (
    <div className="flex-1 overflow-y-auto t-bg p-6">
      <div className="mb-6">
        <nav className="t-muted text-sm mb-1"><span>Notes</span><span className="mx-2">›</span><span className="t-text font-bold">Trash</span></nav>
        <h1 className="t-text font-bold text-2xl">Trash</h1>
        <p className="t-muted text-sm mt-1">{notes.length} deleted notes</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="skeleton h-40 rounded-2xl"/>)}</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{background:'var(--bg-input)'}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="t-muted">
              <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
          </div>
          <p className="t-text font-semibold">Trash is empty</p>
          <p className="t-muted text-sm mt-1">Deleted notes appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map(n => (
            <div key={n.id} className="t-card rounded-2xl p-4 opacity-75 hover:opacity-100 transition-opacity">
              <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md font-mono font-bold">
                {n.file_name?.split('.').pop()?.toUpperCase()}
              </span>
              <h3 className="t-text font-bold text-sm mt-2 mb-1 truncate">{n.title}</h3>
              <p className="t-muted text-xs mb-1">By {n.publisher_name}</p>
              <p className="t-muted text-xs mb-3">Deleted {new Date(n.deleted_at).toLocaleDateString()}</p>
              <button onClick={() => handleRestore(n.id)}
                className="w-full py-2 rounded-xl text-sm font-semibold border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors">
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
