import React, { useState } from 'react';
import { notesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Ic = ({ d, size = 17, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(date).toLocaleDateString();
};

export default function NoteCard({ note, onDelete, onRefresh, onPreview, onAI, onMessage }) {
  const { isAdmin, user } = useAuth();
  const [saved, setSaved] = useState(!!note.is_saved);
  const [saving, setSaving] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const tags = note.unit_tags ? note.unit_tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const initials = note.publisher_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';
  const fileExt = note.file_name?.split('.').pop()?.toUpperCase() || 'FILE';
  const badgeMap = {
    PDF:'bg-red-500/20 text-red-400', DOCX:'bg-blue-500/20 text-blue-400',
    DOC:'bg-blue-500/20 text-blue-400', PPTX:'bg-orange-500/20 text-orange-400',
    PPT:'bg-orange-500/20 text-orange-400', XLSX:'bg-green-500/20 text-green-400',
    TXT:'bg-gray-500/20 text-gray-400'
  };
  const badge = badgeMap[fileExt] || 'bg-purple-500/20 text-purple-400';
  const isPDF = fileExt === 'PDF';

  const handleSave = async () => {
    setSaving(true);
    try { const r = await notesAPI.save(note.id); setSaved(r.data.saved); }
    catch(e){} finally { setSaving(false); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const r = await notesAPI.download(note.id);
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a'); a.href=url; a.download=note.file_name||'note'; a.click();
      window.URL.revokeObjectURL(url);
    } catch(e){ alert('Download failed'); } finally { setDownloading(false); }
  };

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: note.title, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
  };

  const openComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const r = await notesAPI.getById(note.id);
        setComments(r.data.comments || []);
      } catch(e){} finally { setLoadingComments(false); }
    }
    setShowComments(v => !v);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const r = await notesAPI.addComment({ note_id: note.id, content: commentText });
      setComments(p => [...p, r.data.comment]);
      setCommentText('');
    } catch(e){} finally { setSubmittingComment(false); }
  };

  return (
    <div className="t-card rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-2xl transition-all duration-200 group">
      <div className="p-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${badge}`}>{fileExt}</span>
              {isAdmin && (
                <button onClick={() => onDelete?.(note.id)} className="ml-auto t-muted hover:text-red-400 transition-colors p-0.5">
                  <Ic d="M18 6 6 18M6 6l12 12" size={12}/>
                </button>
              )}
            </div>
            <h3 className="t-text font-bold text-sm leading-snug truncate">{note.title}</h3>
            <p className="t-muted text-[10px] mt-0.5 font-semibold uppercase tracking-wider">
              {note.publisher_name}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ml-3 ring-2 ring-white/10">
            {initials}
          </div>
        </div>

        {note.description && (
          <p className="t-text-2 text-xs leading-relaxed mb-3 line-clamp-2">{note.description}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag,i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full border font-semibold tag-style">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="px-3 py-2.5 border-t flex items-center justify-between" style={{borderColor:'var(--border)'}}>
        <div className="flex items-center gap-0.5">
          {/* Comment */}
          <button onClick={openComments} title="Comments"
            className={`p-2 rounded-lg t-hover transition-colors relative ${showComments ? 'text-blue-400' : 't-muted hover:text-blue-400'}`}>
            <Ic d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            {note.comment_count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold">
                {note.comment_count > 9 ? '9+' : note.comment_count}
              </span>
            )}
          </button>
          {/* Share */}
          <button onClick={handleShare} title="Share" className="p-2 t-muted hover:text-blue-400 rounded-lg t-hover transition-colors">
            <Ic d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </button>
          {/* Download */}
          <button onClick={handleDownload} disabled={downloading} title="Download"
            className="p-2 t-muted hover:text-blue-400 rounded-lg t-hover transition-colors disabled:opacity-50">
            <Ic d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </button>
          {/* Preview (PDF only) */}
          {isPDF && onPreview && (
            <button onClick={() => onPreview(note)} title="Preview PDF"
              className="p-2 t-muted hover:text-purple-400 rounded-lg t-hover transition-colors">
              <Ic d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
            </button>
          )}
          {/* AI */}
          {onAI && (
            <button onClick={() => onAI(note)} title="AI Assistant"
              className="p-2 t-muted hover:text-yellow-400 rounded-lg t-hover transition-colors">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10"/><path d="m16 8 2 2 4-4"/>
              </svg>
            </button>
          )}
          {/* Message uploader */}
          {!isAdmin && onMessage && user?.id !== note.uploaded_by_id && (
            <button onClick={() => onMessage(note)} title="Message uploader"
              className="p-2 t-muted hover:text-green-400 rounded-lg t-hover transition-colors">
              <Ic d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </button>
          )}
        </div>
        {/* Save */}
        <button onClick={handleSave} disabled={saving} title={saved?'Unsave':'Save'}
          className={`p-2 rounded-lg t-hover transition-colors ${saved?'text-blue-400':'t-muted hover:text-blue-400'}`}>
          <Ic d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" fill={saved?'currentColor':'none'}/>
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="border-t" style={{borderColor:'var(--border)', background:'var(--bg-input)'}}>
          {/* Comments list */}
          <div className="max-h-52 overflow-y-auto p-3 space-y-3">
            {loadingComments ? (
              <div className="space-y-2">
                {[1,2].map(i => (
                  <div key={i} className="flex gap-2">
                    <div className="skeleton w-7 h-7 rounded-full flex-shrink-0"/>
                    <div className="flex-1 space-y-1">
                      <div className="skeleton h-3 w-20 rounded"/>
                      <div className="skeleton h-3 w-full rounded"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="t-muted text-xs text-center py-3">No comments yet. Be the first!</p>
            ) : comments.map((c, i) => (
              <div key={c.id || i} className="flex gap-2">
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold
                  ${c.user_role === 'admin' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-purple-400 to-pink-500'}`}>
                  {c.user_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="t-text text-xs font-semibold">{c.user_name}</span>
                    {c.user_role === 'admin' && (
                      <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-semibold">Admin</span>
                    )}
                    <span className="t-muted text-[9px] ml-auto">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="t-text-2 text-xs leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Comment input */}
          <form onSubmit={submitComment} className="flex gap-2 p-3 border-t" style={{borderColor:'var(--border)'}}>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 t-input rounded-xl px-3 py-1.5 text-xs border focus:outline-none focus:border-blue-500/50 transition-all"
            />
            <button type="submit" disabled={!commentText.trim() || submittingComment}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {submittingComment ? '...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
