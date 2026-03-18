import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Ic = ({ d, size=18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

const ICONS = {
  home:     "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  upload:   "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  group:    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  trash:    "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  join:     "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6",
  save:     "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  message:  "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  help:     "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01",
  logout:   "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  sun:      "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
  moon:     "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
};

export default function Sidebar({ collapsed }) {
  const { logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const isActive = (p) => location.pathname === p || location.pathname.startsWith(p + '/');

  const NavItem = ({ to, icon, label, onClick }) => {
    const active = to ? isActive(to) : false;
    return (
      <button
        onClick={() => onClick ? onClick() : navigate(to)}
        title={collapsed ? label : ''}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
          ${active
            ? 'bg-white text-gray-900 font-bold shadow-md'
            : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
      >
        <span className="flex-shrink-0"><Ic d={ICONS[icon]} size={18}/></span>
        {!collapsed && <span className="text-sm truncate flex-1 text-left">{label}</span>}
      </button>
    );
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex flex-col h-screen flex-shrink-0 bg-[#12122a] text-white border-r border-white/5`}>
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-white/10 flex-shrink-0">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-base tracking-tight">EduWallet</span>
            <p className="text-gray-500 text-[10px]">Notes Portal</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        <div>
          {!collapsed && <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2">Main</p>}
          <div className="space-y-0.5">
            <NavItem to="/dashboard"  icon="home"     label="Dashboard"/>
            {isAdmin && <NavItem to="/upload"   icon="upload"   label="Upload Notes"/>}
            {isAdmin && <NavItem to="/groups"   icon="group"    label="Groups"/>}
            {isAdmin && <NavItem to="/trash"    icon="trash"    label="Trash"/>}
            {!isAdmin && <NavItem to="/groups"  icon="join"     label="Join Group"/>}
            <NavItem to="/saved"      icon="save"     label="Saved Notes"/>
            <NavItem to="/downloads"  icon="download" label="Downloads"/>
            <NavItem to="/messages"   icon="message"  label="Messages"/>
          </div>
        </div>

        <div>
          {!collapsed && <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2">Tools</p>}
          <div className="space-y-0.5">
            <NavItem to="/settings" icon="settings" label="Settings"/>
            <NavItem to="/help"     icon="help"     label="Help & Support"/>
            <NavItem icon="logout"  label="Logout"  onClick={() => setConfirmLogout(true)}/>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        {collapsed ? (
          <button onClick={toggleTheme}
            className="w-full flex items-center justify-center py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            title={isDark ? 'Light Mode' : 'Dark Mode'}>
            <Ic d={isDark ? ICONS.sun : ICONS.moon} size={16}/>
          </button>
        ) : (
          <div className="flex bg-white/10 rounded-xl p-1 gap-1">
            <button onClick={() => isDark && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all
                ${!isDark ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-white'}`}>
              <Ic d={ICONS.sun} size={13}/> LIGHT
            </button>
            <button onClick={() => !isDark && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all
                ${isDark ? 'bg-white/20 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
              <Ic d={ICONS.moon} size={13}/> DARK
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirm */}
      {confirmLogout && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1e1e30] rounded-2xl p-6 w-80 shadow-2xl border border-white/10">
            <h3 className="text-white font-bold text-lg mb-2">Confirm Logout</h3>
            <p className="text-gray-400 text-sm mb-6">Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmLogout(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-white text-sm hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button onClick={() => { logout(); navigate('/login'); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
