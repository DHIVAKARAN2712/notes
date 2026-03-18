import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import FloatingAI from './components/FloatingAI';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SavedNotes from './pages/SavedNotes';
import TrashNotes from './pages/TrashNotes';
import GroupPage from './pages/GroupPage';
import Settings from './pages/Settings';
import HelpSupport from './pages/HelpSupport';
import DownloadNotes from './pages/DownloadNotes';
import Messages from './pages/Messages';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNote, setActiveNote] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center animate-pulse shadow-2xl">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d0d1a" strokeWidth="2.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Loading EduWallet...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace/>;

  return (
    <div className="flex h-screen overflow-hidden t-bg">
      <Sidebar collapsed={collapsed}/>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onSearch={setSearchQuery} onToggleSidebar={() => setCollapsed(c => !c)}/>
        <main className="flex-1 overflow-hidden flex">
          <Routes>
            <Route path="/dashboard"  element={<Dashboard searchQuery={searchQuery} onNoteOpen={setActiveNote}/>}/>
            <Route path="/saved"      element={<SavedNotes/>}/>
            <Route path="/trash"      element={<TrashNotes/>}/>
            <Route path="/groups"     element={<GroupPage/>}/>
            <Route path="/downloads"  element={<DownloadNotes/>}/>
            <Route path="/messages"   element={<Messages/>}/>
            <Route path="/settings"   element={<Settings/>}/>
            <Route path="/help"       element={<HelpSupport/>}/>
            <Route path="*"           element={<Navigate to="/dashboard" replace/>}/>
          </Routes>
        </main>
      </div>
      {/* Floating AI Button */}
      <FloatingAI currentNote={activeNote}/>
    </div>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace/>;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login"    element={<PublicRoute><Login/></PublicRoute>}/>
            <Route path="/register" element={<PublicRoute><Register/></PublicRoute>}/>
            <Route path="/*"        element={<ProtectedLayout/>}/>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
