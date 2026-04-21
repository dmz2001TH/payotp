'use client';
import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/components/AppContext';
import { useToast } from '@/components/Toast';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 9;

export default function ProductsPage() {
  const { lang, user } = useApp();
  const toast = useToast();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [buyingProduct, setBuyingProduct] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories || []);
        setProducts(data.products || []);
        setDataLoaded(true);
      })
      .catch(() => setDataLoaded(true));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) setActiveCategory(cat);
  }, []);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [activeCategory, searchQuery]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== 'all') {
      result = result.filter((p: any) => p.category_slug === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p: any) =>
        (p.name_th || '').toLowerCase().includes(q) ||
        (p.name_en || '').toLowerCase().includes(q) ||
        (p.name_zh || '').toLowerCase().includes(q) ||
        (p.description_th || '').toLowerCase().includes(q) ||
        (p.description_en || '').toLowerCase().includes(q) ||
        (p.category_slug || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, activeCategory, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const getName = (item: any) => item[`name_${lang}`] || item.name_th;
  const getDesc = (item: any) => item[`description_${lang}`] || item.description_th || '';

  const handleBuy = async (product: any) => {
    if (!user) {
      router.push('/auth');
      return;
    }
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
      toast.showToast(t('toast.buySuccess', lang), 'success');
      // Refresh products
      fetch('/api/products').then((r) => r.json()).then((d) => setProducts(d.products || []));
    } catch (err: any) {
      toast.showToast(err.message || t('toast.error', lang), 'error');
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
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">🔍</span>
            <input
              type="text"
              className="input-field pl-11 pr-4"
              placeholder={t('product.search', lang)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-[var(--bg-input)] transition-all"
                style={{ color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category filter — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
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

        {/* Results count */}
        {(searchQuery || activeCategory !== 'all') && (
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            {lang === 'th' ? 'พบ' : lang === 'en' ? 'Found' : '找到'} {filteredProducts.length} {lang === 'th' ? 'รายการ' : lang === 'en' ? 'items' : '个商品'}
          </p>
        )}

        {/* Result modal */}
        {result && (
          <div className="modal-overlay">
            <div className="modal-content p-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: 'rgba(16,185,129,0.1)' }}>
                ✅
              </div>
              <h2 className="text-xl font-extrabold mb-2">
                {lang === 'th' ? 'ซื้อสำเร็จ!' : lang === 'en' ? 'Purchase Complete!' : '购买成功！'}
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                {getName(result)}
              </p>
              <div
                className="p-5 rounded-xl mb-6 text-left font-mono text-sm break-all leading-relaxed"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}
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
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold">
                  {lang === 'th' ? 'ยืนยันการซื้อ' : lang === 'en' ? 'Confirm Purchase' : '确认购买'}
                </h2>
                <button onClick={() => setBuyingProduct(null)} className="btn-ghost text-xl">✕</button>
              </div>
              <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--bg-input)' }}>
                <p className="font-bold mb-1">{getName(buyingProduct)}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{getDesc(buyingProduct)}</p>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-extrabold gradient-text">฿{buyingProduct.price}</span>
                {buyingProduct.original_price && (
                  <span className="price-original">฿{buyingProduct.original_price}</span>
                )}
              </div>
              {user && (
                <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                  {lang === 'th' ? 'ยอดคงเหลือ' : 'Balance'}:{' '}
                  <span className="font-bold text-[var(--primary)]">฿{user.balance?.toFixed(2)}</span>
                </p>
              )}
              <div className="flex gap-3">
                <button onClick={() => setBuyingProduct(null)} className="btn-secondary flex-1 py-3">
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
        {!dataLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-5">
                <div className="skeleton h-4 w-20 mb-3" />
                <div className="skeleton h-5 w-40 mb-2" />
                <div className="skeleton h-3 w-full mb-1" />
                <div className="skeleton h-3 w-3/4 mb-4" />
                <div className="skeleton h-8 w-24" />
              </div>
            ))}
          </div>
        ) : paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {paginatedProducts.map((p: any) => (
                <div key={p.id} className="product-card">
                  {/* Product image */}
                  {p.image_url && (
                    <div className="w-full h-36 md:h-44 overflow-hidden" style={{ borderBottom: '1px solid var(--border)' }}>
                      <img src={p.image_url} alt={getName(p)} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                    </div>
                  )}
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
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                      {getDesc(p)}
                    </p>
                  </div>
                  <div className="product-card-footer">
                    <div className="flex items-baseline gap-2 flex-wrap">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`btn-secondary px-4 py-2 text-sm ${page === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  ← {t('pagination.prev', lang)}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      page === p
                        ? 'gradient-bg text-white shadow-md'
                        : 'btn-secondary'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`btn-secondary px-4 py-2 text-sm ${page === totalPages ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {t('pagination.next', lang)} →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">
              {searchQuery ? '🔍' : '📦'}
            </div>
            <p className="font-bold text-lg mb-2">
              {searchQuery ? t('product.noResults', lang) : (lang === 'th' ? 'ไม่พบสินค้า' : lang === 'en' ? 'No products found' : '未找到商品')}
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              {searchQuery ? t('product.tryOther', lang) : (lang === 'th' ? 'ลองเลือกหมวดหมู่อื่น' : lang === 'en' ? 'Try another category' : '尝试其他分类')}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="btn-secondary">
                {lang === 'th' ? 'ล้างการค้นหา' : lang === 'en' ? 'Clear search' : '清除搜索'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
