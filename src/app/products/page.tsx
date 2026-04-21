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
      // Refresh products
      fetch('/api/products').then(r => r.json()).then(d => {
        setProducts(d.products || []);
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 fade-in">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">
        {t('nav.products', lang)}
      </h1>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === 'all' ? 'gradient-bg text-white' : 'btn-secondary'}`}
        >
          {t('common.all', lang)}
        </button>
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.slug ? 'gradient-bg text-white' : 'btn-secondary'}`}
          >
            {cat.icon} {getName(cat)}
          </button>
        ))}
      </div>

      {/* Result modal */}
      {result && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold mb-2">{t('common.success', lang)}</h2>
            <p className="text-sm mb-4" style={{color: 'var(--text-secondary)'}}>
              {getName(result)}
            </p>
            <div className="p-4 rounded-lg mb-4 text-left" style={{backgroundColor: 'var(--bg-primary)', fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all'}}>
              {result.delivered_data}
            </div>
            <button
              onClick={() => { setResult(null); router.refresh(); }}
              className="btn-primary w-full"
            >
              {t('common.back', lang)}
            </button>
          </div>
        </div>
      )}

      {/* Buy confirmation modal */}
      {buyingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t('product.buy', lang)}</h2>
            <p className="font-medium mb-2">{getName(buyingProduct)}</p>
            <p className="text-sm mb-4" style={{color: 'var(--text-secondary)'}}>{getDesc(buyingProduct)}</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="price-tag">฿{buyingProduct.price}</span>
              {buyingProduct.original_price && <span className="price-original">฿{buyingProduct.original_price}</span>}
            </div>
            {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{backgroundColor: 'var(--danger)', color: 'white'}}>{error}</div>}
            <div className="flex gap-3">
              <button onClick={() => { setBuyingProduct(null); setError(''); }} className="btn-secondary flex-1">{t('common.cancel', lang)}</button>
              <button onClick={() => handleBuy(buyingProduct)} disabled={loading} className="btn-primary flex-1">
                {loading ? t('common.loading', lang) : t('product.buy', lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p: any) => (
          <div key={p.id} className="card p-6">
            <div className="flex items-start justify-between mb-3">
              <span className="badge badge-blue">{p.category_icon} {p.category_slug}</span>
              {p.stock > 0 ? (
                <div className="stock-indicator">
                  <span className={`stock-dot ${p.stock < 5 ? 'low' : 'available'}`}></span>
                  {t('product.stock', lang)} {p.stock}
                </div>
              ) : (
                <span className="badge badge-red">{t('product.outOfStock', lang)}</span>
              )}
            </div>
            <h3 className="font-bold mb-1">{getName(p)}</h3>
            <p className="text-xs mb-4" style={{color: 'var(--text-muted)'}}>{getDesc(p)}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="price-tag">฿{p.price}</span>
                {p.original_price && (
                  <>
                    <span className="price-original">฿{p.original_price}</span>
                    <span className="badge badge-green text-xs">
                      {t('product.discount', lang)} {Math.round((1 - p.price / p.original_price) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setBuyingProduct(p)}
                disabled={p.stock <= 0}
                className={`btn-primary text-sm ${p.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {p.stock <= 0 ? t('product.outOfStock', lang) : t('product.buy', lang)}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📦</div>
          <p style={{color: 'var(--text-muted)'}}>
            {lang === 'th' ? 'ไม่พบสินค้าในหมวดนี้' : lang === 'en' ? 'No products in this category' : '此分类暂无商品'}
          </p>
        </div>
      )}
    </div>
  );
}
