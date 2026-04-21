'use client';
import Link from 'next/link';
import { useApp } from '@/components/AppContext';
import { t, type Lang } from '@/lib/i18n';
import { useEffect, useState } from 'react';

const heroSlides: Record<Lang, { title: string; subtitle: string; cta: string }[]> = {
  th: [
    { title: 'OTP หลากหลายประเทศ\nราคาถูกที่สุด', subtitle: 'สมัคร Gmail, Facebook, Instagram, Line, TikTok และอื่น ๆ เริ่มต้น 5 บาท', cta: 'ดูสินค้าทั้งหมด' },
    { title: 'แอคเคาท์พรีเมียม\nราคาส่ง', subtitle: 'Netflix, YouTube Premium, ChatGPT, Claude AI ราคาถูกที่สุด ส่งทันที', cta: 'ซื้อเลย' },
    { title: 'เติมเกมออนไลน์\nราคาถูก', subtitle: 'ROV, FreeFire, PUBG, Roblox ระบบออโต้ เงินเข้าไว ไม่ต้องใช้รหัส', cta: 'เติมเกมเลย' },
  ],
  en: [
    { title: 'Multi-Country OTP\nLowest Prices', subtitle: 'Register for Gmail, Facebook, Instagram, Line, TikTok and more. Starting ฿5', cta: 'View All' },
    { title: 'Premium Accounts\nWholesale Prices', subtitle: 'Netflix, YouTube Premium, ChatGPT, Claude AI at the cheapest prices', cta: 'Shop Now' },
    { title: 'Game Top-Up\nCheapest Online', subtitle: 'ROV, FreeFire, PUBG, Roblox — auto system, instant delivery', cta: 'Top Up Now' },
  ],
  zh: [
    { title: '多国OTP\n最低价格', subtitle: '注册 Gmail、Facebook、Instagram、Line、TikTok 等，最低5泰铢', cta: '查看全部' },
    { title: '高级账号\n批发价格', subtitle: 'Netflix、YouTube Premium、ChatGPT、Claude AI 最低价', cta: '立即购买' },
    { title: '游戏充值\n最便宜', subtitle: 'ROV、FreeFire、PUBG、Roblox — 自动系统，即时到账', cta: '立即充值' },
  ],
};

const services = [
  { href: '/products?category=otp', icon: '📱', label_th: 'OTP', label_en: 'OTP', label_zh: '验证码' },
  { href: '/products?category=premium', icon: '⭐', label_th: 'สตรีมมิ่ง', label_en: 'Streaming', label_zh: '流媒体' },
  { href: '/products?category=ai', icon: '🤖', label_th: 'AI Tools', label_en: 'AI Tools', label_zh: 'AI工具' },
  { href: '/products?category=games', icon: '🎮', label_th: 'เติมเกม', label_en: 'Games', label_zh: '游戏充值' },
  { href: '/products?category=cards', icon: '💳', label_th: 'บัตรเงินสด', label_en: 'Gift Cards', label_zh: '礼品卡' },
  { href: '/products?category=social', icon: '📈', label_th: 'ปั๊มฟอล', label_en: 'Social Boost', label_zh: '涨粉涨赞' },
];

