import React, { useState, useRef } from 'react';
import { notesAPI } from '../services/api';

const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','Computer Science','English','History','Geography','Economics','Other'];

export default function UploadModal({ onClose, onSuccess, groups=[] }) {
  const [form, setForm] = useState({ title:'', description:'', subject:'', unit_tags:'', group_id:'' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file.');
    if (!form.title.trim()) return setError('Title is required.');
    setLoading(true); setError('');
    const fd = new FormData();
    fd.append('file', file);
    Object.entries(form).forEach(([k,v]) => { if (v) fd.append(k, v); });
    try { await notesAPI.upload(fd); onSuccess?.(); onClose(); }
    catch(e) { setError(e.response?.data?.message || 'Upload failed. Check backend is running.'); }
    finally { setLoading(false); }
  };

 const inputCls = "w-full t-input t-text rounded-xl px-3 py-2.5 text-sm border t-border focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-[var(--muted)]";
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e1e30] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-white font-bold text-lg">Upload Notes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2.5 rounded-xl text-sm">{error}</div>}
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block font-semibold">Title *</label>
              <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Database Normalization" required className={inputCls}/>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block font-semibold">Description</label>
              <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={3} placeholder="Brief description..."
                className={`${inputCls} resize-none`}/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block font-semibold">Subject</label>
                <select value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))}
                  className={inputCls} >
                  <option value="">Select...</option>
                  {SUBJECTS.map(s => <option key={s} value={s} className="bg-[#1e1e30]">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block font-semibold">Group</label>
                <select value={form.group_id} onChange={e => setForm(f=>({...f,group_id:e.target.value}))}
                  className={inputCls} >
                  <option value="" className="bg-[#1e1e30]">Public</option>
                  {groups.map(g => <option key={g.id} value={g.id} className="bg-[#1e1e30]">{g.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block font-semibold">Unit Tags</label>
              <input value={form.unit_tags} onChange={e => setForm(f=>({...f,unit_tags:e.target.value}))} placeholder="UNIT-1, UNIT-2" className={inputCls}/>
            </div>
            <div>
              <input ref={fileRef} type="file" onChange={e => e.target.files[0] && setFile(e.target.files[0])} className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"/>
              <button type="button" onClick={() => fileRef.current.click()}
                className="w-full border-2 border-dashed border-white/15 rounded-xl py-8 text-center hover:border-blue-500/50 hover:bg-white/5 transition-all group">
                {file ? (
                  <div>
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-sm">{file.name}</p>
                    <p className="text-gray-500 text-xs mt-1">{(file.size/1024/1024).toFixed(2)} MB · <span className="text-blue-400">click to change</span></p>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto mb-2 text-gray-500 group-hover:text-blue-400 transition-colors" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                    <p className="text-gray-400 text-sm font-medium">Click to select file</p>
                    <p className="text-gray-600 text-xs mt-1">PDF, DOC, DOCX, PPT, PPTX · Max 50MB</p>
                  </div>
                )}
              </button>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white text-sm hover:bg-white/10 transition-colors">Cancel</button>
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
                {loading ? 'Uploading...' : 'Upload Note'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
