'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { useToast } from '@/components/Toast';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDepositsPage() {
  const { lang, user } = useApp();
  const toast = useToast();
  const router = useRouter();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') { router.push('/'); return; }
    loadDeposits();
  }, [user, filter]);

  const loadDeposits = async () => {
    const res = await fetch(`/api/admin/deposits?status=${filter}`);
    if (res.ok) {
      const data = await res.json();
      setDeposits(data.deposits || []);
    }
  };

  const handleAction = async (depositId: string, action: 'confirm' | 'reject', amount: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId, action }),
      });
      if (res.ok) {
        toast.showToast(
          action === 'confirm'
            ? `${t('toast.confirmSuccess', lang)} — ฿${amount.toFixed(2)}`
            : t('toast.deleteSuccess', lang),
          action === 'confirm' ? 'success' : 'info'
        );
        loadDeposits();
      }
    } catch {
      toast.showToast(t('toast.error', lang), 'error');
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { key: 'pending', label_th: 'รอชำระ', label_en: 'Pending', label_zh: '待付款' },
    { key: 'awaiting_confirm', label_th: 'รอยืนยัน', label_en: 'Awaiting', label_zh: '待确认' },
    { key: 'completed', label_th: 'สำเร็จ', label_en: 'Completed', label_zh: '已完成' },
    { key: 'rejected', label_th: 'ปฏิเสธ', label_en: 'Rejected', label_zh: '已拒绝' },
    { key: 'all', label_th: 'ทั้งหมด', label_en: 'All', label_zh: '全部' },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, { class: string; icon: string; text: string }> = {
      pending: { class: 'badge-warning', icon: '⏳', text: lang === 'th' ? 'รอชำระเงิน' : lang === 'en' ? 'Pending' : '待付款' },
      awaiting_confirm: { class: 'badge-warning', icon: '🔍', text: lang === 'th' ? 'รอยืนยัน' : lang === 'en' ? 'Awaiting' : '待确认' },
      completed: { class: 'badge-success', icon: '✅', text: lang === 'th' ? 'สำเร็จ' : lang === 'en' ? 'Completed' : '已完成' },
      rejected: { class: 'badge-danger', icon: '❌', text: lang === 'th' ? 'ปฏิเสธ' : lang === 'en' ? 'Rejected' : '已拒绝' },
    };
    const s = map[status] || map.pending;
    return <span className={`badge ${s.class}`}>{s.icon} {s.text}</span>;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container-app py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold">💰 {t('admin.deposits', lang)}</h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {deposits.length} {lang === 'th' ? 'รายการ' : 'items'}
              </p>
            </div>
            <Link href="/admin" className="btn-secondary text-sm self-start">← {t('common.back', lang)}</Link>
          </div>
        </div>
      </div>

      <div className="container-app py-6 md:py-8">
        {/* Filter — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6" style={{ scrollbarWidth: 'none' }}>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f.key ? 'gradient-bg text-white shadow-md' : 'btn-secondary'
              }`}
            >
              {f[`label_${lang}` as keyof typeof f]}
            </button>
          ))}
        </div>

        {/* Deposits list */}
        {deposits.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">📭</div>
            <p style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'ไม่มีรายการ' : 'No deposits'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deposits.map((d: any) => (
              <div key={d.id} className="card p-4 md:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: d.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }}>
                      {d.status === 'completed' ? '✅' : '⏳'}
                    </div>
                    <div>
                      <p className="font-bold text-lg">฿{d.amount.toFixed(2)}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        👤 {d.username}
                        <span className="hidden sm:inline"> ({d.email})</span>
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {d.method.toUpperCase()} • Ref: {d.reference_code}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(d.created_at).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US')}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {statusBadge(d.status)}
                  </div>
                </div>
                {(d.status === 'pending' || d.status === 'awaiting_confirm') && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={() => handleAction(d.id, 'confirm', d.amount)}
                      disabled={loading}
                      className="btn-success flex-1 py-2.5 text-sm"
                    >
                      ✅ {t('admin.confirm', lang)} — ฿{d.amount.toFixed(2)}
                    </button>
                    <button
                      onClick={() => handleAction(d.id, 'reject', d.amount)}
                      disabled={loading}
                      className="btn-danger flex-1 py-2.5 text-sm"
                    >
                      ❌ {t('admin.reject', lang)}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
