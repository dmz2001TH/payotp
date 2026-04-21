'use client';
import { useApp } from './AppContext';
import { t } from '@/lib/i18n';
import Link from 'next/link';

export default function Footer() {
  const { lang } = useApp();

  const features = [
    { icon: '🕐', label: t('footer.open24', lang) },
    { icon: '⚡', label: t('footer.autoDelivery', lang) },
    { icon: '💰', label: t('footer.cheapest', lang) },
    { icon: '🔒', label: t('footer.secure', lang) },
  ];

  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }} className="mt-20">
      {/* Features Bar */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container-app py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 justify-center md:justify-start">
                <span className="text-2xl">{f.icon}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-app py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-sm">
                P
              </div>
              <span className="text-lg font-extrabold gradient-text">PayOTP</span>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)', maxWidth: '320px' }}>
              {lang === 'th'
                ? 'แพลตฟอร์มจำหน่าย OTP, แอคเคาท์พรีเมียม, AI Tools และเติมเกม ราคาถูกที่สุด ส่งทันที 24 ชม.'
                : lang === 'en'
                ? 'The platform for OTP, Premium Accounts, AI Tools, and Game Top-up. Cheapest prices, instant delivery 24/7.'
                : 'OTP、高级账号、AI工具和游戏充值平台。最低价，24/7即时送达。'}
            </p>
            <div className="flex items-center gap-3">
              <span className="badge badge-success">
                <span className="stock-dot stock-dot-high"></span>
                {lang === 'th' ? 'ออนไลน์' : 'Online'}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              {lang === 'th' ? 'ลิงก์ด่วน' : lang === 'en' ? 'Quick Links' : '快速链接'}
            </h4>
            <div className="space-y-2">
              <Link href="/products" className="block text-sm hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-muted)' }}>
                {t('nav.products', lang)}
              </Link>
              <Link href="/auth" className="block text-sm hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-muted)' }}>
                {t('nav.login', lang)}
              </Link>
              <Link href="/auth?mode=register" className="block text-sm hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-muted)' }}>
                {t('nav.register', lang)}
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              {lang === 'th' ? 'ติดต่อเรา' : lang === 'en' ? 'Contact' : '联系我们'}
            </h4>
            <div className="space-y-2">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                📧 support@payotp.com
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                💬 LINE: @payotp
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container-app py-4">
          <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2024 PayOTP. {lang === 'th' ? 'สงวนลิขสิทธิ์' : lang === 'en' ? 'All rights reserved' : '版权所有'}
          </p>
        </div>
      </div>
    </footer>
  );
}
