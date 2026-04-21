'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AffiliatePage() {
  const { lang, user } = useApp();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    fetch('/api/affiliate').then(r => r.json()).then(d => setData(d));
  }, [user]);

  const copyCode = () => {
    if (data?.referral_code) {
      navigator.clipboard.writeText(data.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!data) return <div className="max-w-4xl mx-auto px-4 py-8">{t('common.loading', lang)}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 fade-in">
      <h1 className="text-2xl font-bold mb-8">{t('affiliate.title', lang)}</h1>

      {/* Status */}
      {!data.can_refer && (
        <div className="card p-4 mb-6" style={{borderColor: 'var(--warning)'}}>
          <p className="text-sm" style={{color: 'var(--warning)'}}>
            ⚠️ {t('affiliate.note', lang)}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6 text-center">
          <p className="text-sm mb-1" style={{color: 'var(--text-muted)'}}>{t('affiliate.code', lang)}</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-2xl font-bold font-mono gradient-text">{data.referral_code}</p>
            <button onClick={copyCode} className="btn-secondary text-xs px-2 py-1">
              {copied ? '✅' : '📋'}
            </button>
          </div>
        </div>
        <div className="card p-6 text-center">
          <p className="text-sm mb-1" style={{color: 'var(--text-muted)'}}>{t('affiliate.referrals', lang)}</p>
          <p className="text-2xl font-bold">{data.referral_count}</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-sm mb-1" style={{color: 'var(--text-muted)'}}>{t('affiliate.earn', lang)}</p>
          <p className="text-2xl font-bold text-[var(--accent)]">฿{data.total_earned.toFixed(2)}</p>
        </div>
      </div>

      {/* Share link */}
      <div className="card p-6 mb-8">
        <h2 className="font-bold mb-3">
          {lang === 'th' ? 'ลิงก์แนะนำ' : lang === 'en' ? 'Referral Link' : '推荐链接'}
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth?mode=register&ref=${data.referral_code}`}
            className="input-field flex-1 text-sm"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/auth?mode=register&ref=${data.referral_code}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="btn-primary"
          >
            {copied ? '✅' : '📋'}
          </button>
        </div>
        <p className="text-xs mt-2" style={{color: 'var(--text-muted)'}}>
          {lang === 'th' ? 'รับค่าคอม 5% จากทุกคำสั่งซื้อของเพื่อน' : lang === 'en' ? 'Earn 5% commission from every friend\'s order' : '从每位朋友的订单中获得5%佣金'}
        </p>
      </div>

      {/* Referrals list */}
      {data.referrals.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold mb-4">
            {lang === 'th' ? 'รายชื่อผู้ที่แนะนำ' : lang === 'en' ? 'Referred Users' : '推荐用户'}
          </h2>
          <div className="space-y-3">
            {data.referrals.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg" style={{backgroundColor: 'var(--bg-primary)'}}>
                <div>
                  <p className="font-medium">{r.username}</p>
                  <p className="text-xs" style={{color: 'var(--text-muted)'}}>
                    {new Date(r.user_joined).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-bold text-[var(--accent)]">฿{r.total_earned.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <Link href="/dashboard/wallet" className="btn-secondary flex-1 text-center py-3">💳 {t('nav.wallet', lang)}</Link>
        <Link href="/dashboard/orders" className="btn-secondary flex-1 text-center py-3">📦 {t('order.history', lang)}</Link>
      </div>
    </div>
  );
}
