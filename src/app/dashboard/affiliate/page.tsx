'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { useToast } from '@/components/Toast';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AffiliatePage() {
  const { lang, user, authLoading } = useApp();
  const toast = useToast();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth'); return; }
    fetch('/api/affiliate')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, authLoading]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.showToast(t('common.copied', lang), 'success');
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="container-app py-8">
            <div className="skeleton h-8 w-48" />
          </div>
        </div>
        <div className="container-app py-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="stat-card"><div className="skeleton h-6 w-24 mx-auto" /></div>)}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/auth?mode=register&ref=${data.referral_code}`
    : '';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container-app py-8">
          <h1 className="text-2xl md:text-3xl font-extrabold">
            👥 {t('affiliate.title', lang)}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {lang === 'th' ? 'ชวนเพื่อน รับค่าคอมมิชชั่น 5%' : lang === 'en' ? 'Invite friends, earn 5% commission' : '邀请朋友，获得5%佣金'}
          </p>
        </div>
      </div>

      <div className="container-app py-8">
        {/* Status warning */}
        {!data.can_refer && (
          <div className="card p-5 mb-8 flex items-start gap-4" style={{ borderColor: 'var(--warning)', borderWidth: '1.5px' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
              style={{ background: 'rgba(245,158,11,0.1)' }}>
              ⚠️
            </div>
            <div>
              <p className="font-bold text-sm">{lang === 'th' ? 'ยังเปิดใช้งานไม่ได้' : lang === 'en' ? 'Not yet activated' : '尚未激活'}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {t('affiliate.note', lang)}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{t('affiliate.referrals', lang)}</p>
            <p className="stat-value">{data.referral_count}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{t('affiliate.earn', lang)}</p>
            <p className="stat-value text-[var(--accent)]">฿{data.total_earned.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
              {lang === 'th' ? 'อัตราคอมมิชชั่น' : lang === 'en' ? 'Commission Rate' : '佣金比例'}
            </p>
            <p className="stat-value text-[var(--success)]">5%</p>
          </div>
        </div>

        {/* Referral code & link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Code */}
          <div className="card p-6 md:p-8">
            <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-muted)' }}>
              {t('affiliate.code', lang)}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 p-4 rounded-xl text-center" style={{ background: 'var(--bg-input)' }}>
                <p className="text-2xl font-extrabold font-mono gradient-text tracking-wider">
                  {data.referral_code}
                </p>
              </div>
              <button onClick={() => copyToClipboard(data.referral_code)} className="btn-primary h-[52px] w-[52px] flex-shrink-0">
                📋
              </button>
            </div>
          </div>

          {/* Link */}
          <div className="card p-6 md:p-8">
            <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-muted)' }}>
              {lang === 'th' ? 'ลิงก์แนะนำ' : lang === 'en' ? 'Referral Link' : '推荐链接'}
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="input-field flex-1 text-xs font-mono"
              />
              <button onClick={() => copyToClipboard(referralLink)} className="btn-primary h-[42px] w-[52px] flex-shrink-0">
                📋
              </button>
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
              💡 {lang === 'th' ? 'แชร์ลิงก์นี้ให้เพื่อนสมัคร คุณจะได้รับค่าคอม 5% จากทุกคำสั่งซื้อ' : lang === 'en' ? 'Share this link. You earn 5% from every friend\'s purchase.' : '分享此链接，您将从每位朋友的购买中获得5%佣金'}
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="card p-6 md:p-8 mb-8">
          <h2 className="text-lg font-extrabold mb-5">
            {lang === 'th' ? 'วิธีการทำงาน' : lang === 'en' ? 'How It Works' : '运作方式'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                icon: '📤',
                title_th: 'แชร์ลิงก์',
                title_en: 'Share Link',
                title_zh: '分享链接',
                desc_th: 'ส่งลิงก์แนะนำให้เพื่อนของคุณ',
                desc_en: 'Send your referral link to friends',
                desc_zh: '将推荐链接发送给朋友',
              },
              {
                step: '2',
                icon: '📝',
                title_th: 'เพื่อนสมัคร',
                title_en: 'Friend Signs Up',
                title_zh: '朋友注册',
                desc_th: 'เพื่อนสมัครผ่านลิงก์ของคุณ',
                desc_en: 'Friend registers through your link',
                desc_zh: '朋友通过您的链接注册',
              },
              {
                step: '3',
                icon: '💰',
                title_th: 'รับค่าคอม',
                title_en: 'Earn Commission',
                title_zh: '赚取佣金',
                desc_th: 'รับ 5% จากทุกคำสั่งซื้อของเพื่อน',
                desc_en: 'Earn 5% from every friend\'s order',
                desc_zh: '从每位朋友的订单中获得5%佣金',
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl"
                  style={{ background: 'var(--primary-50)' }}>
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-[var(--primary)] mb-1">
                  {lang === 'th' ? 'ขั้นตอน' : 'Step'} {item.step}
                </div>
                <h3 className="font-bold text-sm mb-1">
                  {item[`title_${lang}` as keyof typeof item]}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {item[`desc_${lang}` as keyof typeof item]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Referrals list */}
        {data.referrals.length > 0 && (
          <div className="card p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold">
                {lang === 'th' ? 'รายชื่อผู้ที่แนะนำ' : lang === 'en' ? 'Referred Users' : '推荐用户'}
              </h2>
              <span className="badge badge-primary">{data.referrals.length}</span>
            </div>
            <div className="space-y-3">
              {data.referrals.map((r: any) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-4 rounded-xl transition-all"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center text-white text-sm font-bold">
                      {r.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{r.username}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(r.user_joined).toLocaleDateString(lang === 'th' ? 'th-TH' : lang === 'zh' ? 'zh-CN' : 'en-US')}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-[var(--accent)]">฿{r.total_earned.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick nav */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <Link href="/dashboard/wallet" className="card p-5 text-center hover:border-[var(--primary)] transition-all">
            <span className="text-2xl mb-2 block">💳</span>
            <span className="text-sm font-bold">{t('nav.wallet', lang)}</span>
          </Link>
          <Link href="/dashboard/orders" className="card p-5 text-center hover:border-[var(--primary)] transition-all">
            <span className="text-2xl mb-2 block">📦</span>
            <span className="text-sm font-bold">{t('order.history', lang)}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
