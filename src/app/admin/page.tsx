'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const { lang, user, authLoading } = useApp();
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0, pendingDeposits: 0 });

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') { router.push('/'); return; }
    loadStats();
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

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

  const adminCards = [
    { href: '/admin/products', icon: '📦', label: t('admin.products', lang), desc_th: 'เพิ่ม/แก้ไขสินค้า', desc_en: 'Add/Edit Products', desc_zh: '添加/编辑商品' },
    { href: '/admin/deposits', icon: '💰', label: t('admin.deposits', lang), desc_th: 'อนุมัติการเติมเงิน', desc_en: 'Approve Deposits', desc_zh: '审批充值', badge: stats.pendingDeposits > 0 ? stats.pendingDeposits : undefined },
    { href: '/admin/inventory', icon: '📋', label: t('admin.inventory', lang), desc_th: 'เพิ่มสต็อกสินค้า', desc_en: 'Add Stock', desc_zh: '添加库存' },
    { href: '/admin/orders', icon: '📊', label: t('admin.orders', lang), desc_th: 'ดูคำสั่งซื้อทั้งหมด', desc_en: 'View All Orders', desc_zh: '查看所有订单' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container-app py-6 md:py-8">
          <h1 className="text-xl md:text-2xl font-extrabold">
            🔧 {lang === 'th' ? 'แดชบอร์ดแอดมิน' : lang === 'en' ? 'Admin Dashboard' : '管理面板'}
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {lang === 'th' ? 'จัดการร้านค้าของคุณ' : lang === 'en' ? 'Manage your store' : '管理您的商店'}
          </p>
        </div>
      </div>

      <div className="container-app py-6 md:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <div className="stat-card">
            <p className="text-2xl md:text-3xl mb-1">📦</p>
            <p className="stat-value">{stats.orders}</p>
            <p className="stat-label">{lang === 'th' ? 'คำสั่งซื้อ' : 'Orders'}</p>
          </div>
          <div className="stat-card">
            <p className="text-2xl md:text-3xl mb-1">💰</p>
            <p className="stat-value">฿{stats.revenue.toFixed(0)}</p>
            <p className="stat-label">{lang === 'th' ? 'รายได้' : 'Revenue'}</p>
          </div>
          <div className="stat-card">
            <p className="text-2xl md:text-3xl mb-1">⏳</p>
            <p className="stat-value" style={{ color: stats.pendingDeposits > 0 ? 'var(--warning)' : undefined }}>{stats.pendingDeposits}</p>
            <p className="stat-label">{lang === 'th' ? 'รอเติมเงิน' : 'Pending'}</p>
          </div>
          <div className="stat-card">
            <p className="text-2xl md:text-3xl mb-1">💳</p>
            <p className="text-xl font-extrabold gradient-text">PayOTP</p>
            <p className="stat-label">v1.0</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {adminCards.map((card) => (
            <Link key={card.href} href={card.href} className="card p-5 md:p-6 text-center hover:border-[var(--primary)] transition-all relative">
              {card.badge && (
                <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--danger)] text-white text-xs font-bold flex items-center justify-center">
                  {card.badge}
                </span>
              )}
              <div className="text-3xl md:text-4xl mb-3">{card.icon}</div>
              <h3 className="font-bold text-sm md:text-base">{card.label}</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {card[`desc_${lang}` as keyof typeof card]}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
