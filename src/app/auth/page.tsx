'use client';
import { useState, Suspense } from 'react';
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white font-extrabold text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/20">
            P
          </div>
          <h1 className="text-2xl font-extrabold">
            {mode === 'login'
              ? (lang === 'th' ? 'ยินดีต้อนรับกลับ' : lang === 'en' ? 'Welcome Back' : '欢迎回来')
              : (lang === 'th' ? 'สร้างบัญชีใหม่' : lang === 'en' ? 'Create Account' : '创建账户')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {mode === 'login'
              ? (lang === 'th' ? 'เข้าสู่ระบบเพื่อดำเนินการต่อ' : lang === 'en' ? 'Sign in to continue' : '登录以继续')
              : (lang === 'th' ? 'สมัครสมาชิกฟรี ใช้เวลาไม่ถึง 1 นาที' : lang === 'en' ? 'Free registration, takes less than 1 minute' : '免费注册，不到1分钟')}
          </p>
        </div>

        <div className="card p-8">
          {/* Toggle */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: 'var(--bg-input)' }}>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === 'login' ? 'gradient-bg text-white shadow-md' : ''
              }`}
            >
              {t('nav.login', lang)}
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === 'register' ? 'gradient-bg text-white shadow-md' : ''
              }`}
            >
              {t('nav.register', lang)}
            </button>
          </div>

          {error && (
            <div className="toast-error mb-5 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">{t('auth.username', lang)}</label>
              <input
                type="text"
                className="input-field"
                value={form.username}
                onChange={(e) => setForm({...form, username: e.target.value})}
                required
                placeholder={lang === 'th' ? 'กรอกชื่อผู้ใช้' : 'Enter username'}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="input-label">{t('auth.email', lang)}</label>
                <input
                  type="email"
                  className="input-field"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  required
                  placeholder="email@example.com"
                />
              </div>
            )}

            <div>
              <label className="input-label">{t('auth.password', lang)}</label>
              <input
                type="password"
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                required
                minLength={6}
                placeholder="••••••••"
              />
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="input-label">{t('auth.confirmPassword', lang)}</label>
                  <input
                    type="password"
                    className="input-field"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                    required
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="input-label">{t('auth.referralCode', lang)}</label>
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

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
              {loading
                ? (lang === 'th' ? 'กำลังดำเนินการ...' : lang === 'en' ? 'Processing...' : '处理中...')
                : mode === 'login' ? t('auth.loginBtn', lang) : t('auth.registerBtn', lang)}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            {mode === 'login' ? t('auth.noAccount', lang) : t('auth.hasAccount', lang)}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-[var(--primary)] font-semibold hover:underline"
            >
              {mode === 'login' ? t('nav.register', lang) : t('nav.login', lang)}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="skeleton w-20 h-20 rounded-full"></div></div>}>
      <AuthContent />
    </Suspense>
  );
}
