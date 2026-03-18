import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('eduwallet_token');
    const saved  = localStorage.getItem('eduwallet_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch(e){}
      authAPI.getProfile()
        .then(r => { setUser(r.data.user); localStorage.setItem('eduwallet_user', JSON.stringify(r.data.user)); })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const r = await authAPI.login({ email, password });
    const { token, user } = r.data;
    localStorage.setItem('eduwallet_token', token);
    localStorage.setItem('eduwallet_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  // SECURITY: never pass role — backend always assigns 'student'
  const register = async (name, email, password) => {
    const r = await authAPI.register({ name, email, password });
    const { token, user } = r.data;
    localStorage.setItem('eduwallet_token', token);
    localStorage.setItem('eduwallet_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('eduwallet_token');
    localStorage.removeItem('eduwallet_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
