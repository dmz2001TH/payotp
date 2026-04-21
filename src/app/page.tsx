'use client';
import Link from 'next/link';
import { useApp } from '@/components/AppContext';
import { t, type Lang } from '@/lib/i18n';
import { useEffect, useState } from 'react';

const heroData: Record<Lang, { title: string; subtitle: string; cta: string }> = {
  th: {
    title: 'OTP ราคาถูกที่สุด\nส่งทันที 24 ชม.',
    subtitle: 'แอคเคาท์พรีเมียม • AI Tools • เติมเกม • ปั๊มฟอล',
    cta: 'เริ่มซื้อเลย',
  },
  en: {
    title: 'Cheapest OTP\nInstant Delivery 24/7',
    subtitle: 'Premium Accounts • AI Tools • Game Top-up • Social Boost',
    cta: 'Start Shopping',
  },
  zh: {
    title: '最低价 OTP\n即时送达 24小时',
    subtitle: '高级账号 • AI工具 • 游戏充值 • 涨粉涨赞',
    cta: '开始购买',
  },
};

const trustBadges = [
  { icon: '⚡', th: 'ส่งอัตโนมัติ', en: 'Auto Delivery', zh: '自动发货' },
  { icon: '🕐', th: 'เปิด 24 ชม.', en: '24/7 Open', zh: '24小时' },
  { icon: '💰', th: 'ราคาถูกสุด', en: 'Lowest Price', zh: '最低价' },
  { icon: '🔒', th: 'ปลอดภัย 100%', en: '100% Secure', zh: '100%安全' },
];

