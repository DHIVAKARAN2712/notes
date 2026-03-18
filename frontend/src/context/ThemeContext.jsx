import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

// Apply immediately before React renders (no flash)
const applyTheme = (dark) => {
  if (dark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
};
applyTheme(localStorage.getItem('eduwallet_theme') !== 'light');

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('eduwallet_theme') !== 'light');

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      applyTheme(next);
      localStorage.setItem('eduwallet_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};
