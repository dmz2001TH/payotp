'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { useToast } from '@/components/Toast';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminInventoryPage() {
  const { lang, user, authLoading } = useApp();
  const toast = useToast();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [accountData, setAccountData] = useState('');
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') { router.push('/'); return; }
    fetch('/api/admin/products').then(r => r.json()).then(data => setProducts(data.products || []));
  }, [user, authLoading]);

  const loadInventory = async (productId: string) => {
    if (!productId) { setInventory([]); return; }
    const res = await fetch(`/api/admin/inventory?productId=${productId}`);
    if (res.ok) {
      const data = await res.json();
      setInventory(data.items || []);
    }
  };

  const handleAdd = async () => {
    if (!selectedProduct || !accountData.trim()) {
      toast.showToast(lang === 'th' ? 'กรุณาเลือกสินค้าและใส่ข้อมูล' : 'Please select a product and enter data', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct, accountData }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.showToast(`${t('toast.saveSuccess', lang)} — ${data.added} ${lang === 'th' ? 'รายการ' : 'items'}`, 'success');
        setAccountData('');
        loadInventory(selectedProduct);
      } else {
        toast.showToast(data.error || t('toast.error', lang), 'error');
      }
    } catch {
      toast.showToast(t('toast.error', lang), 'error');
    } finally {
      setLoading(false);
    }
  };

  const itemCount = accountData.split('\n').filter(l => l.trim()).length;

  return (
    <div className="animate-fade-in">
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container-app py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl md:text-2xl font-extrabold">📋 {t('admin.inventory', lang)}</h1>
            <Link href="/admin" className="btn-secondary text-sm self-start">← {t('common.back', lang)}</Link>
          </div>
        </div>
      </div>

      <div className="container-app py-6 md:py-8">
        {/* Add inventory */}
        <div className="card p-5 md:p-6 mb-8">
          <h2 className="font-bold mb-5">
            {lang === 'th' ? 'เพิ่มสต็อกสินค้า' : 'Add Stock'}
          </h2>

          <div className="mb-5">
            <label className="input-label">{lang === 'th' ? 'สินค้า' : 'Product'}</label>
            <select
              className="input-field"
              value={selectedProduct}
              onChange={(e) => { setSelectedProduct(e.target.value); loadInventory(e.target.value); }}
            >
              <option value="">{lang === 'th' ? 'เลือกสินค้า...' : 'Select product...'}</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name_th} (available: {p.available_stock})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label className="input-label">
              {lang === 'th' ? 'ข้อมูลสินค้า (1 รายการต่อบรรทัด)' : 'Account Data (1 item per line)'}
            </label>
            <textarea
              className="input-field font-mono text-sm"
              rows={6}
              value={accountData}
              onChange={(e) => setAccountData(e.target.value)}
              placeholder={`email:password\nemail:password:token\nuser:pass`}
            />
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              💡 {lang === 'th' ? 'ใส่ 1 บรรทัด = 1 ชิ้น stock' : '1 line = 1 stock item'}
            </p>
          </div>

          <button onClick={handleAdd} disabled={loading || !selectedProduct || !accountData.trim()} className="btn-primary">
            ➕ {t('admin.add', lang)} {itemCount > 0 ? `(${itemCount})` : ''} {lang === 'th' ? 'รายการ' : 'items'}
          </button>
        </div>

        {/* Current inventory */}
        {selectedProduct && (
          <div className="card p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold">
                {lang === 'th' ? 'สต็อกปัจจุบัน' : 'Current Stock'}
              </h2>
              <span className="badge badge-primary">{inventory.length}</span>
            </div>
            {inventory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📭</div>
                <p style={{ color: 'var(--text-muted)' }}>
                  {lang === 'th' ? 'ไม่มีสินค้าในสต็อก' : 'No stock available'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {inventory.map((item: any, i: number) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  >
                    <span className="font-mono text-xs truncate mr-3">
                      <span className="text-[var(--text-muted)]">{i + 1}.</span>{' '}
                      {item.account_data.substring(0, 40)}{item.account_data.length > 40 ? '...' : ''}
                    </span>
                    <span className={`badge flex-shrink-0 ${item.status === 'available' ? 'badge-success' : 'badge-danger'}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
