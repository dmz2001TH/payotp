'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const { lang, user } = useApp();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { router.push('/'); return; }
    fetch('/api/orders').then(r => r.json()).then(data => setOrders(data.orders || []));
  }, [user]);

  const getName = (o: any) => o[`name_${lang}`] || o.name_th;

  // Stats
  const totalRevenue = orders.reduce((s, o) => s + o.total_price, 0);
  const completedCount = orders.filter((o) => o.status === 'completed').length;

  return (
    <div className="animate-fade-in">
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container-app py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold">📊 {t('admin.orders', lang)}</h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {orders.length} {lang === 'th' ? 'คำสั่งซื้อ' : 'orders'}
              </p>
            </div>
            <Link href="/admin" className="btn-secondary text-sm self-start">← {t('common.back', lang)}</Link>
          </div>
        </div>
      </div>

      <div className="container-app py-6 md:py-8">
        {/* Stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
            <div className="stat-card">
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'ทั้งหมด' : 'Total'}</p>
              <p className="stat-value">{orders.length}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{t('order.completed', lang)}</p>
              <p className="stat-value text-[var(--success)]">{completedCount}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'รายได้รวม' : 'Revenue'}</p>
              <p className="stat-value">฿{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Orders list */}
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">📭</div>
            <p style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'ไม่มีคำสั่งซื้อ' : 'No orders'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o: any) => (
              <div key={o.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: o.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }}>
                    {o.status === 'completed' ? '✅' : '⏳'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{getName(o)}</p>
                    <p className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }}>
                      {o.id.slice(0, 8)}...
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      👤 {o.username || o.user_id?.slice(0, 8)} • {new Date(o.created_at).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 flex-shrink-0">
                  <p className="font-bold text-lg">฿{o.total_price}</p>
                  <span className={`badge ${o.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