export default function HomePage() {
  const { lang } = useApp();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories || []);
        setProducts(data.products?.slice(0, 6) || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const getName = (item: any) => item[`name_${lang}`] || item.name_th;
  const getDesc = (item: any) => item[`description_${lang}`] || item.description_th || '';

  const h = heroData[lang];

  return (
    <div className="animate-fade-in">
      {/* ============ HERO ============ */}
      <section className="hero-section text-white py-20 md:py-28 relative">
        <div className="container-app relative z-10">
          <div className="max-w-2xl mx-auto md:mx-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              {lang === 'th' ? 'ออนไลน์แล้ว — สินค้าพร้อมส่ง' : lang === 'en' ? 'Online — Ready to Deliver' : '在线 — 随时发货'}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 whitespace-pre-line">
              {h.title}
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-lg">
              {h.subtitle}
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/products"
                className="btn-primary text-base px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
              >
                {h.cta} →
              </Link>
              <Link
                href="/auth?mode=register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all text-base"
              >
                {t('nav.register', lang)}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 md:gap-6">
              {trustBadges.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="text-lg">{b.icon}</span>
                  <span>{b[lang === 'th' ? 'th' : lang === 'en' ? 'en' : 'zh']}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="container-app py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
            {lang === 'th' ? 'บริการของเรา' : lang === 'en' ? 'Our Services' : '我们的服务'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {lang === 'th' ? 'เลือกบริการที่คุณต้องการ' : lang === 'en' ? 'Choose what you need' : '选择您需要的服务'}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="service-card"
            >
              <span className="service-icon">{cat.icon}</span>
              <h3 className="text-sm font-bold leading-tight">{getName(cat)}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ POPULAR PRODUCTS ============ */}
      {products.length > 0 && (
        <section className="container-app py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-1">
                🔥 {lang === 'th' ? 'สินค้ายอดนิยม' : lang === 'en' ? 'Popular Products' : '热门商品'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {lang === 'th' ? 'สินค้าขายดีที่สุดของเรา' : lang === 'en' ? 'Our best-selling products' : '我们最畅销的商品'}
              </p>
            </div>
            <Link href="/products" className="text-[var(--primary)] text-sm font-semibold hover:underline hidden sm:inline">
              {lang === 'th' ? 'ดูทั้งหมด →' : lang === 'en' ? 'View All →' : '查看全部 →'}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p: any) => (
              <Link key={p.id} href="/products" className="product-card">
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
                  <h3 className="font-bold mb-1">{getName(p)}</h3>
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
                  <span className="btn-primary text-xs px-4 py-2">
                    {t('product.buy', lang)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-6 sm:hidden">
            <Link href="/products" className="btn-secondary">
              {lang === 'th' ? 'ดูทั้งหมด →' : lang === 'en' ? 'View All →' : '查看全部 →'}
            </Link>
          </div>
        </section>
      )}

      {/* ============ WHY US ============ */}
      <section className="container-app py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
            {lang === 'th' ? 'ทำไมต้อง PayOTP?' : lang === 'en' ? 'Why Choose PayOTP?' : '为什么选择 PayOTP？'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '⚡',
              title_th: 'ส่งอัตโนมัติ ทันที',
              title_en: 'Instant Auto Delivery',
              title_zh: '即时自动发货',
              desc_th: 'สินค้าส่งทันทีหลังจ่ายเงิน ไม่ต้องรอ ไม่ต้องทักแอดมิน',
              desc_en: 'Products delivered instantly after payment. No waiting.',
              desc_zh: '付款后即时发货，无需等待',
            },
            {
              icon: '💰',
              title_th: 'ราคาถูกที่สุด',
              title_en: 'Lowest Prices',
              title_zh: '最低价格',
              desc_th: 'ราคาส่งจากจีนโดยตรง ถูกกว่าหน้าร้าน 30-60%',
              desc_en: 'Wholesale prices directly from China. 30-60% cheaper.',
              desc_zh: '中国直供批发价，比零售便宜30-60%',
            },
            {
              icon: '🔒',
              title_th: 'ปลอดภัย มั่นใจ',
              title_en: 'Safe & Secure',
              title_zh: '安全可靠',
              desc_th: 'ข้อมูลปลอดภัย SSL ชำระเงินผ่าน PromptPay ที่เชื่อถือได้',
              desc_en: 'SSL secured. Payment via trusted PromptPay.',
              desc_zh: 'SSL加密保护，通过可信赖的PromptPay付款',
            },
          ].map((item, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{item.icon}</div>
              <h3 className="font-bold mb-2">
                {item[`title_${lang}` as keyof typeof item]}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item[`desc_${lang}` as keyof typeof item]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PAYMENT METHODS ============ */}
      <section className="container-app py-12">
        <div className="card p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-extrabold mb-2">
              💳 {lang === 'th' ? 'ช่องทางชำระเงิน' : lang === 'en' ? 'Payment Methods' : '支付方式'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {lang === 'th' ? 'สะดวก รวดเร็ว ปลอดภัย' : lang === 'en' ? 'Convenient, Fast, Secure' : '方便、快速、安全'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {['PromptPay', 'TrueMoney', 'กสิกร', 'ไทยพาณิชย์', 'กรุงไทย', 'กรุงเทพ'].map((bank) => (
              <div
                key={bank}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}
              >
                {bank}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="container-app py-16">
        <div className="gradient-bg rounded-2xl p-10 md:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M0 0h20v20H0V0zm20 20h20v20H20V20z\'/%3E%3C/g%3E%3C/svg%3E")'
          }}></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4">
              {lang === 'th' ? 'พร้อมซื้อสินค้าราคาถูก?' : lang === 'en' ? 'Ready to Shop?' : '准备购物了吗？'}
            </h2>
            <p className="text-white/80 mb-8 text-lg max-w-md mx-auto">
              {lang === 'th'
                ? 'สมัครสมาชิกฟรี แล้วเริ่มซื้อสินค้าราคาถูกได้เลย'
                : lang === 'en'
                ? 'Register for free and start buying at the lowest prices'
                : '免费注册，立即开始低价购物'}
            </p>
            <Link
              href="/auth?mode=register"
              className="inline-flex items-center gap-2 bg-white text-[var(--primary)] font-bold px-10 py-4 rounded-xl hover:shadow-xl transition-all text-lg"
            >
              {t('auth.registerBtn', lang)} 🚀
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
