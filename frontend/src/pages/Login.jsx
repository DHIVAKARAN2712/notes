import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await login(form.email, form.password); navigate('/dashboard'); }
    catch(e) { setError(e.response?.data?.message || 'Invalid email or password.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.08) 0%, transparent 50%)'}}/>
      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f0f1a" strokeWidth="2.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl tracking-tight">EduWallet</h1>
            <p className="text-gray-500 text-xs">Students Note Sharing Portal</p>
          </div>
        </div>
        <div className="bg-[#1a1a2e] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-white font-bold text-xl mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block">Email address</label>
              <input name="email" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required placeholder="you@example.com"
                className="w-full bg-white/5 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"/>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block">Password</label>
              <input name="password" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required placeholder="••••••••"
                className="w-full bg-white/5 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"/>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              {loading && <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
