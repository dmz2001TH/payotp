'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const { lang, user } = useApp();
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0, pendingDeposits: 0 });

  useEffect(() => {
    if (!user || user.role !== 'admin') { router.push('/'); return; }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const [ordersRes, depositsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/admin/deposits?status=pending'),
      ]);
      const ordersData = await ordersRes.json().catch(() => ({ orders: [] }));
      const depositsData = await depositsRes.json().catch(() => ({ deposits: [] }));
      setStats({
        users: 0,
        orders: ordersData.orders?.length || 0,
        revenue: ordersData.orders?.reduce((s: number, o: any) => s + o.total_price, 0) || 0,
        pendingDeposits: depositsData.deposits?.length || 0,
      });
    } catch {}
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 fade-in">
      <h1 className="text-2xl font-bold mb-8">
        {lang === 'th' ? '🔧 แดชบอร์ดแอดมิน' : lang === 'en' ? '🔧 Admin Dashboard' : '🔧 管理面板'}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 text-center">
          <p className="text-3xl mb-1">📦</p>
          <p className="text-2xl font-bold">{stats.orders}</p>
          <p className="text-xs" style={{color: 'var(--text-muted)'}}>{lang === 'th' ? 'คำสั่งซื้อ' : 'Orders'}</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl mb-1">💰</p>
          <p className="text-2xl font-bold">฿{stats.revenue.toFixed(0)}</p>
          <p className="text-xs" style={{color: 'var(--text-muted)'}}>{lang === 'th' ? 'รายได้' : 'Revenue'}</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl mb-1">⏳</p>
          <p className="text-2xl font-bold">{stats.pendingDeposits}</p>
          <p className="text-xs" style={{color: 'var(--text-muted)'}}>{lang === 'th' ? 'รอเติมเงิน' : 'Pending'}</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl mb-1">💳</p>
          <p className="text-2xl font-bold gradient-text">PayOTP</p>
          <p className="text-xs" style={{color: 'var(--text-muted)'}}>v1.0</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/products" className="card p-6 text-center hover:border-[var(--accent)]">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="font-bold">{t('admin.products', lang)}</h3>
          <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
            {lang === 'th' ? 'เพิ่ม/แก้ไขสินค้า' : 'Add/Edit Products'}
          </p>
        </Link>
        <Link href="/admin/deposits" className="card p-6 text-center hover:border-[var(--accent)]">
          <div className="text-4xl mb-3">💰</div>
          <h3 className="font-bold">{t('admin.deposits', lang)}</h3>
          <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
            {lang === 'th' ? 'อนุมัติการเติมเงิน' : 'Approve Deposits'}
          </p>
        </Link>
        <Link href="/admin/inventory" className="card p-6 text-center hover:border-[var(--accent)]">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-bold">{t('admin.inventory', lang)}</h3>
          <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
            {lang === 'th' ? 'เพิ่มสต็อกสินค้า' : 'Add Stock'}
          </p>
        </Link>
        <Link href="/admin/orders" className="card p-6 text-center hover:border-[var(--accent)]">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="font-bold">{t('admin.orders', lang)}</h3>
          <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
            {lang === 'th' ? 'ดูคำสั่งซื้อทั้งหมด' : 'View All Orders'}
          </p>
        </Link>
      </div>
    </div>
  );
}
