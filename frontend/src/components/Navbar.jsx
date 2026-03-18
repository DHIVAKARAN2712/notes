import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notesAPI } from '../services/api';

export default function Navbar({ onSearch, onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    notesAPI.getNotifications()
      .then(r => {
        const n = r.data.notifications || [];
        setNotifications(n);
        setUnread(n.filter(x => !x.is_read).length);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e) => { e.preventDefault(); onSearch?.(search); };
  const openNotif = () => {
    setShowNotif(v => !v);
    if (unread > 0) {
      notesAPI.markNotificationsRead().then(() => setUnread(0)).catch(() => {});
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <header className="h-16 bg-[#12122a] border-b border-white/5 flex items-center px-4 gap-4 sticky top-0 z-40 flex-shrink-0">
      <button onClick={onToggleSidebar} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-lg">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..."
            className="w-full bg-white/8 text-white placeholder-gray-500 rounded-full py-2 pl-9 pr-4 text-sm border border-white/10 focus:outline-none focus:border-blue-500/50 focus:bg-white/12 transition-all"
            style={{background:'rgba(255,255,255,0.06)'}}/>
        </div>
      </form>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={openNotif} className="relative p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">{unread > 9 ? '9+' : unread}</span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-[#1e1e30] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-white font-semibold text-sm">Notifications</h3>
                <span className="text-gray-500 text-xs">{notifications.length} total</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0
                  ? <p className="text-gray-500 text-sm text-center py-8">All caught up! 🎉</p>
                  : notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.is_read ? 'bg-blue-500/5' : ''}`}>
                      <div className="flex gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? 'bg-blue-400' : 'bg-transparent'}`}/>
                        <div>
                          <p className="text-white text-xs font-semibold">{n.title}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{n.message}</p>
                          <p className="text-gray-600 text-[10px] mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => setShowProfile(v => !v)} className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          {showProfile && (
            <div className="absolute right-0 top-12 w-60 bg-[#1e1e30] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{initials}</div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">{user?.name}</p>
                    <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 font-bold capitalize
                      ${user?.role==='admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <button onClick={() => { navigate('/settings'); setShowProfile(false); }} className="w-full text-left px-3 py-2.5 text-gray-300 text-sm hover:bg-white/10 rounded-xl transition-colors">Settings</button>
                <button onClick={() => { navigate('/messages'); setShowProfile(false); }} className="w-full text-left px-3 py-2.5 text-gray-300 text-sm hover:bg-white/10 rounded-xl transition-colors">Messages</button>
                <button onClick={() => { logout(); navigate('/login'); }} className="w-full text-left px-3 py-2.5 text-red-400 text-sm hover:bg-red-500/10 rounded-xl transition-colors">Logout</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
