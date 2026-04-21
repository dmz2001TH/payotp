'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { useToast } from '@/components/Toast';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WalletPage() {
  const { lang, user } = useApp();
  const toast = useToast();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('promptpay');
  const [depositResult, setDepositResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/wallet/confirm');
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setDeposits(data.deposits);
      }
    } catch {}
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < 50) {
      toast.showToast(lang === 'th' ? 'เติมขั้นต่ำ 50 บาท' : lang === 'en' ? 'Minimum deposit is ฿50' : '最低充值 50 泰铢', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDepositResult(data.deposit);
      setAmount('');
      toast.showToast(t('toast.depositSuccess', lang), 'success');
    } catch (err: any) {
      toast.showToast(err.message || t('toast.error', lang), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (depositId: string) => {
    try {
      const res = await fetch('/api/wallet/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId }),
      });
      if (res.ok) {
        loadData();
        setDepositResult(null);
        toast.showToast(t('toast.depositConfirm', lang), 'success');
      }
    } catch {
      toast.showToast(t('toast.error', lang), 'error');
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { class: string; icon: string; text: string }> = {
      pending: { class: 'badge-warning', icon: '⏳', text: lang === 'th' ? 'รอชำระเงิน' : lang === 'en' ? 'Pending' : '待付款' },
      awaiting_confirm: { class: 'badge-warning', icon: '🔍', text: lang === 'th' ? 'รอยืนยัน' : lang === 'en' ? 'Awaiting' : '待确认' },
      completed: { class: 'badge-success', icon: '✅', text: lang === 'th' ? 'สำเร็จ' : lang === 'en' ? 'Completed' : '已完成' },
      rejected: { class: 'badge-danger', icon: '❌', text: lang === 'th' ? 'ปฏิเสธ' : lang === 'en' ? 'Rejected' : '已拒绝' },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`badge ${s.class}`}>
        {s.icon} {s.text}
      </span>
    );
  };

  // Stats
  const totalDeposited = deposits.filter((d) => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0);
  const pendingCount = deposits.filter((d) => d.status === 'pending' || d.status === 'awaiting_confirm').length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container-app py-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/orders" className="btn-ghost text-sm">← {t('common.back', lang)}</Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2">
            💳 {t('nav.wallet', lang)}
          </h1>
        </div>
      </div>

      <div className="container-app py-8">
        {/* QR Result Modal */}
        {depositResult && (
          <div className="modal-overlay">
            <div className="modal-content p-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: 'var(--primary-50)' }}>
                💳
              </div>
              <h2 className="text-xl font-extrabold mb-1">{t('wallet.waiting', lang)}</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                {depositResult.message}
              </p>

              {depositResult.qr_image && (
                <div className="mb-5 p-4 rounded-xl inline-block" style={{ background: 'white' }}>
                  <img src={depositResult.qr_image} alt="QR Code" className="w-48 h-48 mx-auto" />
                </div>
              )}

              <div className="p-4 rounded-xl mb-6" style={{ background: 'var(--bg-input)' }}>
                <p className="text-3xl font-extrabold gradient-text">฿{depositResult.amount}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {lang === 'th' ? 'รหัสอ้างอิง' : 'Ref'}: {depositResult.reference_code}
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setDepositResult(null)} className="btn-secondary flex-1 py-3">
                  {t('common.cancel', lang)}
                </button>
                <button onClick={() => handleConfirm(depositResult.id)} className="btn-primary flex-1 py-3">
                  {t('wallet.confirmDeposit', lang)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{t('wallet.balance', lang)}</p>
            <p className="stat-value">฿{balance.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{t('dashboard.totalDeposits', lang)}</p>
            <p className="stat-value">฿{totalDeposited.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
              {lang === 'th' ? 'รอยืนยัน' : lang === 'en' ? 'Pending' : '待确认'}
            </p>
            <p className="stat-value" style={{ color: 'var(--warning)' }}>{pendingCount}</p>
          </div>
        </div>

        {/* Deposit Form */}
        <div className="card p-6 md:p-8 mb-8">
          <h2 className="text-lg font-extrabold mb-5">{t('dashboard.quickDeposit', lang)}</h2>

          {/* Method toggle */}
          <div className="flex gap-3 mb-5">
            {[
              { id: 'promptpay', icon: '💳', label: t('wallet.promptpay', lang) },
              { id: 'truewallet', icon: '📱', label: t('wallet.truewallet', lang) },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex-1 p-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  method === m.id
                    ? 'gradient-bg text-white shadow-md'
                    : 'btn-secondary'
                }`}
              >
                <span className="text-lg">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>

          {/* Amount input */}
          <div className="mb-4">
            <label className="input-label">{t('wallet.depositAmount', lang)}</label>
            <div className="flex gap-3">
              <input
                type="number"
                className="input-field flex-1 text-lg font-bold"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={50}
                placeholder="50"
              />
              <button onClick={handleDeposit} disabled={loading || !amount} className="btn-primary px-8">
                {loading ? t('common.loading', lang) : t('wallet.deposit', lang)}
              </button>
            </div>
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2 flex-wrap">
            {[50, 100, 200, 500, 1000].map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a.toString())}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  amount === a.toString()
                    ? 'gradient-bg text-white'
                    : 'btn-secondary'
                }`}
              >
                ฿{a}
              </button>
            ))}
          </div>

          <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            💡 {t('wallet.minDeposit', lang)}: ฿50
          </p>
        </div>

        {/* Deposit History */}
        <div className="card p-6 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-extrabold">{t('dashboard.depositHistory', lang)}</h2>
            <span className="badge badge-primary">{deposits.length}</span>
          </div>

          {deposits.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <p style={{ color: 'var(--text-muted)' }}>{t('common.noData', lang)}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deposits.map((d: any) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-md"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ background: d.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }}>
                      {d.status === 'completed' ? '✅' : d.status === 'rejected' ? '❌' : '⏳'}
                    </div>
                    <div>
                      <p className="font-bold">฿{d.amount.toFixed(2)}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {d.method.toUpperCase()} • {new Date(d.created_at).toLocaleString(lang === 'th' ? 'th-TH' : lang === 'zh' ? 'zh-CN' : 'en-US')}
                      </p>
                    </div>
                  </div>
                  {statusBadge(d.status)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <Link href="/dashboard/orders" className="card p-5 text-center hover:border-[var(--primary)] transition-all">
            <span className="text-2xl mb-2 block">📦</span>
            <span className="text-sm font-bold">{t('order.history', lang)}</span>
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
