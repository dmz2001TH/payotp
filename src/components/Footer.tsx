'use client';
import { useApp } from './AppContext';
import { t } from '@/lib/i18n';

export default function Footer() {
  const { lang } = useApp();

  return (
    <footer style={{backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)'}} className="mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="text-center">
            <div className="text-3xl mb-2">🕐</div>
            <div className="text-sm font-medium">{t('footer.open24', lang)}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-sm font-medium">{t('footer.autoDelivery', lang)}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm font-medium">{t('footer.cheapest', lang)}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <div className="text-sm font-medium">{t('footer.secure', lang)}</div>
          </div>
        </div>

        {/* Bottom */}
        <div className="text-center pt-6" style={{borderTop: '1px solid var(--border-color)'}}>
          <p className="text-sm" style={{color: 'var(--text-muted)'}}>
            © 2024 PayOTP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
