'use client';
import { useApp } from './AppContext';
import { t } from '@/lib/i18n';
import Link from 'next/link';

export default function Footer() {
  const { lang } = useApp();

  return (
    <footer className="footer-modern">
      <div className="container-app py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-lg"
              style={{
                background: 'var(--gradient-primary)',
                boxShadow: 'var(--shadow-neon)',
                color: 'var(--primary-foreground)',
              }}
            >
              P
            </div>
            <span className="font-extrabold tracking-wide text-base">PayOTP<span style={{ color: 'var(--primary)' }}>.COM</span></span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {lang === 'th'
              ? 'เว็บจำหน่าย OTP, แอคเคาท์พรีเมียม และเติมเกม ราคาถูกที่สุด ส่งทันที 24 ชม.'
              : lang === 'en'
              ? 'OTP, Premium Accounts & Game Top-up platform. Cheapest prices, instant delivery 24/7.'
              : 'OTP、高级账号和游戏充值平台。最低价，24/7即时送达。'}
          </p>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-bold mb-3 text-sm">
            {lang === 'th' ? 'บริการ' : lang === 'en' ? 'Services' : '服务'}
          </h4>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li><Link href="/products?category=otp" className="transition-colors hover:text-[var(--primary)]">{lang === 'th' ? 'รับ OTP' : 'OTP'}</Link></li>
            <li><Link href="/products?category=premium" className="transition-colors hover:text-[var(--primary)]">{lang === 'th' ? 'แอคเคาท์พรีเมียม' : 'Premium Accounts'}</Link></li>
            <li><Link href="/products?category=ai" className="transition-colors hover:text-[var(--primary)]">AI Tools</Link></li>
            <li><Link href="/products?category=games" className="transition-colors hover:text-[var(--primary)]">{lang === 'th' ? 'เติมเกม' : 'Game Top-up'}</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="font-bold mb-3 text-sm">
            {lang === 'th' ? 'ช่วยเหลือ' : lang === 'en' ? 'Help' : '帮助'}
          </h4>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li><Link href="/products" className="transition-colors hover:text-[var(--primary)]">{t('nav.products', lang)}</Link></li>
            <li><Link href="/auth" className="transition-colors hover:text-[var(--primary)]">{t('nav.login', lang)}</Link></li>
            <li><Link href="/auth?mode=register" className="transition-colors hover:text-[var(--primary)]">{t('nav.register', lang)}</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold mb-3 text-sm">
            {lang === 'th' ? 'ติดต่อเรา' : lang === 'en' ? 'Contact' : '联系我们'}
          </h4>
          <div className="flex items-center gap-3 mb-4">
            <a href="#" aria-label="LINE" className="w-10 h-10 rounded-full flex items-center justify-center glow-ring transition-all hover:scale-110">
              <svg className="w-4 h-4" style={{ color: 'var(--primary)' }} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.58 2 10c0 2.24 1.12 4.24 2.88 5.6L4 22l5.6-2.8c.88.24 1.8.4 2.8.4 5.52 0 10-3.58 10-8S17.52 2 12 2z" /></svg>
            </a>
            <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full flex items-center justify-center glow-ring transition-all hover:scale-110">
              <svg className="w-4 h-4" style={{ color: 'var(--primary)' }} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
            <a href="#" aria-label="Email" className="w-10 h-10 rounded-full flex items-center justify-center glow-ring transition-all hover:scale-110">
              <svg className="w-4 h-4" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </a>
          </div>
          <div className="inline-flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-4 h-4" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            {lang === 'th' ? 'ปลอดภัยด้วย SSL' : 'SSL Secured'}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: 'oklch(1 0 0 / 0.05)' }}>
        <div className="container-app py-5 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} PayOTP.COM — {lang === 'th' ? 'สงวนลิขสิทธิ์' : lang === 'en' ? 'All rights reserved' : '版权所有'}
        </div>
      </div>
    </footer>
  );
}
