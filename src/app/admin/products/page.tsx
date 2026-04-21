'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminProductsPage() {
  const { lang, user } = useApp();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category_id: '', name_th: '', name_en: '', name_zh: '',
    description_th: '', description_en: '', description_zh: '',
    price: '', original_price: '', stock: '', type: 'account', sort_order: '0',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') { router.push('/'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    const [prodRes, catRes] = await Promise.all([
      fetch('/api/admin/products'),
      fetch('/api/products'),
    ]);
    const prodData = await prodRes.json().catch(() => ({ products: [] }));
    const catData = await catRes.json().catch(() => ({ categories: [] }));
    setProducts(prodData.products || []);
    setCategories(catData.categories || []);
  };

  const handleAdd = async () => {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parseInt(form.stock) || 0,
        sort_order: parseInt(form.sort_order) || 0,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ category_id: '', name_th: '', name_en: '', name_zh: '', description_th: '', description_en: '', description_zh: '', price: '', original_price: '', stock: '', type: 'account', sort_order: '0' });
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ลบสินค้านี้?')) return;
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{t('admin.products', lang)}</h1>
        <div className="flex gap-3">
          <Link href="/admin" className="btn-secondary">← {t('common.back', lang)}</Link>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ {t('admin.add', lang)}</button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card p-6 mb-8">
          <h2 className="font-bold mb-4">{t('admin.add', lang)} {t('nav.products', lang)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="input-field" value={form.category_id} onChange={(e) => setForm({...form, category_id: e.target.value})}>
                <option value="">Select...</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.icon} {c.name_th}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="input-field" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                <option value="account">Account</option>
                <option value="otp">OTP</option>
                <option value="game">Game Top-up</option>
                <option value="mobile">Mobile Top-up</option>
                <option value="social">Social Boost</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Name (TH)</label><input className="input-field" value={form.name_th} onChange={(e) => setForm({...form, name_th: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Name (EN)</label><input className="input-field" value={form.name_en} onChange={(e) => setForm({...form, name_en: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Name (ZH)</label><input className="input-field" value={form.name_zh} onChange={(e) => setForm({...form, name_zh: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Price (฿)</label><input type="number" className="input-field" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Original Price (฿)</label><input type="number" className="input-field" value={form.original_price} onChange={(e) => setForm({...form, original_price: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Stock</label><input type="number" className="input-field" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Sort Order</label><input type="number" className="input-field" value={form.sort_order} onChange={(e) => setForm({...form, sort_order: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Description (TH)</label><textarea className="input-field" rows={2} value={form.description_th} onChange={(e) => setForm({...form, description_th: e.target.value})} /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-secondary">{t('common.cancel', lang)}</button>
            <button onClick={handleAdd} className="btn-primary">{t('common.save', lang)}</button>
          </div>
        </div>
      )}

      {/* Products list */}
      <div className="space-y-3">
        {products.map((p: any) => (
          <div key={p.id} className="card p-4 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-blue">{p.cat_name_th}</span>
                <span className="text-xs" style={{color: 'var(--text-muted)'}}>#{p.sort_order}</span>
              </div>
              <h3 className="font-medium">{p.name_th}</h3>
              <p className="text-xs" style={{color: 'var(--text-muted)'}}>
                ฿{p.price} • Stock: {p.stock} (available: {p.available_stock}) • Type: {p.type}
              </p>
            </div>
            <button onClick={() => handleDelete(p.id)} className="btn-secondary text-sm text-[var(--danger)]">
              {t('admin.delete', lang)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
