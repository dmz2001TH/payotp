'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrdersPage() {
  const { lang, user } = useApp();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [viewOrder, setViewOrder] = useState<any>(null);

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    fetch('/api/orders').then(r => r.json()).then(data => setOrders(data.orders || []));
  }, [user]);

  const getName = (o: any) => o[`name_${lang}`] || o.name_th;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 fade-in">
      <h1 className="text-2xl font-bold mb-8">{t('order.history', lang)}</h1>

      {/* View data modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-md w-full">
            <h2 className="text-lg font-bold mb-2">{getName(viewOrder)}</h2>
            <div className="p-4 rounded-lg mb-4" style={{backgroundColor: 'var(--bg-primary)', fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all', whiteSpace: 'pre-wrap'}}>
              {viewOrder.delivered_data || (lang === 'th' ? 'ไม่มีข้อมูล' : 'No data')}
            </div>
            <button onClick={() => setViewOrder(null)} className="btn-primary w-full">{t('common.back', lang)}</button>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📦</div>
          <p className="mb-4" style={{color: 'var(--text-muted)'}}>
            {lang === 'th' ? 'ยังไม่มีคำสั่งซื้อ' : lang === 'en' ? 'No orders yet' : '暂无订单'}
          </p>
          <Link href="/products" className="btn-primary">{t('hero.cta', lang)}</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o: any) => (
            <div key={o.id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold">{getName(o)}</h3>
                  <p className="text-xs" style={{color: 'var(--text-muted)'}}>
                    {t('order.id', lang)}: {o.id.slice(0, 8)}... • {new Date(o.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`badge ${o.status === 'completed' ? 'badge-green' : 'badge-yellow'}`}>
                  {o.status === 'completed' ? t('order.completed', lang) : t('order.pending', lang)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="price-tag">฿{o.total_price}</span>
                {o.delivered_data && (
                  <button onClick={() => setViewOrder(o)} className="btn-secondary text-sm">
                    👁 {t('order.viewData', lang)}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <Link href="/dashboard/wallet" className="btn-secondary flex-1 text-center py-3">💳 {t('nav.wallet', lang)}</Link>
        <Link href="/dashboard/affiliate" className="btn-secondary flex-1 text-center py-3">👥 {t('affiliate.title', lang)}</Link>
      </div>
    </div>
  );
}
