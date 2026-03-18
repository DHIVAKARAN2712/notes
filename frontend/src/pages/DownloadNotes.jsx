import React, { useState, useEffect } from 'react';
import { notesAPI } from '../services/api';

export default function DownloadNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    notesAPI.getAll({ limit:100 }).then(r => setNotes(r.data.notes||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const handleDownload = async (note) => {
    setDownloading(note.id);
    try {
      const r = await notesAPI.download(note.id);
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a'); a.href=url; a.download=note.file_name||'note'; a.click();
      window.URL.revokeObjectURL(url);
    } catch(e){ alert('Download failed'); } finally { setDownloading(null); }
  };

  const filtered = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || (n.subject||'').toLowerCase().includes(search.toLowerCase()));
  const extColors = { PDF:'bg-red-500/15 text-red-400', DOCX:'bg-blue-500/15 text-blue-400', DOC:'bg-blue-500/15 text-blue-400', PPTX:'bg-orange-500/15 text-orange-400', XLSX:'bg-green-500/15 text-green-400', TXT:'bg-gray-500/15 text-gray-400' };

  return (
    <div className="flex-1 overflow-y-auto t-bg p-6">
      <div className="mb-6">
        <nav className="t-muted text-sm mb-1"><span>Notes</span><span className="mx-2">›</span><span className="t-text font-semibold">Downloads</span></nav>
        <h1 className="t-text font-bold text-2xl">Download Notes</h1>
        <p className="t-muted text-sm mt-1">{filtered.length} files available</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 t-muted pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search files..."
          className="w-full t-input rounded-xl pl-9 pr-4 py-2.5 text-sm border focus:outline-none focus:border-blue-500/50"/>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i=><div key={i} className="skeleton h-16 rounded-xl"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 t-muted"><p>No files found</p></div>
      ) : (
        <div className="space-y-2 max-w-2xl">
          {filtered.map(n => {
            const ext = n.file_name?.split('.').pop()?.toUpperCase() || 'FILE';
            return (
              <div key={n.id} className="t-card rounded-xl px-5 py-4 flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-150">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono ${extColors[ext]||'bg-purple-500/15 text-purple-400'}`}>
                  {ext}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="t-text font-semibold text-sm truncate">{n.title}</p>
                  <p className="t-muted text-xs">{n.publisher_name} · {n.subject||'General'} · {(n.file_size/1024).toFixed(0)} KB</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="t-muted text-xs hidden sm:block">{n.download_count||0} downloads</span>
                  <button onClick={() => handleDownload(n)} disabled={downloading===n.id}
                    className="p-2.5 bg-blue-600/15 text-blue-400 rounded-xl hover:bg-blue-600/25 transition-colors disabled:opacity-50">
                    {downloading===n.id
                      ? <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
