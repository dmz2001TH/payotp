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

// Seed some demo products
const prodCount = db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number };
if (prodCount.c === 0) {
  const insertProd = db.prepare('INSERT INTO products (id, category_id, name_th, name_en, name_zh, description_th, description_en, description_zh, price, original_price, stock, type, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const products = [
    ['prod-otp-google', 'cat-otp', 'OTP Google/Gmail', 'OTP Google/Gmail', 'Google/Gmail 验证码', 'เบอร์โทรสำหรับรับ SMS ยืนยัน Google', 'Phone number for Google SMS verification', '用于Google短信验证的手机号', 5, 10, 50, 'otp', 1],
    ['prod-otp-facebook', 'cat-otp', 'OTP Facebook', 'OTP Facebook', 'Facebook 验证码', 'เบอร์โทรสำหรับรับ SMS ยืนยัน Facebook', 'Phone number for Facebook SMS verification', '用于Facebook短信验证的手机号', 8, 15, 30, 'otp', 2],
    ['prod-otp-instagram', 'cat-otp', 'OTP Instagram', 'OTP Instagram', 'Instagram 验证码', 'เบอร์โทรสำหรับรับ SMS ยืนยัน Instagram', 'Phone number for Instagram SMS verification', '用于Instagram短信验证的手机号', 10, 20, 25, 'otp', 3],
    ['prod-netflix-week', 'cat-premium', 'Netflix รายสัปดาห์', 'Netflix Weekly', 'Netflix 周会员', 'แอคเคาท์ Netflix ใช้ได้ 7 วัน', 'Netflix account valid for 7 days', 'Netflix账号可用7天', 49, 99, 100, 'account', 1],
    ['prod-youtube-month', 'cat-premium', 'YouTube Premium รายเดือน', 'YouTube Premium Monthly', 'YouTube Premium 月会员', 'YouTube Premium รายเดือน', 'YouTube Premium monthly', 'YouTube Premium 月度会员', 59, 159, 80, 'account', 2],
    ['prod-chatgpt', 'cat-ai', 'ChatGPT Plus รายเดือน', 'ChatGPT Plus Monthly', 'ChatGPT Plus 月会员', 'ChatGPT Plus ใช้ GPT-4', 'ChatGPT Plus with GPT-4 access', 'ChatGPT Plus 使用GPT-4', 199, 690, 20, 'account', 1],
    ['prod-claude', 'cat-ai', 'Claude Pro รายเดือน', 'Claude Pro Monthly', 'Claude Pro 月会员', 'Claude Pro รายเดือน', 'Claude Pro monthly subscription', 'Claude Pro 月度订阅', 179, 600, 15, 'account', 2],
    ['prod-rov-100', 'cat-games', 'ROV 100 เพชร', 'ROV 100 Diamonds', 'ROV 100钻石', 'เติมเพชร ROV 100 เม็ด', 'Top up 100 ROV diamonds', '充值ROV 100钻石', 30, 35, 999, 'game', 1],
    ['prod-ff-310', 'cat-games', 'FreeFire 310 เพชร', 'FreeFire 310 Diamonds', 'FreeFire 310钻石', 'เติมเพชร FreeFire 310 เม็ด', 'Top up 310 FreeFire diamonds', '充值FreeFire 310钻石', 89, 100, 999, 'game', 2],
    ['prod-ais-50', 'cat-mobile', 'เติมเงิน AIS 50 บาท', 'AIS Top-up 50 THB', 'AIS充值50泰铢', 'เติมเงินมือถือ AIS 50 บาท', 'AIS mobile top-up 50 THB', 'AIS手机充值50泰铢', 48, 50, 999, 'mobile', 1],
  ];
  for (const p of products) {
    insertProd.run(...p);
  }
}

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
}

export default db;
