import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword)
      return setError('Passwords do not match.');
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters.');
    setLoading(true); setError('');
    try {
      // SECURITY: never send role — backend enforces student only
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{backgroundImage:"radial-gradient(circle at 20% 50%, #1a1a6e 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0d4a6b 0%, transparent 40%)"}} />
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
          <h2 className="text-white font-bold text-xl mb-1">Create account</h2>
          <p className="text-gray-500 text-sm mb-6">Join EduWallet as a student</p>

          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name"
                className="w-full bg-white/5 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block">Email address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com"
                className="w-full bg-white/5 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min. 6 characters"
                className="w-full bg-white/5 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block">Confirm Password</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required placeholder="Repeat password"
                className="w-full bg-white/5 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all" />
            </div>

            {/* Security notice — no role picker */}
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              <p className="text-blue-400 text-xs">Accounts are created as <strong>Student</strong> by default.</p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              {loading && <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
