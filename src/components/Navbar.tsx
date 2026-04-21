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
  const [showMobile, setShowMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setShowLang(false);
    setShowMenu(false);
    setShowMobile(false);
  }, [pathname]);

  const handleLogout = async () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    setUser(null);
    router.push('/');
  };

  const langs: Lang[] = ['th', 'en', 'zh'];

  const navLinks = [
    { href: '/', label: t('nav.home', lang) },
    { href: '/products', label: t('nav.products', lang) },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className={`navbar-main fixed top-0 left-0 right-0 ${scrolled ? 'scrolled' : ''}`}>
        <div className="container-app">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:shadow-lg transition-shadow" style={{ boxShadow: '0 0 15px rgba(99,102,241,0.3)' }}>
                P
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight hidden sm:inline">
                PayOTP<span className="text-[var(--accent)]">.COM</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? 'text-white font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
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
                      ? 'text-white font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
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
                      ? 'text-[var(--accent)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
                  }`}
                >
                  {t('nav.admin', lang)}
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Language */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => { setShowLang(!showLang); setShowMenu(false); }}
                  className="btn-ghost-modern text-xs px-3 py-1.5"
                >
                  🌐 {getLangName(lang)}
                  <svg className={`w-3 h-3 ml-1 transition-transform ${showLang ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showLang && (
                  <div className="absolute right-0 top-full mt-2 card-modern p-2 min-w-[150px] animate-fade-in" style={{ boxShadow: 'var(--shadow-xl)', zIndex: 100 }}>
                    {langs.map((l) => (
                      <button
                        key={l}
                        onClick={() => { setLang(l); setShowLang(false); }}
                        className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all ${
                          lang === l
                            ? 'font-bold text-[var(--primary-hover)] bg-[rgba(99,102,241,0.1)]'
                            : 'hover:bg-[rgba(255,255,255,0.06)]'
                        }`}
                      >
                        {l === 'th' ? '🇹🇭' : l === 'en' ? '🇺🇸' : '🇨🇳'} {getLangName(l)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme toggle */}
              <button onClick={toggleTheme} className="btn-ghost-modern px-2.5 py-1.5 text-base hidden sm:inline-flex" title="Toggle theme">
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              {/* User section / Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => { setShowMenu(!showMenu); setShowLang(false); }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.06)] transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ boxShadow: '0 0 10px rgba(99,102,241,0.3)' }}>
                      {user.username[0].toUpperCase()}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold leading-tight text-white">{user.username}</p>
                      <p className="text-xs font-bold leading-tight text-[var(--accent)]">฿{user.balance?.toFixed(2)}</p>
                    </div>
                    <svg className={`w-3 h-3 text-[var(--text-muted)] transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-2 card-modern p-2 min-w-[220px] animate-fade-in" style={{ boxShadow: 'var(--shadow-xl)', zIndex: 100 }}>
                      <div className="px-3 py-3 mb-1 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                        <p className="text-xs text-[var(--text-muted)]">Balance</p>
                        <p className="text-xl font-extrabold text-[var(--accent)]">฿{user.balance?.toFixed(2)}</p>
                      </div>
                      <Link href="/dashboard/wallet" onClick={() => setShowMenu(false)} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-all">
                        💳 {t('nav.wallet', lang)}
                      </Link>
                      <Link href="/dashboard/orders" onClick={() => setShowMenu(false)} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-all">
                        📦 {t('order.history', lang)}
                      </Link>
                      <Link href="/dashboard/affiliate" onClick={() => setShowMenu(false)} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-all">
                        👥 {t('affiliate.title', lang)}
                      </Link>
                      <div className="divider-modern my-1" />
                      <button onClick={() => { handleLogout(); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-all text-[var(--danger)]">
                        🚪 {t('nav.logout', lang)}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth" className="btn-neon btn-neon-1 text-sm" style={{ fontSize: '0.85rem' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {t('nav.login', lang)}
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setShowMobile(!showMobile)}
                className="lg:hidden btn-ghost-modern px-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showMobile ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {showMobile && (
        <div className="fixed inset-0 z-[999] lg:hidden" onClick={() => setShowMobile(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute top-16 left-0 right-0 card-modern mx-3 p-4 animate-fade-in"
            style={{ boxShadow: 'var(--shadow-xl)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setShowMobile(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.href) ? 'text-white bg-[rgba(99,102,241,0.15)]' : 'text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
                  }`}>
                  {link.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link href="/dashboard/wallet" onClick={() => setShowMobile(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]">
                    💳 {t('nav.wallet', lang)}
                  </Link>
                  <Link href="/dashboard/orders" onClick={() => setShowMobile(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]">
                    📦 {t('order.history', lang)}
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin" onClick={() => setShowMobile(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--accent)] hover:bg-[rgba(255,255,255,0.06)]">
                  🔧 {t('nav.admin', lang)}
                </Link>
              )}

              <div className="divider-modern" />

              {/* Language & Theme in mobile */}
              <div className="flex gap-2 px-1 py-2">
                {langs.map((l) => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                      lang === l ? 'gradient-bg text-white' : 'bg-[rgba(255,255,255,0.06)] text-[var(--text-secondary)]'
                    }`}>
                    {l === 'th' ? '🇹🇭 ไทย' : l === 'en' ? '🇺🇸 EN' : '🇨🇳 中文'}
                  </button>
                ))}
              </div>

              {user ? (
                <button onClick={() => { handleLogout(); setShowMobile(false); }}
                  className="w-full px-4 py-3 rounded-lg text-sm font-medium text-[var(--danger)] hover:bg-[rgba(239,68,68,0.1)] transition-all">
                  🚪 {t('nav.logout', lang)}
                </button>
              ) : (
                <Link href="/auth" onClick={() => setShowMobile(false)}
                  className="block text-center btn-neon btn-neon-1 w-full py-3 mt-2">
                  {t('nav.login', lang)} / {t('nav.register', lang)}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
