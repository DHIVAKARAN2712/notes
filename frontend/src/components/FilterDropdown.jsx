import React, { useState, useRef, useEffect } from 'react';

const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','Computer Science','English','History','Geography','Economics','Other'];

export default function FilterDropdown({ onFilter, currentFilters }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(currentFilters?.subject || '');
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const apply = () => { onFilter({ subject }); setOpen(false); };
  const reset = () => { setSubject(''); onFilter({}); setOpen(false); };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-4 py-2.5 t-card rounded-xl t-text text-sm font-semibold hover:opacity-90 transition-all">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        Filter
        {currentFilters?.subject && <span className="w-2 h-2 bg-blue-500 rounded-full"/>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-64 t-drop rounded-2xl shadow-2xl p-4 z-50">
          <h4 className="t-text font-bold text-sm mb-3">Filter Notes</h4>
          <div className="mb-4">
            <label className="t-muted text-xs mb-1.5 block">Subject</label>
            <select value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full t-input rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:border-blue-500/50">
              <option value="">All Subjects</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="flex-1 py-2.5 rounded-xl border t-border t-muted text-sm hover:t-text transition-colors">Reset</button>
            <button onClick={apply} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}
