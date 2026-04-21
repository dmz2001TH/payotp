'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { useToast } from '@/components/Toast';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminUsersPage() {
  const { lang, user, authLoading } = useApp();
  const toast = useToast();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalAction, setModalAction] = useState<string>('');
  const [modalAmount, setModalAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') { router.push('/'); return; }
    loadUsers(1);
  }, [user, authLoading]);

  const loadUsers = async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch {}
    setLoading(false);
  };

  const handleAction = async () => {
    if (!selectedUser || !modalAction) return;
    if ((modalAction === 'add_balance' || modalAction === 'subtract_balance' || modalAction === 'set_balance') && !modalAmount) {
      toast.showToast('กรุณากรอกจำนวนเงิน', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const body: any = { userId: selectedUser.id, action: modalAction };
      if (modalAmount) body.amount = parseFloat(modalAmount);
      if (modalAction === 'set_role') body.role = selectedUser.role === 'admin' ? 'user' : 'admin';

      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast.showToast(data.message, 'success');
        setSelectedUser(null);
        setModalAction('');
        setModalAmount('');
        loadUsers(pagination.page);
      } else {
        toast.showToast(data.error, 'error');
      }
    } catch { toast.showToast('เกิดข้อผิดพลาด', 'error'); }
    setActionLoading(false);
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });

  if (authLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" /></div>;
  }
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="animate-fade-in">
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container-app py-6 md:py-8">
          <div className="flex items-center gap-2 text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            <Link href="/admin" className="hover:text-[var(--primary)]">Admin</Link>
            <span>/</span>
            <span style={{ color: 'var(--primary)' }}>{lang === 'th' ? 'จัดการผู้ใช้' : lang === 'en' ? 'Users' : '用户管理'}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold">👥 {lang === 'th' ? 'จัดการผู้ใช้' : lang === 'en' ? 'User Management' : '用户管理'}</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t('admin.usersDesc', lang) || 'ดูและจัดการบัญชีผู้ใช้ทั้งหมด'}</p>
        </div>
      </div>

      <div className="container-app py-6">
        {/* Search */}
        <div className="flex gap-3 mb-6">
          <input
            className="input-field flex-1"
            placeholder={lang === 'th' ? '🔍 ค้นหาชื่อผู้ใช้หรืออีเมล...' : '🔍 Search username or email...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadUsers(1)}
          />
          <button onClick={() => loadUsers(1)} className="btn-primary px-6">{lang === 'th' ? 'ค้นหา' : 'Search'}</button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="stat-card">
            <p className="stat-value">{pagination.total}</p>
            <p className="stat-label">{lang === 'th' ? 'ผู้ใช้ทั้งหมด' : 'Total Users'}</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{users.filter(u => u.role === 'admin').length}</p>
            <p className="stat-label">{lang === 'th' ? 'แอดมิน' : 'Admins'}</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">฿{users.reduce((s, u) => s + (u.balance || 0), 0).toLocaleString()}</p>
            <p className="stat-label">{lang === 'th' ? 'ยอดรวม' : 'Total Balance'}</p>
          </div>
        </div>

        {/* Users table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'ผู้ใช้' : 'User'}</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Email</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'ยอดเงิน' : 'Balance'}</th>
                  <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'ยศ' : 'Role'}</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'ใช้ไป' : 'Spent'}</th>
                  <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'สมัคร' : 'Joined'}</th>
                  <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'จัดการ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-6 w-full" /></td></tr>
                  ))
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'ไม่พบผู้ใช้' : 'No users found'}</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--gradient-primary)', color: 'var(--primary-foreground)' }}>
                          {u.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{u.username}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.referral_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td className="px-4 py-3 text-right font-bold" style={{ color: 'var(--primary)' }}>฿{u.balance?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-right" style={{ color: 'var(--text-secondary)' }}>฿{u.total_spent?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>{fmtDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setSelectedUser(u); setModalAction('add_balance'); setModalAmount(''); }}
                          className="px-2 py-1 text-xs rounded-lg transition-all hover:bg-[oklch(0.74_0.18_152_/_0.15)]" style={{ color: 'var(--success)' }} title="เติมเงิน">💰</button>
                        <button onClick={() => { setSelectedUser(u); setModalAction('subtract_balance'); setModalAmount(''); }}
                          className="px-2 py-1 text-xs rounded-lg transition-all hover:bg-[oklch(0.65_0.22_22_/_0.15)]" style={{ color: 'var(--danger)' }} title="หักเงิน">➖</button>
                        <button onClick={() => { setSelectedUser(u); setModalAction('set_balance'); setModalAmount(String(u.balance)); }}
                          className="px-2 py-1 text-xs rounded-lg transition-all hover:bg-[oklch(0.82_0.17_80_/_0.15)]" style={{ color: 'var(--warning)' }} title="ตั้งยอด">✏️</button>
                        <button onClick={() => { setSelectedUser(u); setModalAction('set_role'); }}
                          className="px-2 py-1 text-xs rounded-lg transition-all hover:bg-[oklch(0.78_0.16_235_/_0.15)]" title="เปลี่ยนยศ">🏷️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => loadUsers(p)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${p === pagination.page ? 'gradient-bg text-white' : 'hover:bg-[oklch(1_0_0_/_0.06)]'}`}
                style={p !== pagination.page ? { color: 'var(--text-secondary)' } : undefined}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedUser && modalAction && (
        <div className="modal-overlay" onClick={() => { setSelectedUser(null); setModalAction(''); }}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">
              {modalAction === 'add_balance' && `💰 เติมเงินให้ ${selectedUser.username}`}
              {modalAction === 'subtract_balance' && `➖ หักเงิน ${selectedUser.username}`}
              {modalAction === 'set_balance' && `✏️ ตั้งยอด ${selectedUser.username}`}
              {modalAction === 'set_role' && `🏷️ เปลี่ยนยศ ${selectedUser.username}`}
            </h3>

            <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'ยอดปัจจุบัน' : 'Current Balance'}</p>
              <p className="text-xl font-extrabold" style={{ color: 'var(--primary)' }}>฿{selectedUser.balance?.toFixed(2)}</p>
            </div>

            {(modalAction === 'add_balance' || modalAction === 'subtract_balance' || modalAction === 'set_balance') && (
              <div className="mb-4">
                <label className="input-label">{lang === 'th' ? 'จำนวนเงิน (บาท)' : 'Amount (THB)'}</label>
                <input type="number" className="input-field" value={modalAmount} onChange={e => setModalAmount(e.target.value)}
                  placeholder="0.00" min="0" step="0.01" autoFocus />
              </div>
            )}

            {modalAction === 'set_role' && (
              <div className="mb-4">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {lang === 'th' ? 'ยศปัจจุบัน:' : 'Current role:'} <span className="font-bold">{selectedUser.role}</span>
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {lang === 'th'
                    ? `เปลี่ยนเป็น: ${selectedUser.role === 'admin' ? 'user' : 'admin'}`
                    : `Change to: ${selectedUser.role === 'admin' ? 'user' : 'admin'}`}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setSelectedUser(null); setModalAction(''); }} className="btn-secondary flex-1">
                {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button onClick={handleAction} disabled={actionLoading}
                className={`${modalAction === 'subtract_balance' ? 'btn-danger' : 'btn-primary'} flex-1`}>
                {actionLoading ? '...' : lang === 'th' ? 'ยืนยัน' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
