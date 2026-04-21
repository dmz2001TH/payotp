'use client';
import Link from 'next/link';
import { useApp } from '@/components/AppContext';
import { t, type Lang } from '@/lib/i18n';
import { useEffect, useState } from 'react';

const slogans: Record<Lang, string> = {
  th: 'ถูกที่สุด ส่งทันที 24 ชม.',
  en: 'Cheapest & Instant Delivery 24/7',
  zh: '最便宜 即时送达 全天候',
};

const heroTitles: Record<Lang, string> = {
  th: 'OTP • แอคเคาท์พรีเมียม • AI Tools • เติมเกม',
  en: 'OTP • Premium Accounts • AI Tools • Game Top-up',
  zh: 'OTP • 高级账号 • AI工具 • 游戏充值',
};

const features = [
  { icon: '📱', key: 'otp', th: 'OTP เบอร์โทร', en: 'Phone OTP', zh: '电话验证码', desc_th: 'เบอร์จีนราคาถูก เริ่มต้น ฿1', desc_en: 'Chinese numbers starting at ฿1', desc_zh: '中国号码低至฿1' },
  { icon: '⭐', key: 'premium', th: 'แอคเคาท์พรีเมียม', en: 'Premium Accounts', zh: '高级账号', desc_th: 'Netflix, YouTube, Disney+ ราคาส่ง', desc_en: 'Netflix, YouTube, Disney+ wholesale price', desc_zh: 'Netflix, YouTube, Disney+ 批发价' },
  { icon: '🤖', key: 'ai', th: 'แอคเคาท์ AI', en: 'AI Accounts', zh: 'AI账号', desc_th: 'ChatGPT, Claude, Gemini ราคาถูก', desc_en: 'ChatGPT, Claude, Gemini cheap', desc_zh: 'ChatGPT, Claude, Gemini 低价' },
  { icon: '🎮', key: 'games', th: 'เติมเกม', en: 'Game Top-up', zh: '游戏充值', desc_th: 'ROV, FreeFire, PUBG ราคาพิเศษ', desc_en: 'ROV, FreeFire, PUBG special price', desc_zh: 'ROV, FreeFire, PUBG 特价' },
  { icon: '💳', key: 'cards', th: 'บัตรเติมเงิน', en: 'Gift Cards', zh: '礼品卡', desc_th: 'AIS, DTAC, TRUE, Garena', desc_en: 'AIS, DTAC, TRUE, Garena', desc_zh: 'AIS, DTAC, TRUE, Garena' },
  { icon: '📈', key: 'social', th: 'ปั๊มฟอล/ไลค์', en: 'Social Boost', zh: '涨粉涨赞', desc_th: 'Facebook, Instagram, TikTok', desc_en: 'Facebook, Instagram, TikTok', desc_zh: 'Facebook, Instagram, TikTok' },
];

export default function HomePage() {
  const { lang } = useApp();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(data => {
      setCategories(data.categories || []);
      setProducts(data.products?.slice(0, 6) || []);
    }).catch(() => {});
  }, []);

  const getName = (item: any) => item[`name_${lang}`] || item.name_th;
  const getDesc = (item: any) => item[`description_${lang}`] || item.description_th || '';

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {heroTitles[lang]}
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8">
            {slogans[lang]}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products" className="bg-white text-[var(--accent)] font-bold px-8 py-3 rounded-lg hover:shadow-lg transition-all hover:scale-105">
              {t('hero.cta', lang)}
            </Link>
            <Link href="/auth?mode=register" className="border-2 border-white text-white font-bold px-8 py-3 rounded-lg hover:bg-white/10 transition-all">
              {t('nav.register', lang)}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          {lang === 'th' ? 'บริการของเรา' : lang === 'en' ? 'Our Services' : '我们的服务'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="card p-6 text-center hover:border-[var(--accent)] transition-all"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <h3 className="font-semibold text-sm">{getName(cat)}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          {lang === 'th' ? 'ทำไมต้อง PayOTP?' : lang === 'en' ? 'Why PayOTP?' : '为什么选择 PayOTP？'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.key} className="card p-6">
              <div className="feature-icon mb-4">{f.icon}</div>
              <h3 className="font-bold mb-2">{f[lang === 'th' ? 'th' : lang === 'en' ? 'en' : 'zh']}</h3>
              <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
                {f[`desc_${lang}` as keyof typeof f]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Products */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              {lang === 'th' ? '🔥 สินค้ายอดนิยม' : lang === 'en' ? '🔥 Popular Products' : '🔥 热门商品'}
            </h2>
            <Link href="/products" className="text-[var(--accent)] font-medium text-sm hover:underline">
              {lang === 'th' ? 'ดูทั้งหมด →' : lang === 'en' ? 'View All →' : '查看全部 →'}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p: any) => (
              <Link key={p.id} href="/products" className="card p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="badge badge-blue">{p.category_icon} {p.category_slug}</span>
                  {p.stock > 0 ? (
                    <span className="badge badge-green">✓ {t('product.stock', lang)} {p.stock}</span>
                  ) : (
                    <span className="badge badge-red">{t('product.outOfStock', lang)}</span>
                  )}
                </div>
                <h3 className="font-bold mb-1">{getName(p)}</h3>
                <p className="text-xs mb-3" style={{color: 'var(--text-muted)'}}>{getDesc(p)}</p>
                <div className="flex items-center gap-2">
                  <span className="price-tag">฿{p.price}</span>
                  {p.original_price && (
                    <span className="price-original">฿{p.original_price}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="card p-10 text-center gradient-bg text-white rounded-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {lang === 'th' ? 'เริ่มซื้อสินค้าราคาถูกวันนี้!' : lang === 'en' ? 'Start Shopping Today!' : '今天就开始购物吧！'}
          </h2>
          <p className="opacity-90 mb-6">
            {lang === 'th' ? 'สมัครสมาชิกฟรี รับส่วนลดพิเศษมากมาย' : lang === 'en' ? 'Free registration with exclusive discounts' : '免费注册享受独家折扣'}
          </p>
          <Link href="/auth?mode=register" className="inline-block bg-white text-[var(--accent)] font-bold px-8 py-3 rounded-lg hover:shadow-lg transition-all">
            {t('auth.registerBtn', lang)}
          </Link>
        </div>
      </section>
    </div>
  );
}
