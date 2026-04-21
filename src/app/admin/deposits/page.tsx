'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDepositsPage() {
  const { lang, user } = useApp();
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

  const handleAction = async (depositId: string, action: 'confirm' | 'reject') => {
    setLoading(true);
    await fetch('/api/admin/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId, action }),
    });
    loadDeposits();
    setLoading(false);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, {class: string, text: string}> = {
      pending: { class: 'badge-yellow', text: lang === 'th' ? 'รอชำระเงิน' : 'Pending' },
      awaiting_confirm: { class: 'badge-yellow', text: lang === 'th' ? 'รอยืนยัน' : 'Awaiting' },
      completed: { class: 'badge-green', text: lang === 'th' ? 'สำเร็จ' : 'Completed' },
      rejected: { class: 'badge-red', text: lang === 'th' ? 'ปฏิเสธ' : 'Rejected' },
    };
    const s = map[status] || map.pending;
    return <span className={`badge ${s.class}`}>{s.text}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{t('admin.deposits', lang)}</h1>
        <Link href="/admin" className="btn-secondary">← {t('common.back', lang)}</Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['pending', 'awaiting_confirm', 'completed', 'rejected', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${filter === s ? 'gradient-bg text-white' : 'btn-secondary'}`}
          >
            {s === 'all' ? (lang === 'th' ? 'ทั้งหมด' : 'All') : statusBadge(s).props.children}
          </button>
        ))}
      </div>

      {/* Deposits list */}
      {deposits.length === 0 ? (
        <div className="text-center py-20">
          <p style={{color: 'var(--text-muted)'}}>{lang === 'th' ? 'ไม่มีรายการ' : 'No deposits'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deposits.map((d: any) => (
            <div key={d.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-lg">฿{d.amount.toFixed(2)}</p>
                  <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
                    👤 {d.username} ({d.email})
                  </p>
                  <p className="text-xs" style={{color: 'var(--text-muted)'}}>
                    {d.method.toUpperCase()} • Ref: {d.reference_code} • {new Date(d.created_at).toLocaleString()}
                  </p>
                </div>
                {statusBadge(d.status)}
              </div>
              {(d.status === 'pending' || d.status === 'awaiting_confirm') && (
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => handleAction(d.id, 'confirm')}
                    disabled={loading}
                    className="btn-primary flex-1 bg-green-600 hover:bg-green-700"
                    style={{background: 'linear-gradient(135deg, #22c55e, #16a34a)'}}
                  >
                    ✅ {t('admin.confirm', lang)} — เติม ฿{d.amount.toFixed(2)}
                  </button>
                  <button
                    onClick={() => handleAction(d.id, 'reject')}
                    disabled={loading}
                    className="btn-secondary flex-1 text-[var(--danger)]"
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
  );
}
