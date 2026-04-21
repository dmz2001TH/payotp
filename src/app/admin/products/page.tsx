'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { useToast } from '@/components/Toast';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminProductsPage() {
  const { lang, user } = useApp();
  const toast = useToast();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    category_id: '', name_th: '', name_en: '', name_zh: '',
    description_th: '', description_en: '', description_zh: '',
    price: '', original_price: '', stock: '', type: 'account', sort_order: '0',
    image_url: '',
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

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ category_id: '', name_th: '', name_en: '', name_zh: '', description_th: '', description_en: '', description_zh: '', price: '', original_price: '', stock: '', type: 'account', sort_order: '0', image_url: '' });
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      stock: parseInt(form.stock) || 0,
      sort_order: parseInt(form.sort_order) || 0,
    };

    if (editingId) {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
      if (res.ok) {
        toast.showToast(t('toast.saveSuccess', lang), 'success');
        resetForm();
        loadData();
      } else {
        toast.showToast(t('toast.error', lang), 'error');
      }
    } else {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.showToast(t('toast.saveSuccess', lang), 'success');
        resetForm();
        loadData();
      } else {
        toast.showToast(t('toast.error', lang), 'error');
      }
    }
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setShowForm(true);
    setForm({
      category_id: p.category_id,
      name_th: p.name_th || '',
      name_en: p.name_en || '',
      name_zh: p.name_zh || '',
      description_th: p.description_th || '',
      description_en: p.description_en || '',
      description_zh: p.description_zh || '',
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : '',
      stock: String(p.stock),
      type: p.type || 'account',
      sort_order: String(p.sort_order || 0),
      image_url: p.image_url || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'th' ? 'ลบสินค้านี้?' : 'Delete this product?')) return;
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    toast.showToast(t('toast.deleteSuccess', lang), 'success');
    loadData();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container-app py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold">{t('admin.products', lang)}</h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{products.length} {lang === 'th' ? 'รายการ' : 'items'}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin" className="btn-secondary text-sm">← {t('common.back', lang)}</Link>
              <button onClick={() => { if (showForm) resetForm(); else { setShowForm(true); setEditingId(null); } }} className="btn-primary text-sm">
                {showForm ? `✕ ${t('common.cancel', lang)}` : `+ ${t('admin.add', lang)}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-6 md:py-8">
        {/* Add/Edit form */}
        {showForm && (
          <div className="card p-5 md:p-6 mb-8">
            <h2 className="font-bold mb-4">
              {editingId ? t('admin.edit', lang) : t('admin.add', lang)} {t('nav.products', lang)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="input-label">Category</label>
                <select className="input-field" value={form.category_id} onChange={(e) => setForm({...form, category_id: e.target.value})}>
                  <option value="">Select...</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.icon} {c.name_th}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Type</label>
                <select className="input-field" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                  <option value="account">Account</option>
                  <option value="otp">OTP</option>
                  <option value="game">Game Top-up</option>
                  <option value="mobile">Mobile Top-up</option>
                  <option value="social">Social Boost</option>
                </select>
              </div>
              <div>
                <label className="input-label">Image URL</label>
                <input className="input-field" value={form.image_url} onChange={(e) => setForm({...form, image_url: e.target.value})} placeholder="https://..." />
              </div>
              <div>
                <label className="input-label">Name (TH)</label>
                <input className="input-field" value={form.name_th} onChange={(e) => setForm({...form, name_th: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Name (EN)</label>
                <input className="input-field" value={form.name_en} onChange={(e) => setForm({...form, name_en: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Name (ZH)</label>
                <input className="input-field" value={form.name_zh} onChange={(e) => setForm({...form, name_zh: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Price (฿)</label>
                <input type="number" className="input-field" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Original Price (฿)</label>
                <input type="number" className="input-field" value={form.original_price} onChange={(e) => setForm({...form, original_price: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Stock</label>
                <input type="number" className="input-field" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Sort Order</label>
                <input type="number" className="input-field" value={form.sort_order} onChange={(e) => setForm({...form, sort_order: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Description (TH)</label>
                <textarea className="input-field" rows={2} value={form.description_th} onChange={(e) => setForm({...form, description_th: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Description (EN)</label>
                <textarea className="input-field" rows={2} value={form.description_en} onChange={(e) => setForm({...form, description_en: e.target.value})} />
              </div>
            </div>

            {/* Image preview */}
            {form.image_url && (
              <div className="mt-4">
                <label className="input-label">Preview</label>
                <div className="w-24 h-24 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={resetForm} className="btn-secondary">{t('common.cancel', lang)}</button>
              <button onClick={handleSave} className="btn-primary">
                {editingId ? t('common.save', lang) : t('admin.add', lang)}
              </button>
            </div>
          </div>
        )}

        {/* Products list */}
        <div className="space-y-3">
          {products.map((p: any) => (
            <div key={p.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Image thumbnail */}
              {p.image_url ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--border)' }}>
                  <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-xl" style={{ background: 'var(--bg-input)' }}>
                  📦
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="badge badge-primary">{p.cat_name_th}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>#{p.sort_order}</span>
                </div>
                <h3 className="font-bold text-sm truncate">{p.name_th}</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  ฿{p.price} • Stock: {p.stock} (available: {p.available_stock}) • {p.type}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(p)} className="btn-secondary text-sm">✏️ {t('admin.edit', lang)}</button>
                <button onClick={() => handleDelete(p.id)} className="btn-secondary text-sm text-[var(--danger)]">🗑️ {t('admin.delete', lang)}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
