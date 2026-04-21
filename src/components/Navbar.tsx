'use client';
import Link from 'next/link';
import { useApp } from './AppContext';
import { t, getLangName, type Lang } from '@/lib/i18n';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { lang, setLang, theme, toggleTheme, user, setUser } = useApp();
  const [showLang, setShowLang] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    setUser(null);
    router.push('/');
  };

  const langs: Lang[] = ['th', 'en', 'zh'];

  return (
    <nav className="navbar sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-lg">
            P
          </div>
          <span className="text-xl font-bold gradient-text">PayOTP</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-[var(--accent)] transition-colors" style={{color: 'var(--text-secondary)'}}>
            {t('nav.home', lang)}
          </Link>
          <Link href="/products" className="text-sm font-medium hover:text-[var(--accent)] transition-colors" style={{color: 'var(--text-secondary)'}}>
            {t('nav.products', lang)}
          </Link>
          {user && (
            <Link href="/dashboard/wallet" className="text-sm font-medium hover:text-[var(--accent)] transition-colors" style={{color: 'var(--text-secondary)'}}>
              {t('nav.dashboard', lang)}
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin" className="text-sm font-medium hover:text-[var(--accent)] transition-colors" style={{color: 'var(--text-secondary)'}}>
              {t('nav.admin', lang)}
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setShowLang(!showLang)}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
            >
              🌐 {getLangName(lang)}
            </button>
            {showLang && (
              <div className="absolute right-0 top-full mt-1 card p-1 min-w-[120px] z-50" style={{backgroundColor: 'var(--bg-card)'}}>
                {langs.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setShowLang(false); }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[var(--accent-light)] transition-colors ${lang === l ? 'font-bold text-[var(--accent)]' : ''}`}
                  >
                    {getLangName(l)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="btn-secondary text-sm px-3 py-1.5">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* User section */}
          {user ? (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="hidden md:inline text-sm font-medium">{user.username}</span>
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 card p-2 min-w-[180px] z-50" style={{backgroundColor: 'var(--bg-card)'}}>
                  <div className="px-3 py-2 text-xs border-b mb-1" style={{borderColor: 'var(--border-color)'}}>
                    💰 ฿{user.balance?.toFixed(2)}
                  </div>
                  <Link href="/dashboard/wallet" onClick={() => setShowMenu(false)} className="block px-3 py-2 text-sm rounded-lg hover:bg-[var(--accent-light)]">
                    💳 {t('nav.wallet', lang)}
                  </Link>
                  <Link href="/dashboard/orders" onClick={() => setShowMenu(false)} className="block px-3 py-2 text-sm rounded-lg hover:bg-[var(--accent-light)]">
                    📦 {t('order.history', lang)}
                  </Link>
                  <Link href="/dashboard/affiliate" onClick={() => setShowMenu(false)} className="block px-3 py-2 text-sm rounded-lg hover:bg-[var(--accent-light)]">
                    👥 {t('affiliate.title', lang)}
                  </Link>
                  <button onClick={() => { handleLogout(); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[var(--accent-light)]" style={{color: 'var(--danger)'}}>
                    🚪 {t('nav.logout', lang)}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth" className="btn-secondary text-sm px-4 py-1.5">{t('nav.login', lang)}</Link>
              <Link href="/auth?mode=register" className="btn-primary text-sm px-4 py-1.5">{t('nav.register', lang)}</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