export default function HomePage() {
  const { lang } = useApp();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = heroSlides[lang];

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

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const getName = (item: any) => item[`name_${lang}`] || item.name_th;
  const getDesc = (item: any) => item[`description_${lang}`] || item.description_th || '';

  const currentSlide = slides[slideIndex];

  return (
    <div>
      {/* ============ HERO BANNER ============ */}
      <section className="hero-banner" style={{ minHeight: '480px' }}>
        <div className="container-app hero-content text-center py-20 md:py-28">
          {/* Online badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(34,197,94,0.15)] text-sm font-medium mb-6 text-[var(--success)]">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            {lang === 'th' ? 'ออนไลน์แล้ว — ระบบพร้อมบริการ' : lang === 'en' ? 'Online — System Ready' : '在线 — 系统就绪'}
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 whitespace-pre-line text-white" key={slideIndex} style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {currentSlide.title}
          </h1>
          <p className="text-base md:text-lg text-white/60 mb-8 max-w-xl mx-auto" style={{ animation: 'fadeIn 0.5s ease-out 0.1s both' }}>
            {currentSlide.subtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8" style={{ animation: 'fadeIn 0.5s ease-out 0.2s both' }}>
            <Link href="/products" className="btn-neon btn-neon-1 text-base px-8 py-3.5">
              {currentSlide.cta} →
            </Link>
            {!false && (
              <Link href="/auth?mode=register" className="btn-neon px-8 py-3.5 text-base" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}>
                {t('nav.register', lang)}
              </Link>
            )}
          </div>

          {/* Slide dots */}
          <div className="flex justify-center gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setSlideIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === slideIndex ? 'bg-[var(--primary)] w-8' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ SERVICE GRID (6 icons like OTP24HR) ============ */}
      <section className="container-app py-10 -mt-6 relative z-10">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {services.map((s) => (
            <Link key={s.href} href={s.href} className="recommend-menu">
              <div className="icon-menu text-3xl md:text-4xl">{s.icon}</div>
              <div className="title mt-2">
                {s[`label_${lang}` as keyof typeof s]}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ OTP SECTION ============ */}
      <section className="container-app py-12">
        <div className="section-header flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div className="flex-1">
            <h2 className="section-title">
              {lang === 'th' ? '📱 บริการ OTP' : lang === 'en' ? '📱 OTP Services' : '📱 OTP 服务'}
            </h2>
            <p className="section-subtitle">
              {lang === 'th' ? 'OTP หลากหลายประเทศ ใช้สมัครบัญชีต่าง ๆ เริ่มต้น 5 บาท' : lang === 'en' ? 'Multi-country OTP for account registration. Starting ฿5' : '多国验证码，用于注册各种账号，最低5泰铢'}
            </p>
            <div className="section-divider" />
          </div>
          <Link href="/products?category=otp" className="btn-primary-modern text-sm hidden md:inline-flex">
            {lang === 'th' ? 'ดูทั้งหมด' : 'View All'} →
          </Link>
        </div>

        {loaded && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {products.map((p: any) => (
              <Link key={p.id} href="/products" className="product-card-modern relative">
                {p.original_price && (
                  <div className="discount-circle">
                    -{Math.round((1 - p.price / p.original_price) * 100)}%
                  </div>
                )}
                {p.image_url ? (
                  <div className="overflow-hidden" style={{ height: '160px' }}>
                    <img src={p.image_url} alt={getName(p)} className="product-card-img" />
                  </div>
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-5xl" style={{ background: 'var(--bg-elevated)' }}>
                    {p.category_icon || '📦'}
                  </div>
                )}
                <div className="product-card-body">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge-modern badge-primary-modern">{p.category_icon} {p.category_slug}</span>
                    {p.stock > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <span className={`stock-dot ${p.stock < 5 ? 'stock-dot-low' : 'stock-dot-high'}`} />
                        {t('product.stock', lang)} {p.stock}
                      </div>
                    ) : (
                      <span className="badge-modern badge-danger-modern">{t('product.outOfStock', lang)}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm mb-1">{getName(p)}</h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">{getDesc(p)}</p>
                </div>
                <div className="product-card-footer">
                  <div className="flex items-baseline gap-2">
                    <span className="price-modern text-base">฿{p.price}</span>
                    {p.original_price && <span className="price-original-modern">฿{p.original_price}</span>}
                  </div>
                  <span className="btn-neon btn-neon-accent text-xs px-4 py-2">
                    {t('product.buy', lang)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="card-modern p-5"><div className="skeleton-modern h-40 mb-3" /><div className="skeleton-modern h-5 w-3/4 mb-2" /><div className="skeleton-modern h-3 w-full" /></div>)}
          </div>
        )}

        <div className="text-center mt-6 md:hidden">
          <Link href="/products?category=otp" className="btn-secondary-modern">
            {lang === 'th' ? 'ดูทั้งหมด →' : 'View All →'}
          </Link>
        </div>
      </section>

      {/* ============ SERVICE CATEGORIES ============ */}
      {categories.length > 0 && (
        <section className="container-app py-12">
          <div className="section-header">
            <h2 className="section-title">
              {lang === 'th' ? '🛍️ บริการของเรา' : lang === 'en' ? '🛍️ Our Services' : '🛍️ 我们的服务'}
            </h2>
            <p className="section-subtitle">
              {lang === 'th' ? 'เลือกบริการที่คุณต้องการ' : lang === 'en' ? 'Choose what you need' : '选择您需要的服务'}
            </p>
            <div className="section-divider" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`} className="recommend-menu">
                <div className="icon-menu">{cat.icon}</div>
                <div className="title mt-2">{getName(cat)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ POPULAR PRODUCTS ============ */}
      {products.length > 0 && (
        <section className="container-app py-12">
          <div className="section-header flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div className="flex-1">
              <h2 className="section-title">🔥 {lang === 'th' ? 'สินค้ายอดนิยม' : lang === 'en' ? 'Popular Products' : '热门商品'}</h2>
              <p className="section-subtitle">{lang === 'th' ? 'สินค้าขายดีที่สุดของเรา' : lang === 'en' ? 'Our best-selling products' : '我们最畅销的商品'}</p>
              <div className="section-divider" />
            </div>
            <Link href="/products" className="btn-primary-modern text-sm hidden md:inline-flex">
              {lang === 'th' ? 'ดูทั้งหมด' : 'View All'} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {products.map((p: any) => (
              <Link key={p.id} href="/products" className="product-card-modern relative">
                {p.original_price && <div className="discount-circle">-{Math.round((1 - p.price / p.original_price) * 100)}%</div>}
                {p.image_url ? (
                  <div className="overflow-hidden" style={{ height: '160px' }}>
                    <img src={p.image_url} alt={getName(p)} className="product-card-img" />
                  </div>
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-5xl" style={{ background: 'var(--bg-elevated)' }}>
                    {p.category_icon || '📦'}
                  </div>
                )}
                <div className="product-card-body">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge-modern badge-primary-modern">{p.category_icon} {p.category_slug}</span>
                    {p.stock > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <span className={`stock-dot ${p.stock < 5 ? 'stock-dot-low' : 'stock-dot-high'}`} />
                        {t('product.stock', lang)} {p.stock}
                      </div>
                    ) : <span className="badge-modern badge-danger-modern">{t('product.outOfStock', lang)}</span>}
                  </div>
                  <h3 className="font-bold text-sm mb-1">{getName(p)}</h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">{getDesc(p)}</p>
                </div>
                <div className="product-card-footer">
                  <div className="flex items-baseline gap-2">
                    <span className="price-modern text-base">฿{p.price}</span>
                    {p.original_price && <span className="price-original-modern">฿{p.original_price}</span>}
                  </div>
                  <span className="btn-neon btn-neon-accent text-xs px-4 py-2">{t('product.buy', lang)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ FEATURES (like OTP24HR feature-item) ============ */}
      <section className="container-app py-12">
        <div className="section-header text-center">
          <h2 className="section-title">{lang === 'th' ? '✨ ทำไมต้อง PayOTP?' : lang === 'en' ? '✨ Why Choose PayOTP?' : '✨ 为什么选择 PayOTP？'}</h2>
          <div className="section-divider mx-auto" style={{ maxWidth: '200px' }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {[
            { icon: '⚡', title_th: 'ส่งอัตโนมัติ ทันที', title_en: 'Instant Auto Delivery', title_zh: '即时自动发货', desc_th: 'สินค้าส่งทันทีหลังจ่ายเงิน ไม่ต้องรอ ไม่ต้องทักแอดมิน', desc_en: 'Products delivered instantly after payment', desc_zh: '付款后即时发货，无需等待' },
            { icon: '💰', title_th: 'ราคาถูกที่สุด', title_en: 'Lowest Prices', title_zh: '最低价格', desc_th: 'ราคาส่งจากจีนโดยตรง ถูกกว่าหน้าร้าน 30-60%', desc_en: 'Wholesale prices directly from China. 30-60% cheaper', desc_zh: '中国直供批发价，比零售便宜30-60%' },
            { icon: '🔒', title_th: 'ปลอดภัย มั่นใจ', title_en: 'Safe & Secure', title_zh: '安全可靠', desc_th: 'ข้อมูลปลอดภัย SSL ชำระเงินผ่าน PromptPay ที่เชื่อถือได้', desc_en: 'SSL secured. Payment via trusted PromptPay', desc_zh: 'SSL加密保护，通过可信赖的PromptPay付款' },
          ].map((item, i) => (
            <div key={i} className="feature-item">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-sm mb-2">{item[`title_${lang}` as keyof typeof item]}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item[`desc_${lang}` as keyof typeof item]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PAYMENT METHODS ============ */}
      <section className="container-app py-12">
        <div className="card-modern p-8 md:p-10">
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold mb-2">
              💳 {lang === 'th' ? 'รองรับทุกธนาคาร' : lang === 'en' ? 'All Banks Supported' : '支持所有银行'}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              {lang === 'th' ? 'เติมง่ายและรวดเร็ว ด้วยระบบ QR Code' : lang === 'en' ? 'Easy & fast top-up via QR Code' : '通过二维码轻松快速充值'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['PromptPay', 'กสิกร', 'ไทยพาณิชย์', 'กรุงไทย', 'กรุงเทพ', 'กรุงศรี', 'TrueMoney', 'ออมสิน'].map((bank) => (
              <div key={bank} className="payment-badge">{bank}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="container-app py-16">
        <div className="rounded-2xl p-10 md:p-14 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)' }}>
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M0 0h20v20H0V0zm20 20h20v20H20V20z\'/%3E%3C/g%3E%3C/svg%3E")'
          }} />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4 text-white">
              {lang === 'th' ? 'พร้อมซื้อสินค้าราคาถูก?' : lang === 'en' ? 'Ready to Shop?' : '准备购物了吗？'}
            </h2>
            <p className="text-white/80 mb-8 text-lg max-w-md mx-auto">
              {lang === 'th' ? 'สมัครสมาชิกฟรี แล้วเริ่มซื้อสินค้าราคาถูกได้เลย' : lang === 'en' ? 'Register for free and start buying at the lowest prices' : '免费注册，立即开始低价购物'}
            </p>
            <Link href="/auth?mode=register" className="btn-neon px-10 py-4 text-lg" style={{ background: 'white', color: '#4f46e5', fontWeight: 800, boxShadow: '0 0 30px rgba(255,255,255,0.3)' }}>
              {t('auth.registerBtn', lang)} 🚀
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
