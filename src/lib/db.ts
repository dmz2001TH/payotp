import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'payotp.db');

// Ensure data directory exists
import fs from 'fs';
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    balance REAL DEFAULT 0,
    role TEXT DEFAULT 'user',
    referral_code TEXT UNIQUE NOT NULL,
    referred_by TEXT,
    total_spent REAL DEFAULT 0,
    can_refer INTEGER DEFAULT 0,
    language TEXT DEFAULT 'th',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name_th TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_zh TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT '📦',
    sort_order INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    name_th TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_zh TEXT NOT NULL,
    description_th TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    description_zh TEXT DEFAULT '',
    price REAL NOT NULL,
    original_price REAL,
    image_url TEXT DEFAULT '',
    stock INTEGER DEFAULT 0,
    type TEXT DEFAULT 'account',
    auto_delivery INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    account_data TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    sold_to TEXT,
    sold_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (sold_to) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'completed',
    delivered_data TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS deposits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    method TEXT NOT NULL,
    reference_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    qr_data TEXT,
    confirmed_by TEXT,
    confirmed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    referrer_id TEXT NOT NULL,
    referred_id TEXT NOT NULL,
    commission_rate REAL DEFAULT 0.05,
    total_earned REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (referrer_id) REFERENCES users(id),
    FOREIGN KEY (referred_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS referral_transactions (
    id TEXT PRIMARY KEY,
    referral_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    commission REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (referral_id) REFERENCES referrals(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT DEFAULT 'percent',
    discount_value REAL NOT NULL,
    min_order REAL DEFAULT 0,
    max_uses INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    expires_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS coupon_uses (
    id TEXT PRIMARY KEY,
    coupon_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    order_id TEXT,
    discount REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed default categories
const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number };
if (catCount.c === 0) {
  const insertCat = db.prepare('INSERT INTO categories (id, name_th, name_en, name_zh, slug, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const categories = [
    ['cat-otp', 'OTP เบอร์โทร', 'Phone OTP', '电话验证码', 'otp', '📱', 1],
    ['cat-premium', 'แอคเคาท์พรีเมียม', 'Premium Accounts', '高级账号', 'premium', '⭐', 2],
    ['cat-ai', 'แอคเคาท์ AI', 'AI Accounts', 'AI账号', 'ai', '🤖', 3],
    ['cat-games', 'เติมเกม', 'Game Top-up', '游戏充值', 'games', '🎮', 4],
    ['cat-cards', 'บัตรเติมเงิน', 'Gift Cards', '礼品卡', 'cards', '💳', 5],
    ['cat-mobile', 'เติมเงินมือถือ', 'Mobile Top-up', '手机充值', 'mobile', '📞', 6],
    ['cat-social', 'ปั๊มฟอล/ไลค์', 'Social Boost', '涨粉涨赞', 'social', '📈', 7],
    ['cat-gmail', 'เช่า Gmail', 'Gmail Rental', 'Gmail租赁', 'gmail', '📧', 8],
    ['cat-downloads', 'ดาวน์โหลดไฟล์', 'File Downloads', '文件下载', 'downloads', '📥', 9],
  ];
  for (const c of categories) {
    insertCat.run(...c);
  }
}

// Demo products removed — add products via Admin > Products
// This ensures the store starts clean with only real products

// Seed default settings
const settingsCount = db.prepare('SELECT COUNT(*) as c FROM settings').get() as { c: number };
if (settingsCount.c === 0) {
  const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('site_name', 'PayOTP');
  insertSetting.run('site_slogan_th', 'ถูกที่สุด ส่งทันที 24 ชม.');
  insertSetting.run('site_slogan_en', 'Cheapest & Instant 24/7');
  insertSetting.run('site_slogan_zh', '最便宜 即时送达 24小时');
  insertSetting.run('promptpay_number', '');
  insertSetting.run('promptpay_name', '');
  insertSetting.run('truewallet_number', '');
  insertSetting.run('min_deposit', '50');
  insertSetting.run('referral_commission', '5');
  insertSetting.run('otp_api_provider', 'sms-activate');
  insertSetting.run('otp_api_key', '');
  insertSetting.run('sms_webhook_key', '');
  insertSetting.run('gbprimepay_token', '');
  insertSetting.run('gbprimepay_api_key', '');
  insertSetting.run('sms_activate_api_key', '');
}

export default db;
