import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';

export default function Settings() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState({ text: '', ok: false });
  const [pwSaving, setPwSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault(); setProfileSaving(true); setProfileMsg('');
    try { await authAPI.updateProfile({ name }); setProfileMsg('✅ Profile updated!'); }
    catch(e) { setProfileMsg('❌ ' + (e.response?.data?.message || 'Failed')); }
    finally { setProfileSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault(); setPwMsg({ text: '', ok: false });
    if (pw.newPw !== pw.confirm) return setPwMsg({ text: '❌ Passwords do not match.', ok: false });
    if (pw.newPw.length < 6) return setPwMsg({ text: '❌ Min. 6 characters required.', ok: false });
    setPwSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pw.current, newPassword: pw.newPw });
      setPwMsg({ text: '✅ Password changed successfully!', ok: true });
      setPw({ current: '', newPw: '', confirm: '' });
    } catch(e) { setPwMsg({ text: '❌ ' + (e.response?.data?.message || 'Failed'), ok: false }); }
    finally { setPwSaving(false); }
  };

  const inputCls = "w-full t-input rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:border-blue-500/50 transition-all";

  return (
    <div className="flex-1 overflow-y-auto t-bg p-6">
      <div className="mb-6">
        <nav className="t-muted text-sm mb-1"><span>Notes</span><span className="mx-2">›</span><span className="t-text font-semibold">Settings</span></nav>
        <h1 className="t-text font-bold text-2xl">Settings</h1>
      </div>

      <div className="max-w-xl space-y-4">
        {/* Profile */}
        <div className="t-card rounded-2xl p-5">
          <h3 className="t-text font-semibold mb-4">Profile</h3>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="t-text font-bold">{user?.name}</p>
              <p className="t-text-2 text-sm">{user?.email}</p>
              <span className={`text-xs px-2.5 py-0.5 rounded-full inline-block mt-1 font-semibold capitalize
                ${user?.role==='admin' ? 'bg-blue-500/15 text-blue-400' : 'bg-green-500/15 text-green-400'}`}>
                {user?.role}
              </span>
            </div>
          </div>
          {profileMsg && <div className={`mb-3 px-3 py-2 rounded-xl text-sm ${profileMsg.includes('✅') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>{profileMsg}</div>}
          <form onSubmit={saveProfile} className="space-y-3">
            <div>
              <label className="t-muted text-xs mb-1.5 block">Display Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className={inputCls}/>
            </div>
            <div>
              <label className="t-muted text-xs mb-1.5 block">Email (read-only)</label>
              <input value={user?.email} readOnly className={`${inputCls} opacity-60 cursor-not-allowed`}/>
            </div>
            <button type="submit" disabled={profileSaving}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60">
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="t-card rounded-2xl p-5">
          <h3 className="t-text font-semibold mb-4">Change Password</h3>
          {pwMsg.text && (
            <div className={`mb-4 px-3 py-2.5 rounded-xl text-sm ${pwMsg.ok ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
              {pwMsg.text}
            </div>
          )}
          <form onSubmit={changePassword} className="space-y-3">
            <div>
              <label className="t-muted text-xs mb-1.5 block">Current Password</label>
              <input type="password" value={pw.current} onChange={e => setPw(p=>({...p,current:e.target.value}))}
                placeholder="Enter current password" required className={inputCls}/>
            </div>
            <div>
              <label className="t-muted text-xs mb-1.5 block">New Password</label>
              <input type="password" value={pw.newPw} onChange={e => setPw(p=>({...p,newPw:e.target.value}))}
                placeholder="Min. 6 characters" required className={inputCls}/>
            </div>
            <div>
              <label className="t-muted text-xs mb-1.5 block">Confirm New Password</label>
              <input type="password" value={pw.confirm} onChange={e => setPw(p=>({...p,confirm:e.target.value}))}
                placeholder="Repeat new password" required className={inputCls}/>
            </div>
            <button type="submit" disabled={pwSaving}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2">
              {pwSaving && <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
              {pwSaving ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Appearance */}
        <div className="t-card rounded-2xl p-5">
          <h3 className="t-text font-semibold mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="t-text text-sm font-medium">Dark Mode</p>
              <p className="t-muted text-xs mt-0.5">Switch between light and dark theme</p>
            </div>
            <button onClick={toggleTheme}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${isDark?'bg-blue-600':'bg-gray-300'}`}>
              <span className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-all duration-200 ${isDark?'left-6':'left-0.5'}`}/>
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="t-card rounded-2xl p-5">
          <h3 className="t-text font-semibold mb-3">Account Info</h3>
          <div className="space-y-2.5">
            <div className="flex justify-between"><span className="t-muted text-sm">Account Type</span><span className={`text-sm font-semibold capitalize ${user?.role==='admin'?'text-blue-400':'text-green-400'}`}>{user?.role}</span></div>
            <div className="flex justify-between"><span className="t-muted text-sm">Member Since</span><span className="t-text text-sm">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long'}) : 'N/A'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
