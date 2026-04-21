'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminInventoryPage() {
  const { lang, user } = useApp();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [accountData, setAccountData] = useState('');
  const [inventory, setInventory] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { router.push('/'); return; }
    fetch('/api/admin/products').then(r => r.json()).then(data => setProducts(data.products || []));
  }, [user]);

  const loadInventory = async (productId: string) => {
    if (!productId) { setInventory([]); return; }
    const res = await fetch(`/api/admin/inventory?productId=${productId}`);
    if (res.ok) {
      const data = await res.json();
      setInventory(data.items || []);
    }
  };

  const handleAdd = async () => {
    setError('');
    setMessage('');
    if (!selectedProduct || !accountData.trim()) {
      setError('กรุณาเลือกสินค้าและใส่ข้อมูล');
      return;
    }
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: selectedProduct, accountData }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`เพิ่มสำเร็จ ${data.added} รายการ`);
      setAccountData('');
      loadInventory(selectedProduct);
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{t('admin.inventory', lang)}</h1>
        <Link href="/admin" className="btn-secondary">← {t('common.back', lang)}</Link>
      </div>

      {/* Add inventory */}
      <div className="card p-6 mb-8">
        <h2 className="font-bold mb-4">
          {lang === 'th' ? 'เพิ่มสต็อกสินค้า' : 'Add Stock'}
        </h2>
        {message && <div className="mb-4 p-3 rounded-lg text-sm" style={{backgroundColor: '#dcfce7', color: '#166534'}}>{message}</div>}
        {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{backgroundColor: 'var(--danger)', color: 'white'}}>{error}</div>}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">สินค้า / Product</label>
          <select
            className="input-field"
            value={selectedProduct}
            onChange={(e) => { setSelectedProduct(e.target.value); loadInventory(e.target.value); }}
          >
            <option value="">เลือกสินค้า...</option>
            {products.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name_th} (available: {p.available_stock})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {lang === 'th' ? 'ข้อมูลสินค้า (1 รายการต่อบรรทัด)' : 'Account Data (1 item per line)'}
          </label>
          <textarea
            className="input-field font-mono text-sm"
            rows={8}
            value={accountData}
            onChange={(e) => setAccountData(e.target.value)}
            placeholder={`email:password\nemail:password:token\nuser:pass`}
          />
          <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
            {lang === 'th' ? 'ใส่ 1 บรรทัด = 1 ชิ้น stock' : '1 line = 1 stock item'}
          </p>
        </div>

        <button onClick={handleAdd} className="btn-primary">
          ➕ {t('admin.add', lang)} {accountData.split('\n').filter(l => l.trim()).length} {lang === 'th' ? 'รายการ' : 'items'}
        </button>
      </div>

      {/* Current inventory */}
      {selectedProduct && (
        <div className="card p-6">
          <h2 className="font-bold mb-4">
            {lang === 'th' ? 'สต็อกปัจจุบัน' : 'Current Stock'} ({inventory.length})
          </h2>
          {inventory.length === 0 ? (
            <p className="text-center py-8" style={{color: 'var(--text-muted)'}}>
              {lang === 'th' ? 'ไม่มีสินค้าในสต็อก' : 'No stock available'}
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {inventory.map((item: any, i: number) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg" style={{backgroundColor: 'var(--bg-primary)'}}>
                  <span className="font-mono text-sm">{i + 1}. {item.account_data.substring(0, 50)}{item.account_data.length > 50 ? '...' : ''}</span>
                  <span className={`badge ${item.status === 'available' ? 'badge-green' : 'badge-red'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
