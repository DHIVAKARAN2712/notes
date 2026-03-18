import React, { useState, useEffect } from 'react';
import { notesAPI } from '../services/api';
import NotesGrid from '../components/NotesGrid';
import PreviewModal from '../components/PreviewModal';
import AIModal from '../components/AIModal';

export default function SavedNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewNote, setPreviewNote] = useState(null);
  const [aiNote, setAiNote] = useState(null);

  const fetch = () => {
    setLoading(true);
    notesAPI.getSaved().then(r => setNotes(r.data.notes||[])).catch(()=>{}).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleDownload = async (note) => {
    try {
      const r = await notesAPI.download(note.id);
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a'); a.href=url; a.download=note.file_name||'note'; a.click();
      window.URL.revokeObjectURL(url);
    } catch(e){}
  };

  return (
    <div className="flex-1 overflow-y-auto t-bg p-6">
      <div className="mb-6">
        <nav className="t-muted text-sm mb-1"><span>Notes</span><span className="mx-2">›</span><span className="t-text font-bold">Saved Notes</span></nav>
        <h1 className="t-text font-bold text-2xl">Saved Notes</h1>
        <p className="t-muted text-sm mt-1">{notes.length} saved</p>
      </div>
      <NotesGrid notes={notes} loading={loading} onRefresh={fetch} onPreview={setPreviewNote} onAI={setAiNote}/>
      {previewNote && <PreviewModal note={previewNote} onClose={() => setPreviewNote(null)} onDownload={() => handleDownload(previewNote)}/>}
      {aiNote && <AIModal note={aiNote} onClose={() => setAiNote(null)}/>}
    </div>
  );
}
