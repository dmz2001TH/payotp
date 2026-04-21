'use client';
import Link from 'next/link';
import { useApp } from './AppContext';
import { t, getLangName, type Lang } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const { lang, setLang, theme, toggleTheme, user, setUser } = useApp();
  const [showLang, setShowLang] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setShowLang(false);
    setShowMenu(false);
  }, [pathname]);

  const handleLogout = async () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    setUser(null);
    router.push('/');
  };

  const langs: Lang[] = ['th', 'en', 'zh'];

  const navLinks = [
    { href: '/', label: t('nav.home', lang), icon: '🏠' },
    { href: '/products', label: t('nav.products', lang), icon: '🛍️' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className={`navbar sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:shadow-lg transition-shadow">
              P
            </div>
            <span className="text-xl font-extrabold gradient-text tracking-tight">
              PayOTP
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? 'text-[var(--primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/dashboard/wallet"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname.startsWith('/dashboard')
                    ? 'text-[var(--primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
                }`}
              >
                {t('nav.dashboard', lang)}
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname.startsWith('/admin')
                    ? 'text-[var(--primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
                }`}
              >
                {t('nav.admin', lang)}
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language */}
            <div className="relative">
              <button
                onClick={() => { setShowLang(!showLang); setShowMenu(false); }}
                className="btn-ghost text-xs px-3 py-1.5"
              >
                🌐 {getLangName(lang)}
                <svg className={`w-3 h-3 ml-1 transition-transform ${showLang ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showLang && (
                <div className="absolute right-0 top-full mt-1 card p-1.5 min-w-[140px] animate-fade-in" style={{ boxShadow: 'var(--shadow-xl)' }}>
                  {langs.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setShowLang(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                        lang === l
                          ? 'font-bold text-[var(--primary)]'
                          : 'hover:bg-[var(--bg-input)]'
                      }`}
                    >
                      {l === 'th' ? '🇹🇭' : l === 'en' ? '🇺🇸' : '🇨🇳'} {getLangName(l)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="btn-ghost px-3 py-1.5 text-lg"
              title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* User section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => { setShowMenu(!showMenu); setShowLang(false); }}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-[var(--bg-input)] transition-all"
                >
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold leading-tight">{user.username}</p>
                    <p className="text-xs text-[var(--primary)] font-bold leading-tight">฿{user.balance?.toFixed(2)}</p>
                  </div>
                  <svg className={`w-3 h-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 card p-2 min-w-[200px] animate-fade-in" style={{ boxShadow: 'var(--shadow-xl)' }}>
                    <div className="px-3 py-2.5 mb-1 rounded-lg" style={{ background: 'var(--bg-input)' }}>
                      <p className="text-xs text-[var(--text-muted)]">Balance</p>
                      <p className="text-lg font-extrabold text-[var(--primary)]">฿{user.balance?.toFixed(2)}</p>
                    </div>
                    <Link href="/dashboard/wallet" onClick={() => setShowMenu(false)} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-[var(--bg-input)] transition-all">
                      💳 {t('nav.wallet', lang)}
                    </Link>
                    <Link href="/dashboard/orders" onClick={() => setShowMenu(false)} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-[var(--bg-input)] transition-all">
                      📦 {t('order.history', lang)}
                    </Link>
                    <Link href="/dashboard/affiliate" onClick={() => setShowMenu(false)} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-[var(--bg-input)] transition-all">
                      👥 {t('affiliate.title', lang)}
                    </Link>
                    <div className="divider my-1" />
                    <button onClick={() => { handleLogout(); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-[var(--bg-input)] transition-all text-[var(--danger)]">
                      🚪 {t('nav.logout', lang)}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth" className="btn-ghost text-sm hidden sm:inline-flex">
                  {t('nav.login', lang)}
                </Link>
                <Link href="/auth?mode=register" className="btn-primary text-sm">
                  {t('nav.register', lang)}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
