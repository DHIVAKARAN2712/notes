import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notesAPI, groupsAPI } from '../services/api';
import NotesGrid from '../components/NotesGrid';
import FilterDropdown from '../components/FilterDropdown';
import UploadModal from '../components/UploadModal';
import PreviewModal from '../components/PreviewModal';
import AIModal from '../components/AIModal';

export default function Dashboard({ searchQuery, onNoteOpen }) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ page:1, pages:1, total:0 });
  const [showUpload, setShowUpload] = useState(false);
  const [groups, setGroups] = useState([]);
  const [previewNote, setPreviewNote] = useState(null);
  const [aiNote, setAiNote] = useState(null);

  const fetchNotes = useCallback(async (page=1) => {
    setLoading(true);
    try {
      const params = { page, limit:12, ...filters };
      if (searchQuery) params.search = searchQuery;
      const r = await notesAPI.getAll(params);
      setNotes(r.data.notes||[]);
      setPagination(r.data.pagination||{page:1,pages:1,total:0});
    } catch(e){} finally { setLoading(false); }
  }, [filters, searchQuery]);

  useEffect(() => { fetchNotes(1); }, [fetchNotes]);
  useEffect(() => { groupsAPI.getAll().then(r => setGroups(r.data.groups||[])).catch(()=>{}); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Move to trash?')) return;
    try { await notesAPI.delete(id); fetchNotes(pagination.page); } catch(e){}
  };

  const handleDownload = async (note) => {
    try {
      const r = await notesAPI.download(note.id);
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a'); a.href=url; a.download=note.file_name||'note'; a.click();
      window.URL.revokeObjectURL(url);
    } catch(e){}
  };

  const handleAI = (note) => {
    setAiNote(note);
    onNoteOpen?.(note); // update floating AI context
  };

  const handleMessage = (note) => {
    navigate('/messages');
  };

  return (
    <div className="flex-1 overflow-y-auto t-bg min-h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <nav className="t-muted text-sm mb-1"><span>Notes</span><span className="mx-2">›</span><span className="t-text font-semibold">Dashboard</span></nav>
            <h1 className="t-text font-bold text-2xl">{searchQuery ? `Results for "${searchQuery}"` : 'All Notes'}</h1>
            <p className="t-muted text-sm mt-1">{pagination.total} notes available</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                Upload
              </button>
            )}
            <FilterDropdown onFilter={setFilters} currentFilters={filters}/>
          </div>
        </div>

        {groups.length > 0 && (
          <div className="mb-6">
            <h2 className="t-muted text-xs font-bold uppercase tracking-widest mb-3">My Groups</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button onClick={() => setFilters(f => { const {group_id,...r}=f; return r; })}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                  ${!filters.group_id ? 'bg-blue-600 text-white border-blue-600' : 't-card t-text-2'}`}
                style={!filters.group_id?{}:{borderColor:'var(--border)'}}>
                All Notes
              </button>
              {groups.map(g => (
                <button key={g.id} onClick={() => setFilters(f => ({...f, group_id:g.id}))}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                    ${filters.group_id===g.id ? 'bg-blue-600 text-white border-blue-600' : 't-card t-text-2'}`}
                  style={filters.group_id===g.id?{}:{borderColor:'var(--border)'}}>
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <NotesGrid notes={notes} loading={loading} onDelete={handleDelete} onRefresh={fetchNotes}
          onPreview={setPreviewNote} onAI={handleAI} onMessage={handleMessage}/>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({length:pagination.pages},(_,i)=>i+1).map(p => (
              <button key={p} onClick={() => fetchNotes(p)}
                className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all
                  ${p===pagination.page ? 'bg-blue-600 text-white' : 't-card t-text-2 t-hover'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={() => fetchNotes(1)} groups={groups}/>}
      {previewNote && <PreviewModal note={previewNote} onClose={() => setPreviewNote(null)} onDownload={() => handleDownload(previewNote)}/>}
      {aiNote && <AIModal note={aiNote} onClose={() => setAiNote(null)}/>}
    </div>
  );
}
