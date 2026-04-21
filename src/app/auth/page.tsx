'use client';
import { useState, useEffect, Suspense } from 'react';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthContent() {
  const { lang, fetchUser } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', referralCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (form.password !== form.confirmPassword) {
          setError(lang === 'th' ? 'รหัสผ่านไม่ตรงกัน' : lang === 'en' ? 'Passwords do not match' : '密码不匹配');
          setLoading(false);
          return;
        }
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            password: form.password,
            referralCode: form.referralCode,
            language: lang,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        await fetchUser();
        router.push('/products');
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: form.username, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        await fetchUser();
        router.push('/products');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 fade-in">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            P
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {mode === 'login' ? t('nav.login', lang) : t('nav.register', lang)}
          </h1>
        </div>

        {/* Toggle */}
        <div className="flex rounded-lg p-1 mb-6" style={{backgroundColor: 'var(--bg-primary)'}}>
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'login' ? 'gradient-bg text-white shadow' : ''}`}
          >
            {t('nav.login', lang)}
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'register' ? 'gradient-bg text-white shadow' : ''}`}
          >
            {t('nav.register', lang)}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{backgroundColor: 'var(--danger)', color: 'white', opacity: 0.9}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.username', lang)}</label>
            <input
              type="text"
              className="input-field"
              value={form.username}
              onChange={(e) => setForm({...form, username: e.target.value})}
              required
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-1">{t('auth.email', lang)}</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.password', lang)}</label>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              required
              minLength={6}
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">{t('auth.confirmPassword', lang)}</label>
                <input
                  type="password"
                  className="input-field"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('auth.referralCode', lang)}</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.referralCode}
                  onChange={(e) => setForm({...form, referralCode: e.target.value.toUpperCase()})}
                  placeholder="XXXXXXXX"
                />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? t('common.loading', lang) : mode === 'login' ? t('auth.loginBtn', lang) : t('auth.registerBtn', lang)}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{color: 'var(--text-muted)'}}>
          {mode === 'login' ? t('auth.noAccount', lang) : t('auth.hasAccount', lang)}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-[var(--accent)] font-medium hover:underline"
          >
            {mode === 'login' ? t('nav.register', lang) : t('nav.login', lang)}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
