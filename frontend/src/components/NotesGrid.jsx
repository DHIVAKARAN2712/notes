import React from 'react';
import NoteCard from './NoteCard';

const SkeletonCard = () => (
  <div className="t-card rounded-2xl p-4">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="skeleton h-4 w-20 mb-2 rounded"/>
        <div className="skeleton h-4 w-32 rounded mb-1"/>
        <div className="skeleton h-3 w-24 rounded"/>
      </div>
      <div className="skeleton w-10 h-10 rounded-full ml-3"/>
    </div>
    <div className="skeleton h-3 w-full mb-1.5 rounded"/>
    <div className="skeleton h-3 w-3/4 mb-4 rounded"/>
    <div className="flex gap-2 mb-4">{[1,2,3].map(i=><div key={i} className="skeleton h-5 w-14 rounded-full"/>)}</div>
    <div className="border-t pt-3 flex gap-1" style={{borderColor:'var(--border)'}}>
      {[1,2,3,4,5].map(i=><div key={i} className="skeleton w-8 h-8 rounded-lg"/>)}
    </div>
  </div>
);

export default function NotesGrid({ notes, loading, onDelete, onRefresh, onPreview, onAI, onMessage }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_,i) => <SkeletonCard key={i}/>)}
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{background:'var(--bg-input)'}}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="t-muted">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <h3 className="t-text font-semibold text-lg mb-2">No notes found</h3>
        <p className="t-muted text-sm">Notes will appear here once uploaded.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {notes.map(note => (
        <NoteCard key={note.id} note={note}
          onDelete={onDelete} onRefresh={onRefresh}
          onPreview={onPreview} onAI={onAI} onMessage={onMessage}/>
      ))}
    </div>
  );
}
