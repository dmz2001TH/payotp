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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{t('admin.orders', lang)}</h1>
        <Link href="/admin" className="btn-secondary">← {t('common.back', lang)}</Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p style={{color: 'var(--text-muted)'}}>{lang === 'th' ? 'ไม่มีคำสั่งซื้อ' : 'No orders'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <div key={o.id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{getName(o)}</p>
                <p className="text-xs" style={{color: 'var(--text-muted)'}}>
                  {o.id.slice(0, 8)}... • {new Date(o.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">฿{o.total_price}</p>
                <span className={`badge ${o.status === 'completed' ? 'badge-green' : 'badge-yellow'}`}>
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
