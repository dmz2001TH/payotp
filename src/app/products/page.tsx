'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const { lang, user } = useApp();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [buyingProduct, setBuyingProduct] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(data => {
      setCategories(data.categories || []);
      setProducts(data.products || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) setActiveCategory(cat);
  }, []);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p: any) => p.category_slug === activeCategory);

  const getName = (item: any) => item[`name_${lang}`] || item.name_th;
  const getDesc = (item: any) => item[`description_${lang}`] || item.description_th || '';

  const handleBuy = async (product: any) => {
    if (!user) {
      router.push('/auth');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.order);
      setBuyingProduct(null);
      fetch('/api/products').then(r => r.json()).then(d => setProducts(d.products || []));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container-app py-8">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
            🛍️ {t('nav.products', lang)}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {lang === 'th' ? 'เลือกซื้อสินค้าคุณภาพ ราคาถูกที่สุด' : lang === 'en' ? 'Shop quality products at the best prices' : '选购优质商品，最低价格'}
          </p>
        </div>
      </div>

      <div className="container-app py-8">
        {/* Category filter — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveCategory('all')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeCategory === 'all'
                ? 'gradient-bg text-white shadow-md'
                : 'btn-secondary'
            }`}
          >
            {t('common.all', lang)}
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeCategory === cat.slug
                  ? 'gradient-bg text-white shadow-md'
                  : 'btn-secondary'
              }`}
            >
              {cat.icon} {getName(cat)}
            </button>
          ))}
        </div>

        {/* Result modal */}
        {result && (
          <div className="modal-overlay">
            <div className="modal-content p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto mb-4">
                ✅
              </div>
              <h2 className="text-xl font-extrabold mb-2">
                {lang === 'th' ? 'ซื้อสำเร็จ!' : lang === 'en' ? 'Purchase Complete!' : '购买成功！'}
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                {getName(result)}
              </p>
              <div
                className="p-4 rounded-xl mb-6 text-left font-mono text-sm break-all"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
              >
                {result.delivered_data}
              </div>
              <button onClick={() => setResult(null)} className="btn-primary w-full py-3">
                {t('common.back', lang)}
              </button>
            </div>
          </div>
        )}

        {/* Buy confirmation modal */}
        {buyingProduct && (
          <div className="modal-overlay">
            <div className="modal-content p-8">
              <h2 className="text-lg font-extrabold mb-4">
                {lang === 'th' ? 'ยืนยันการซื้อ' : lang === 'en' ? 'Confirm Purchase' : '确认购买'}
              </h2>
              <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--bg-input)' }}>
                <p className="font-bold mb-1">{getName(buyingProduct)}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{getDesc(buyingProduct)}</p>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-extrabold text-[var(--primary)]">฿{buyingProduct.price}</span>
                {buyingProduct.original_price && (
                  <span className="price-original">฿{buyingProduct.original_price}</span>
                )}
              </div>
              {user && (
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  {lang === 'th' ? 'ยอดคงเหลือ' : 'Balance'}: <span className="font-bold text-[var(--primary)]">฿{user.balance?.toFixed(2)}</span>
                </p>
              )}
              {error && (
                <div className="toast-error mb-4 text-sm">{error}</div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setBuyingProduct(null); setError(''); }} className="btn-secondary flex-1 py-3">
                  {t('common.cancel', lang)}
                </button>
                <button onClick={() => handleBuy(buyingProduct)} disabled={loading} className="btn-primary flex-1 py-3">
                  {loading ? t('common.loading', lang) : t('product.buy', lang)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((p: any) => (
              <div key={p.id} className="product-card">
                <div className="product-card-header">
                  <span className="badge badge-primary">{p.category_icon} {p.category_slug}</span>
                  {p.stock > 0 ? (
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className={`stock-dot ${p.stock < 5 ? 'stock-dot-low' : 'stock-dot-high'}`}></span>
                      {t('product.stock', lang)} {p.stock}
                    </div>
                  ) : (
                    <span className="badge badge-danger">{t('product.outOfStock', lang)}</span>
                  )}
                </div>
                <div className="product-card-body">
                  <h3 className="font-bold mb-1.5">{getName(p)}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {getDesc(p)}
                  </p>
                </div>
                <div className="product-card-footer">
                  <div className="flex items-baseline gap-2">
                    <span className="price-sm">฿{p.price}</span>
                    {p.original_price && (
                      <>
                        <span className="price-original">฿{p.original_price}</span>
                        <span className="discount-tag">
                          -{Math.round((1 - p.price / p.original_price) * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => setBuyingProduct(p)}
                    disabled={p.stock <= 0}
                    className={`btn-primary text-sm ${p.stock <= 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {p.stock <= 0 ? t('product.outOfStock', lang) : t('product.buy', lang)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="font-semibold mb-1">
              {lang === 'th' ? 'ไม่พบสินค้า' : lang === 'en' ? 'No products found' : '未找到商品'}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {lang === 'th' ? 'ลองเลือกหมวดหมู่อื่น' : lang === 'en' ? 'Try another category' : '尝试其他分类'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
