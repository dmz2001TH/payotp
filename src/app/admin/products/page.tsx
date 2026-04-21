'use client';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/components/AppContext';
import { useToast } from '@/components/Toast';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminProductsPage() {
  const { lang, user, authLoading } = useApp();
  const toast = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    category_id: '', name_th: '', name_en: '', name_zh: '',
    description_th: '', description_en: '', description_zh: '',
    price: '', original_price: '', stock: '0', type: 'account', sort_order: '0',
    image_url: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') { router.push('/'); return; }
    loadData();
  }, [user, authLoading]);

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
    setForm({ category_id: '', name_th: '', name_en: '', name_zh: '', description_th: '', description_en: '', description_zh: '', price: '', original_price: '', stock: '0', type: 'account', sort_order: '0', image_url: '' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({ ...prev, image_url: data.url }));
        toast.showToast('อัพโหลดสำเร็จ!', 'success');
      } else {
        toast.showToast(data.error, 'error');
      }
    } catch { toast.showToast('อัพโหลดล้มเหลว', 'error'); }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.category_id || !form.name_th || !form.price) {
      toast.showToast('กรุณากรอกข้อมูลให้ครบ (หมวดหมู่, ชื่อ, ราคา)', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parseInt(form.stock) || 0,
        sort_order: parseInt(form.sort_order) || 0,
      };

      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...payload } : payload;

      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast.showToast(editingId ? 'แก้ไขสำเร็จ!' : 'เพิ่มสินค้าสำเร็จ!', 'success');
        resetForm();
        loadData();
      } else {
        toast.showToast(data.error || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch { toast.showToast('เกิดข้อผิดพลาด', 'error'); }
    setSaving(false);
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
      stock: String(p.stock ?? 0),
      type: p.type || 'account',
      sort_order: String(p.sort_order || 0),
      image_url: p.image_url || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      toast.showToast('ลบสินค้าสำเร็จ!', 'success');
      setDeleteConfirm(null);
      loadData();
    } catch { toast.showToast('เกิดข้อผิดพลาด', 'error'); }
    setSaving(false);
  };

  const toggleActive = async (p: any) => {
    try {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, active: p.active ? 0 : 1 }),
      });
      toast.showToast(p.active ? 'ซ่อนสินค้าแล้ว' : 'แสดงสินค้าแล้ว', 'success');
      loadData();
    } catch {}
  };

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
            <span style={{ color: 'var(--primary)' }}>{t('admin.products', lang)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold">📦 {t('admin.products', lang)}</h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{products.length} {lang === 'th' ? 'รายการ' : 'items'}</p>
            </div>
            <button onClick={() => { if (showForm) resetForm(); else { setShowForm(true); setEditingId(null); } }} className="btn-primary text-sm px-5 py-2.5">
              {showForm ? `✕ ${t('common.cancel', lang)}` : `+ ${lang === 'th' ? 'เพิ่มสินค้า' : 'Add Product'}`}
            </button>
          </div>
        </div>
      </div>

      <div className="container-app py-6 md:py-8">
        {/* Add/Edit form */}
        {showForm && (
          <div className="card p-5 md:p-6 mb-8">
            <h2 className="font-bold text-lg mb-5">
              {editingId ? `✏️ ${t('admin.edit', lang)}` : `➕ ${t('admin.add', lang)}`} {t('nav.products', lang)}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="input-label">{lang === 'th' ? 'หมวดหมู่ *' : 'Category *'}</label>
                <select className="input-field" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                  <option value="">{lang === 'th' ? 'เลือก...' : 'Select...'}</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.icon} {c.name_th}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">{lang === 'th' ? 'ประเภท' : 'Type'}</label>
                <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="account">{lang === 'th' ? 'แอคเคาท์' : 'Account'}</option>
                  <option value="otp">OTP</option>
                  <option value="game">{lang === 'th' ? 'เติมเกม' : 'Game Top-up'}</option>
                  <option value="mobile">{lang === 'th' ? 'เติมเงินมือถือ' : 'Mobile Top-up'}</option>
                  <option value="social">{lang === 'th' ? 'ปั๊มฟอล' : 'Social Boost'}</option>
                </select>
              </div>
              <div>
                <label className="input-label">{lang === 'th' ? 'ลำดับ' : 'Sort Order'}</label>
                <input type="number" className="input-field" value={form.sort_order} onChange={e => setForm({...form, sort_order: e.target.value})} min="0" />
              </div>
              <div>
                <label className="input-label">{lang === 'th' ? 'ชื่อ (ไทย) *' : 'Name (TH) *'}</label>
                <input className="input-field" value={form.name_th} onChange={e => setForm({...form, name_th: e.target.value})} placeholder="OTP Google/Gmail" />
              </div>
              <div>
                <label className="input-label">{lang === 'th' ? 'ชื่อ (อังกฤษ) *' : 'Name (EN) *'}</label>
                <input className="input-field" value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} placeholder="OTP Google/Gmail" />
              </div>
              <div>
                <label className="input-label">{lang === 'th' ? 'ชื่อ (จีน) *' : 'Name (ZH) *'}</label>
                <input className="input-field" value={form.name_zh} onChange={e => setForm({...form, name_zh: e.target.value})} placeholder="Google/Gmail 验证码" />
              </div>
              <div>
                <label className="input-label">{lang === 'th' ? 'ราคา (฿) *' : 'Price (฿) *'}</label>
                <input type="number" className="input-field" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" min="0" step="0.01" />
              </div>
              <div>
                <label className="input-label">{lang === 'th' ? 'ราคาเดิม (฿)' : 'Original Price (฿)'}</label>
                <input type="number" className="input-field" value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})} placeholder="0.00" min="0" step="0.01" />
              </div>
              <div>
                <label className="input-label">{lang === 'th' ? 'สต็อก *' : 'Stock *'}</label>
                <input type="number" className="input-field" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="0" min="0" />
              </div>
              <div className="md:col-span-3">
                <label className="input-label">{lang === 'th' ? 'คำอธิบาย (ไทย)' : 'Description (TH)'}</label>
                <textarea className="input-field" rows={2} value={form.description_th} onChange={e => setForm({...form, description_th: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Description (EN)</label>
                <textarea className="input-field" rows={2} value={form.description_en} onChange={e => setForm({...form, description_en: e.target.value})} />
              </div>
              <div>
                <label className="input-label">描述 (中文)</label>
                <textarea className="input-field" rows={2} value={form.description_zh} onChange={e => setForm({...form, description_zh: e.target.value})} />
              </div>
            </div>

            {/* Image upload */}
            <div className="mt-5">
              <label className="input-label">{lang === 'th' ? 'รูปสินค้า' : 'Product Image'}</label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex gap-3">
                    <input className="input-field flex-1" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="URL หรืออัพโหลด →" />
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-secondary whitespace-nowrap">
                      {uploading ? '⏳...' : '📁 อัพโหลด'}
                    </button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>JPG, PNG, WebP — ไม่เกิน 2MB</p>
                </div>
                {form.image_url && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden border flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
                    <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = ''; }} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={resetForm} className="btn-secondary px-6">{t('common.cancel', lang)}</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary px-8">
                {saving ? '⏳...' : editingId ? `💾 ${t('common.save', lang)}` : `➕ ${t('admin.add', lang)}`}
              </button>
            </div>
          </div>
        )}

        {/* Products table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'สินค้า' : 'Product'}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'หมวด' : 'Category'}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'ราคา' : 'Price'}</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'สต็อก' : 'Stock'}</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'สถานะ' : 'Status'}</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{lang === 'th' ? 'จัดการ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                    <div className="text-4xl mb-2">📦</div>
                    {lang === 'th' ? 'ยังไม่มีสินค้า — กด + เพิ่มสินค้า' : 'No products yet — click + Add Product'}
                  </td></tr>
                ) : products.map(p => (
                  <tr key={p.id} className="border-t hover:bg-[oklch(1_0_0_/_0.02)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--border)' }}>
                            <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg" style={{ background: 'var(--bg-input)' }}>📦</div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{p.name_th}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.type} • #{p.sort_order}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge badge-primary">{p.cat_name_th}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-bold" style={{ color: 'var(--primary)' }}>฿{p.price}</p>
                      {p.original_price && <p className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>฿{p.original_price}</p>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`stock-dot ${p.stock > 5 ? 'stock-dot-high' : p.stock > 0 ? 'stock-dot-low' : 'stock-dot-out'}`} />
                        <span className="font-semibold" style={{ color: p.stock > 5 ? 'var(--success)' : p.stock > 0 ? 'var(--warning)' : 'var(--danger)' }}>
                          {p.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleActive(p)}
                        className={`badge cursor-pointer transition-all ${p.active ? 'badge-success' : 'badge-danger'}`}>
                        {p.active ? (lang === 'th' ? 'แสดง' : 'Active') : (lang === 'th' ? 'ซ่อน' : 'Hidden')}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => startEdit(p)} className="px-3 py-1.5 text-xs rounded-lg font-semibold transition-all hover:bg-[oklch(0.78_0.16_235_/_0.1)]" style={{ color: 'var(--primary)' }}>
                          ✏️ {t('admin.edit', lang)}
                        </button>
                        {deleteConfirm === p.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(p.id)} disabled={saving} className="px-3 py-1.5 text-xs rounded-lg font-semibold bg-[oklch(0.65_0.22_22_/_0.15)] text-[var(--danger)]">
                              {saving ? '...' : (lang === 'th' ? 'ยืนยันลบ' : 'Confirm')}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1.5 text-xs rounded-lg" style={{ color: 'var(--text-muted)' }}>✕</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(p.id)} className="px-3 py-1.5 text-xs rounded-lg font-semibold transition-all hover:bg-[oklch(0.65_0.22_22_/_0.1)]" style={{ color: 'var(--danger)' }}>
                            🗑️ {t('admin.delete', lang)}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
