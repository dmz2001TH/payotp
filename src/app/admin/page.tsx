'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const { lang, user, authLoading } = useApp();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') { router.push('/'); return; }
    loadStats();
  }, [user, authLoading]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {}
    setLoading(false);
  };

  if (authLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" /></div>;
  }
  if (!user || user.role !== 'admin') return null;

  const overview = stats?.overview || { totalUsers: 0, totalOrders: 0, totalRevenue: 0, pendingDeposits: 0, outOfStock: 0 };

  const adminMenu = [
    { href: '/admin/users', icon: '👥', label: lang === 'th' ? 'จัดการผู้ใช้' : lang === 'en' ? 'Users' : '用户管理', desc: lang === 'th' ? 'ดู/แก้ไขบัญชีผู้ใช้ เติมเงิน หักเงิน' : 'View/edit users, deposit, withdraw', color: 'oklch(0.78 0.16 235)' },
    { href: '/admin/products', icon: '📦', label: t('admin.products', lang), desc: lang === 'th' ? 'เพิ่ม/แก้ไข/ลบสินค้า' : 'Add/edit/delete products', color: 'oklch(0.74 0.18 152)' },
    { href: '/admin/inventory', icon: '📋', label: t('admin.inventory', lang), desc: lang === 'th' ? 'เพิ่ม/นำเข้าสต็อกสินค้า' : 'Add/import product stock', color: 'oklch(0.82 0.17 80)' },
    { href: '/admin/deposits', icon: '💰', label: t('admin.deposits', lang), desc: lang === 'th' ? 'อนุมัติ/ปฏิเสธการเติมเงิน' : 'Approve/reject deposits', color: 'oklch(0.65 0.22 22)', badge: overview.pendingDeposits > 0 ? overview.pendingDeposits : undefined },
    { href: '/admin/orders', icon: '📊', label: t('admin.orders', lang), desc: lang === 'th' ? 'ดูคำสั่งซื้อทั้งหมด' : 'View all orders', color: 'oklch(0.7 0.18 220)' },
    { href: '/admin/settings', icon: '⚙️', label: lang === 'th' ? 'ตั้งค่าระบบ' : lang === 'en' ? 'Settings' : '系统设置', desc: lang === 'th' ? 'ตั้งค่าร้านค้า API ชำระเงิน' : 'Store settings, API, payments', color: 'oklch(0.72 0.04 240)' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container-app py-6 md:py-8">
          <h1 className="text-xl md:text-2xl font-extrabold">
            🔧 {lang === 'th' ? 'แดชบอร์ดแอดมิน' : lang === 'en' ? 'Admin Dashboard' : '管理面板'}
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {lang === 'th' ? 'ยินดีต้อนรับ, ' : 'Welcome, '}{user.username} • {lang === 'th' ? 'จัดการร้านค้าของคุณ' : 'Manage your store'}
          </p>
        </div>
      </div>

      <div className="container-app py-6 md:py-8">
        {/* Real stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
          {loading ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="stat-card"><div className="skeleton h-8 w-16 mx-auto mb-2" /><div className="skeleton h-4 w-20 mx-auto" /></div>
          )) : (
            <>
              <div className="stat-card">
                <p className="text-2xl md:text-3xl mb-1">👥</p>
                <p className="stat-value">{overview.totalUsers}</p>
                <p className="stat-label">{lang === 'th' ? 'ผู้ใช้ทั้งหมด' : 'Total Users'}</p>
              </div>
              <div className="stat-card">
                <p className="text-2xl md:text-3xl mb-1">📦</p>
                <p className="stat-value">{overview.totalOrders}</p>
                <p className="stat-label">{lang === 'th' ? 'คำสั่งซื้อ' : 'Orders'}</p>
              </div>
              <div className="stat-card">
                <p className="text-2xl md:text-3xl mb-1">💰</p>
                <p className="stat-value">฿{Number(overview.totalRevenue).toLocaleString()}</p>
                <p className="stat-label">{lang === 'th' ? 'รายได้' : 'Revenue'}</p>
              </div>
              <div className="stat-card" style={overview.pendingDeposits > 0 ? { borderColor: 'oklch(0.65 0.22 22 / 0.5)' } : undefined}>
                <p className="text-2xl md:text-3xl mb-1">⏳</p>
                <p className="stat-value" style={{ color: overview.pendingDeposits > 0 ? 'var(--warning)' : undefined }}>{overview.pendingDeposits}</p>
                <p className="stat-label">{lang === 'th' ? 'รอเติมเงิน' : 'Pending'}</p>
              </div>
              <div className="stat-card">
                <p className="text-2xl md:text-3xl mb-1">🔴</p>
                <p className="stat-value" style={{ color: overview.outOfStock > 0 ? 'var(--danger)' : undefined }}>{overview.outOfStock}</p>
                <p className="stat-label">{lang === 'th' ? 'สินค้าหมด' : 'Out of Stock'}</p>
              </div>
            </>
          )}
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-8">
          {adminMenu.map(item => (
            <Link key={item.href} href={item.href} className="card p-5 md:p-6 hover:border-[var(--primary)] transition-all relative group">
              {item.badge && (
                <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--danger)] text-white text-xs font-bold flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              )}
              <div className="flex items-start gap-3">
                <div className="text-2xl">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-sm md:text-base group-hover:text-[var(--primary)] transition-colors">{item.label}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Low stock warning */}
        {stats?.lowStock?.length > 0 && (
          <div className="card p-5 md:p-6 mb-6" style={{ borderColor: 'oklch(0.82 0.17 80 / 0.3)' }}>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              ⚠️ {lang === 'th' ? 'สินค้าใกล้หมด' : 'Low Stock Alert'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {stats.lowStock.map((p: any) => (
                <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'oklch(0.82 0.17 80 / 0.08)' }}>
                  <span>{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name_th}</p>
                    <p className="text-xs" style={{ color: 'var(--warning)' }}>คงเหลือ: {p.stock} ชิ้น</p>
                  </div>
                  <Link href="/admin/inventory" className="text-xs px-2 py-1 rounded-lg" style={{ color: 'var(--primary)' }}>
                    เติม →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top products */}
        {stats?.topProducts?.length > 0 && (
          <div className="card p-5 md:p-6">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              🏆 {lang === 'th' ? 'สินค้าขายดี' : 'Top Selling Products'}
            </h3>
            <div className="space-y-2">
              {stats.topProducts.slice(0, 5).map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                  <span className="text-lg font-bold" style={{ color: i < 3 ? 'var(--primary)' : 'var(--text-muted)', width: '24px' }}>#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p[`name_${lang}`] || p.name_th}</p>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.order_count} orders</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>฿{Number(p.total_revenue).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
