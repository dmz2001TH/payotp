'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WalletPage() {
  const { lang, user } = useApp();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('promptpay');
  const [depositResult, setDepositResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    const res = await fetch('/api/wallet/confirm');
    if (res.ok) {
      const data = await res.json();
      setBalance(data.balance);
      setDeposits(data.deposits);
    }
  };

  const handleDeposit = async () => {
    setError('');
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (depositId: string) => {
    const res = await fetch('/api/wallet/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId }),
    });
    if (res.ok) {
      loadData();
      setDepositResult(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, {class: string, text: string}> = {
      pending: { class: 'badge-yellow', text: lang === 'th' ? 'รอชำระเงิน' : lang === 'en' ? 'Pending' : '待付款' },
      awaiting_confirm: { class: 'badge-yellow', text: lang === 'th' ? 'รอยืนยัน' : lang === 'en' ? 'Awaiting' : '待确认' },
      completed: { class: 'badge-green', text: lang === 'th' ? 'สำเร็จ' : lang === 'en' ? 'Completed' : '已完成' },
      rejected: { class: 'badge-red', text: lang === 'th' ? 'ปฏิเสธ' : lang === 'en' ? 'Rejected' : '已拒绝' },
    };
    const s = map[status] || map.pending;
    return <span className={`badge ${s.class}`}>{s.text}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 fade-in">
      {/* QR Result Modal */}
      {depositResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4">{t('wallet.waiting', lang)}</h2>
            <div className="mb-4">
              <img src={depositResult.qr_image} alt="QR Code" className="mx-auto rounded-lg" />
            </div>
            <div className="p-4 rounded-lg mb-4" style={{backgroundColor: 'var(--bg-primary)'}}>
              <p className="text-2xl font-bold text-[var(--accent)]">฿{depositResult.amount}</p>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                {lang === 'th' ? 'รหัสอ้างอิง' : 'Ref'}: {depositResult.reference_code}
              </p>
            </div>
            <p className="text-sm mb-4" style={{color: 'var(--text-secondary)'}}>
              {depositResult.message}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDepositResult(null)} className="btn-secondary flex-1">{t('common.cancel', lang)}</button>
              <button onClick={() => handleConfirm(depositResult.id)} className="btn-primary flex-1">
                {t('wallet.confirmDeposit', lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-8">{t('nav.wallet', lang)}</h1>

      {/* Balance Card */}
      <div className="card p-6 mb-8 gradient-bg text-white">
        <p className="text-sm opacity-80 mb-1">{t('wallet.balance', lang)}</p>
        <p className="text-4xl font-bold">฿{balance.toFixed(2)}</p>
      </div>

      {/* Deposit Form */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">{t('wallet.deposit', lang)}</h2>
        {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{backgroundColor: 'var(--danger)', color: 'white'}}>{error}</div>}

        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setMethod('promptpay')}
            className={`flex-1 p-3 rounded-lg text-sm font-medium transition-all ${method === 'promptpay' ? 'gradient-bg text-white' : 'btn-secondary'}`}
          >
            💳 {t('wallet.promptpay', lang)}
          </button>
          <button
            onClick={() => setMethod('truewallet')}
            className={`flex-1 p-3 rounded-lg text-sm font-medium transition-all ${method === 'truewallet' ? 'gradient-bg text-white' : 'btn-secondary'}`}
          >
            📱 {t('wallet.truewallet', lang)}
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t('wallet.depositAmount', lang)}</label>
            <input
              type="number"
              className="input-field"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={50}
              placeholder="50"
            />
          </div>
          <div className="flex items-end">
            <button onClick={handleDeposit} disabled={loading || !amount} className="btn-primary h-[42px]">
              {loading ? t('common.loading', lang) : t('wallet.deposit', lang)}
            </button>
          </div>
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2 mt-3">
          {[50, 100, 200, 500, 1000].map((a) => (
            <button
              key={a}
              onClick={() => setAmount(a.toString())}
              className="btn-secondary text-xs px-3 py-1"
            >
              ฿{a}
            </button>
          ))}
        </div>
      </div>

      {/* Deposit History */}
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4">
          {lang === 'th' ? 'ประวัติการเติมเงิน' : lang === 'en' ? 'Deposit History' : '充值历史'}
        </h2>
        {deposits.length === 0 ? (
          <p className="text-center py-8" style={{color: 'var(--text-muted)'}}>
            {lang === 'th' ? 'ยังไม่มีรายการ' : lang === 'en' ? 'No deposits yet' : '暂无记录'}
          </p>
        ) : (
          <div className="space-y-3">
            {deposits.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg" style={{backgroundColor: 'var(--bg-primary)'}}>
                <div>
                  <p className="font-medium">฿{d.amount.toFixed(2)}</p>
                  <p className="text-xs" style={{color: 'var(--text-muted)'}}>
                    {d.method.toUpperCase()} • {new Date(d.created_at).toLocaleString()}
                  </p>
                </div>
                {statusBadge(d.status)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dashboard nav */}
      <div className="flex gap-3 mt-8">
        <Link href="/dashboard/orders" className="btn-secondary flex-1 text-center py-3">📦 {t('order.history', lang)}</Link>
        <Link href="/dashboard/affiliate" className="btn-secondary flex-1 text-center py-3">👥 {t('affiliate.title', lang)}</Link>
      </div>
    </div>
  );
}
