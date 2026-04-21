'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lang } from '@/lib/i18n';

interface AppContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: any;
  setUser: (user: any) => void;
  fetchUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  lang: 'th',
  setLang: () => {},
  theme: 'light',
  toggleTheme: () => {},
  user: null,
  setUser: () => {},
  fetchUser: async () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('th');
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('payotp-lang') as Lang;
    const savedTheme = localStorage.getItem('payotp-theme') as 'light' | 'dark';
    if (savedLang) setLangState(savedLang);
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    fetchUser();
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('payotp-lang', l);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    localStorage.setItem('payotp-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  return (
    <AppContext.Provider value={{ lang, setLang, theme, toggleTheme, user, setUser, fetchUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
