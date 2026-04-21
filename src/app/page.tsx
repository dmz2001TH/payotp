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

  useEffect(() => {
    const timer = setInterval(() => setSlideIndex((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const getName = (item: any) => item[`name_${lang}`] || item.name_th;
  const getDesc = (item: any) => item[`description_${lang}`] || item.description_th || '';
  const currentSlide = slides[slideIndex];

  return (
    <div>
      {/* ============ HERO BANNER ============ */}
      <section className="hero-banner" style={{ minHeight: '560px' }}>
        <div className="container-app hero-content text-center pt-16 pb-24 md:pt-24 md:pb-32">
          {/* Online badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: 'oklch(0.74 0.18 152 / 0.15)',
              color: 'var(--success)',
              border: '1px solid oklch(0.74 0.18 152 / 0.4)',
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
            {lang === 'th' ? 'ออนไลน์แล้ว — ระบบพร้อมบริการ 24 ชั่วโมง' : lang === 'en' ? 'Online — System Ready 24/7' : '在线 — 系统全天候就绪'}
          </div>

          <h1
            key={slideIndex}
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 whitespace-pre-line tracking-tight"
            style={{ animation: 'fadeIn 0.6s ease-out' }}
          >
            {currentSlide.title.split('\n').map((line, i) => (
              <span key={i} className="block">
                {i === 1 ? (
                  <span
                    style={{
                      background: 'var(--gradient-primary)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 0 24px oklch(0.78 0.16 235 / 0.5))',
                    }}
                  >
                    {line}
                  </span>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>

          <p className="text-base md:text-lg mb-9 max-w-2xl mx-auto" style={{ color: 'oklch(1 0 0 / 0.7)', animation: 'fadeIn 0.6s ease-out 0.1s both' }}>
            {currentSlide.subtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10" style={{ animation: 'fadeIn 0.6s ease-out 0.2s both' }}>
            <Link href="/products" className="btn-neon px-7 py-3.5 text-base">
              {currentSlide.cta}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
            <Link href="/auth?mode=register" className="btn-neon btn-neon-ghost px-7 py-3.5 text-base">
              {t('nav.register', lang)}
            </Link>
          </div>

          {/* Slide dots */}
          <div className="flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: i === slideIndex ? '32px' : '10px',
                  background: i === slideIndex ? 'var(--gradient-primary)' : 'oklch(1 0 0 / 0.25)',
                  boxShadow: i === slideIndex ? 'var(--shadow-neon)' : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============ SERVICE GRID ============ */}
      <section className="container-app py-10 -mt-12 relative z-10">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {services.map((s) => (
            <Link key={s.href} href={s.href} className="recommend-menu">
              <div className="icon-menu">{s.icon}</div>
              <div className="title mt-2.5">{s[`label_${lang}` as keyof typeof s]}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ OTP SECTION ============ */}
      <section className="container-app py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-7">
          <div className="flex-1">
            <h2 className="section-title">
              {lang === 'th' ? '📱 บริการ OTP' : lang === 'en' ? '📱 OTP Services' : '📱 OTP 服务'}
            </h2>
            <p className="section-subtitle">
              {lang === 'th' ? 'OTP หลากหลายประเทศ ใช้สมัครบัญชีต่าง ๆ เริ่มต้น 5 บาท' : lang === 'en' ? 'Multi-country OTP for account registration. Starting ฿5' : '多国验证码，用于注册各种账号，最低5泰铢'}
            </p>
            <div className="section-divider" />
          </div>
          <Link href="/products?category=otp" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all" style={{ color: 'var(--primary)' }}>
            {lang === 'th' ? 'ดูทั้งหมด' : 'View All'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
                  <div className="overflow-hidden" style={{ height: '170px' }}>
                    <img src={p.image_url} alt={getName(p)} className="product-card-img" />
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center text-6xl" style={{ height: '170px', background: 'linear-gradient(135deg, oklch(0.24 0.05 250), oklch(0.18 0.04 250))' }}>
                    <span style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))' }}>{p.category_icon || '📦'}</span>
                  </div>
                )}
                <div className="product-card-body">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge-modern">{p.category_icon} {p.category_slug}</span>
                    {p.stock > 0 ? (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className={`stock-dot ${p.stock < 5 ? 'stock-dot-low' : 'stock-dot-high'}`} />
                        {t('product.stock', lang)} {p.stock}
                      </div>
                    ) : (
                      <span className="badge-modern" style={{ background: 'oklch(0.65 0.22 22 / 0.15)', color: 'var(--danger)', borderColor: 'oklch(0.65 0.22 22 / 0.3)' }}>{t('product.outOfStock', lang)}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-base mb-1">{getName(p)}</h3>
                  <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{getDesc(p)}</p>
                </div>
                <div className="product-card-footer">
                  <div className="flex items-baseline gap-2">
                    <span className="price-modern text-lg">฿{p.price}</span>
                    {p.original_price && <span className="price-original-modern">฿{p.original_price}</span>}
                  </div>
                  <span className="btn-neon text-xs px-4 py-2">{t('product.buy', lang)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : !loaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="card p-5">
                <div className="skeleton h-40 mb-3" />
                <div className="skeleton h-5 w-3/4 mb-2" />
                <div className="skeleton h-3 w-full" />
              </div>
            ))}
          </div>
        ) : null}

        <div className="text-center mt-6 md:hidden">
          <Link href="/products?category=otp" className="btn-secondary">
            {lang === 'th' ? 'ดูทั้งหมด →' : 'View All →'}
          </Link>
        </div>
      </section>

      {/* ============ SERVICE CATEGORIES ============ */}
      {categories.length > 0 && (
        <section className="container-app py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-7">
            <div className="flex-1">
              <h2 className="section-title">
                {lang === 'th' ? '🛍️ บริการของเรา' : lang === 'en' ? '🛍️ Our Services' : '🛍️ 我们的服务'}
              </h2>
              <p className="section-subtitle">
                {lang === 'th' ? 'เลือกบริการที่คุณต้องการ' : lang === 'en' ? 'Choose what you need' : '选择您需要的服务'}
              </p>
              <div className="section-divider" />
            </div>
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
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-7">
            <div className="flex-1">
              <h2 className="section-title">
                🔥 {lang === 'th' ? 'สินค้ายอดนิยม' : lang === 'en' ? 'Popular Products' : '热门商品'}
              </h2>
              <p className="section-subtitle">
                {lang === 'th' ? 'สินค้าขายดีที่สุดของเรา' : lang === 'en' ? 'Our best-selling products' : '我们最畅销的商品'}
              </p>
              <div className="section-divider" />
            </div>
            <Link href="/products" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all" style={{ color: 'var(--primary)' }}>
              {lang === 'th' ? 'ดูทั้งหมด' : 'View All'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {products.map((p: any) => (
              <Link key={p.id} href="/products" className="product-card-modern relative">
                {p.original_price && <div className="discount-circle">-{Math.round((1 - p.price / p.original_price) * 100)}%</div>}
                {p.image_url ? (
                  <div className="overflow-hidden" style={{ height: '170px' }}>
                    <img src={p.image_url} alt={getName(p)} className="product-card-img" />
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center text-6xl" style={{ height: '170px', background: 'linear-gradient(135deg, oklch(0.24 0.05 250), oklch(0.18 0.04 250))' }}>
                    <span style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))' }}>{p.category_icon || '📦'}</span>
                  </div>
                )}
                <div className="product-card-body">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge-modern">{p.category_icon} {p.category_slug}</span>
                    {p.stock > 0 ? (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className={`stock-dot ${p.stock < 5 ? 'stock-dot-low' : 'stock-dot-high'}`} />
                        {t('product.stock', lang)} {p.stock}
                      </div>
                    ) : <span className="badge-modern" style={{ background: 'oklch(0.65 0.22 22 / 0.15)', color: 'var(--danger)', borderColor: 'oklch(0.65 0.22 22 / 0.3)' }}>{t('product.outOfStock', lang)}</span>}
                  </div>
                  <h3 className="font-bold text-base mb-1">{getName(p)}</h3>
                  <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{getDesc(p)}</p>
                </div>
                <div className="product-card-footer">
                  <div className="flex items-baseline gap-2">
                    <span className="price-modern text-lg">฿{p.price}</span>
                    {p.original_price && <span className="price-original-modern">฿{p.original_price}</span>}
                  </div>
                  <span className="btn-neon text-xs px-4 py-2">{t('product.buy', lang)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ FEATURES ============ */}
      <section className="container-app py-14">
        <div className="text-center mb-10">
          <h2 className="section-title">
            {lang === 'th' ? '✨ ทำไมต้อง PayOTP?' : lang === 'en' ? '✨ Why Choose PayOTP?' : '✨ 为什么选择 PayOTP？'}
          </h2>
          <div className="section-divider mx-auto" style={{ marginInline: 'auto' }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {[
            { icon: '⚡', title_th: 'ส่งอัตโนมัติ ทันที', title_en: 'Instant Auto Delivery', title_zh: '即时自动发货', desc_th: 'สินค้าส่งทันทีหลังจ่ายเงิน ไม่ต้องรอ ไม่ต้องทักแอดมิน', desc_en: 'Products delivered instantly after payment', desc_zh: '付款后即时发货，无需等待' },
            { icon: '💰', title_th: 'ราคาถูกที่สุด', title_en: 'Lowest Prices', title_zh: '最低价格', desc_th: 'ราคาส่งจากผู้ผลิตโดยตรง ถูกกว่าหน้าร้าน 30-60%', desc_en: 'Wholesale prices directly. 30-60% cheaper', desc_zh: '直供批发价，比零售便宜30-60%' },
            { icon: '🔒', title_th: 'ปลอดภัย มั่นใจ', title_en: 'Safe & Secure', title_zh: '安全可靠', desc_th: 'ข้อมูลปลอดภัย SSL ชำระเงินผ่าน PromptPay ที่เชื่อถือได้', desc_en: 'SSL secured. Payment via trusted PromptPay', desc_zh: 'SSL加密保护，通过可信赖的PromptPay付款' },
          ].map((item, i) => (
            <div key={i} className="feature-item">
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl"
                style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: 'var(--shadow-neon)',
                }}
              >
                {item.icon}
              </div>
              <h3 className="font-bold text-base mb-2">{item[`title_${lang}` as keyof typeof item]}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item[`desc_${lang}` as keyof typeof item]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PAYMENT METHODS ============ */}
      <section className="container-app py-12">
        <div className="card-modern p-8 md:p-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold mb-2">
              💳 {lang === 'th' ? 'รองรับทุกธนาคาร' : lang === 'en' ? 'All Banks Supported' : '支持所有银行'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {lang === 'th' ? 'เติมเงินง่ายและรวดเร็ว ด้วยระบบ QR Code PromptPay' : lang === 'en' ? 'Easy & fast top-up via QR Code PromptPay' : '通过二维码轻松快速充值'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {['PromptPay', 'กสิกรไทย', 'ไทยพาณิชย์', 'กรุงไทย', 'กรุงเทพ', 'กรุงศรี', 'TrueMoney', 'ออมสิน'].map((bank) => (
              <div key={bank} className="payment-badge">{bank}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="container-app py-16">
        <div
          className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
          style={{
            background: 'var(--gradient-cta)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M0 0h20v20H0V0zm20 20h20v20H20V20z\'/%3E%3C/g%3E%3C/svg%3E")',
          }} />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">
              {lang === 'th' ? 'พร้อมซื้อสินค้าราคาถูก?' : lang === 'en' ? 'Ready to Shop?' : '准备购物了吗？'}
            </h2>
            <p className="mb-8 text-base md:text-lg max-w-md mx-auto" style={{ color: 'oklch(1 0 0 / 0.85)' }}>
              {lang === 'th' ? 'สมัครสมาชิกฟรี แล้วเริ่มซื้อสินค้าราคาถูกได้เลยวันนี้' : lang === 'en' ? 'Register for free and start buying at the lowest prices today' : '免费注册，立即开始低价购物'}
            </p>
            <Link
              href="/auth?mode=register"
              className="inline-flex items-center gap-2 px-9 py-3.5 rounded-full text-base font-extrabold transition-transform hover:scale-105"
              style={{
                background: 'white',
                color: 'oklch(0.4 0.16 240)',
                boxShadow: '0 0 40px oklch(1 0 0 / 0.4)',
              }}
            >
              {t('auth.registerBtn', lang)}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
