'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { useToast } from '@/components/Toast';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrdersPage() {
  const { lang, user } = useApp();
  const toast = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      toast.showToast(t('toast.error', lang), 'error');
    } finally {
      setLoading(false);
    }
  };

  const getName = (o: any) => o[`name_${lang}`] || o.name_th;

  // Stats
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container-app py-8">
          <h1 className="text-2xl md:text-3xl font-extrabold">
            📦 {t('order.history', lang)}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {lang === 'th' ? 'ดูคำสั่งซื้อและข้อมูลสินค้าที่ได้รับ' : lang === 'en' ? 'View your orders and delivered data' : '查看订单和已交付的数据'}
          </p>
        </div>
      </div>

      <div className="container-app py-8">
        {/* View data modal */}
        {viewOrder && (
          <div className="modal-overlay">
            <div className="modal-content p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold">{getName(viewOrder)}</h2>
                <button onClick={() => setViewOrder(null)} className="btn-ghost text-xl">✕</button>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                {t('order.id', lang)}: {viewOrder.id.slice(0, 8)}...
              </p>
              <div
                className="p-5 rounded-xl mb-6 font-mono text-sm break-all leading-relaxed"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {viewOrder.delivered_data || (lang === 'th' ? 'ไม่มีข้อมูล' : 'No data')}
              </div>
              <button onClick={() => setViewOrder(null)} className="btn-primary w-full py-3">
                {t('common.back', lang)}
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="stat-card">
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                {lang === 'th' ? 'คำสั่งซื้อทั้งหมด' : lang === 'en' ? 'Total Orders' : '总订单'}
              </p>
              <p className="stat-value">{orders.length}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{t('order.completed', lang)}</p>
              <p className="stat-value text-[var(--success)]">{completedCount}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{t('order.total', lang)}</p>
              <p className="stat-value">฿{totalSpent.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Orders list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6">
                <div className="skeleton h-5 w-48 mb-3" />
                <div className="skeleton h-4 w-32" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-bold text-lg mb-2">
              {lang === 'th' ? 'ยังไม่มีคำสั่งซื้อ' : lang === 'en' ? 'No orders yet' : '暂无订单'}
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              {lang === 'th' ? 'เลือกซื้อสินค้าเพื่อเริ่มต้น' : lang === 'en' ? 'Start shopping to see your orders here' : '开始购物以查看您的订单'}
            </p>
            <Link href="/products" className="btn-primary px-8 py-3">
              {t('hero.cta', lang)} →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o: any) => (
              <div key={o.id} className="card p-5 md:p-6 hover:border-[var(--primary)] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: o.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }}>
                      {o.status === 'completed' ? '✅' : '⏳'}
                    </div>
                    <div>
                      <h3 className="font-bold">{getName(o)}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t('order.id', lang)}: <span className="font-mono">{o.id.slice(0, 8)}...</span>
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${o.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                    {o.status === 'completed' ? t('order.completed', lang) : t('order.pending', lang)}
                  </span>
                </div>
                <div className="flex items-center justify-between pl-13">
                  <div className="flex items-center gap-3">
                    <span className="price-sm">฿{o.total_price}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(o.created_at).toLocaleString(lang === 'th' ? 'th-TH' : lang === 'zh' ? 'zh-CN' : 'en-US')}
                    </span>
                  </div>
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

        {/* Quick nav */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <Link href="/dashboard/wallet" className="card p-5 text-center hover:border-[var(--primary)] transition-all">
            <span className="text-2xl mb-2 block">💳</span>
            <span className="text-sm font-bold">{t('nav.wallet', lang)}</span>
          </Link>
          <Link href="/dashboard/affiliate" className="card p-5 text-center hover:border-[var(--primary)] transition-all">
            <span className="text-2xl mb-2 block">👥</span>
            <span className="text-sm font-bold">{t('affiliate.title', lang)}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
