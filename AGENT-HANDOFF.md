# PayOTP — Agent Handoff Document
## สำหรับ Agent ตัวต่อไป — อ่านไฟล์นี้ก่อนเริ่มทำงาน

---

## ⚡ Quick Context
- **Repo**: https://github.com/dmz2001TH/payotp
- **Stack**: Next.js 16 + TypeScript + Tailwind CSS + SQLite (better-sqlite3)
- **Run**: `npm install` → `npm run dev` (localhost:3000)
- **Admin**: username `peach` / password ดูจาก `scripts/setup.js`
- **3 ภาษา**: Thai / English / Chinese
- **Theme**: Dark blue (`#0b0d1a`) + Indigo primary + Orange accent

---

## ✅ Backend & Logic — เสร็จ 100% ทั้งหมด

**ทุกอย่างที่เป็น logic/API/database เสร็จหมดแล้ว อย่าแก้ backend ถ้าไม่จำเป็น**

### Auth System
- Register/Login with JWT (httpOnly cookies)
- Password hashing (bcrypt)
- Rate limiting on auth endpoints
- Zod input validation on all APIs

### Product System
- 29 API routes (ดูตารางข้างล่าง)
- Product catalog with categories, search, pagination
- Purchase with auto-delivery from inventory
- Image URL support per product

### Wallet & Payments
- PromptPay QR (EMVCo standard, dynamic amounts)
- TrueMoney Wallet links
- Manual deposit + admin confirm
- GBPrimePay webhook (`/api/webhook/gbprimepay`)
- SMS auto-confirm webhook (with API key)

### Admin Panel APIs
- Products CRUD, Deposits (confirm/reject), Inventory (add/import CSV)
- Settings (PromptPay, API keys), Stats, Coupons

### SMS-Activate (OTP Auto-Sell)
- `/api/otp/buy` — Buy phone numbers
- `/api/otp/check` — Check SMS status

### Security
- Rate limiting (auth/api/deposit/sms/purchase)
- Zod validation on all routes
- JWT_SECRET from env variable
- Admin field whitelisting

### Deployment Scripts
- `scripts/deploy.sh` — One-command VPS deploy
- `scripts/backup.sh` — Daily SQLite backup
- `scripts/sms-listener.sh` — Termux SMS listener
- `ecosystem.config.js` — PM2 config
- `deploy/nginx.conf` — Nginx SSL config

### Database Schema (SQLite)
Tables: `users`, `categories`, `products`, `inventory`, `orders`, `deposits`, `referrals`, `referral_transactions`, `settings`, `coupons`, `coupon_uses`
- Seed: 9 categories + 10 demo products auto-created on first run

---

## ❌ สิ่งที่ยังไม่เสร็จ = UI/หน้าตาเว็บเท่านั้น

### 🔴 ต้องทำด่วน: เปลี่ยน UI ทั้งหมด
**เจ้าของบอกว่า UI ปัจจุบันดูไม่ดี จะใช้ Lovable สร้าง UI ใหม่**
**Agent ตัวต่อไป: เอา code จาก Lovable มาใส่แทน UI เดิม แต่ต้องเชื่อมกับ backend ที่มีอยู่**

สิ่งที่ต้องทำ:
1. **ได้ code จาก Lovable** (หน้าตาใหม่)
2. **แยกส่วน UI กับ Logic** — Lovable ให้มาเฉพาะ frontend
3. **เชื่อม Lovable UI กับ API ที่มีอยู่** — เปลี่ยน fetch calls ให้เรียก `/api/*` routes
4. **คง 3 ภาษา** (i18n system อยู่ที่ `src/lib/i18n.ts`)
5. **คง dark/light theme** (AppContext จัดการอยู่)
6. **คง Toast system** (`src/components/Toast.tsx`)

### หน้าที่ต้องมี (อย่าลบออก):
| หน้า | Path | หมายเหตุ |
|------|------|-----------|
| หน้าแรก | `/` | Hero, categories, popular products |
| สินค้า | `/products` | Filter, search, pagination, buy |
| สมัคร/ล็อกอิน | `/auth` | Login + Register toggle |
| Dashboard - กระเป๋าเงิน | `/dashboard/wallet` | Deposit, QR, history |
| Dashboard - คำสั่งซื้อ | `/dashboard/orders` | Order history + view data |
| Dashboard - แนะนำเพื่อน | `/dashboard/affiliate` | Referral code, link, stats |
| Admin - แดชบอร์ด | `/admin` | Stats + quick links |
| Admin - สินค้า | `/admin/products` | Add/edit/delete products |
| Admin - เติมเงิน | `/admin/deposits` | Confirm/reject deposits |
| Admin - สต็อก | `/admin/inventory` | Add stock + CSV import |
| Admin - คำสั่งซื้อ | `/admin/orders` | View all orders |

### API Routes (29 routes — อย่าแก้ ยกเว้นจำเป็น):
```
POST   /api/auth/register        - สมัครสมาชิก
POST   /api/auth/login           - เข้าสู่ระบบ
GET    /api/auth/me              - เช็ค user ปัจจุบัน
GET    /api/products             - รายการสินค้า + หมวดหมู่
POST   /api/orders               - ซื้อสินค้า
GET    /api/orders               - ประวัติคำสั่งซื้อ (admin: ทั้งหมด)
POST   /api/wallet/deposit       - สร้างรายการเติมเงิน
POST   /api/wallet/confirm       - ยืนยันเติมเงิน
GET    /api/wallet/confirm       - ยอดเงิน + ประวัติเติมเงิน
GET    /api/affiliate            - ข้อมูลแนะนำเพื่อน
POST   /api/coupon/validate      - ตรวจสอบคูปอง
POST   /api/otp/buy              - ซื้อเบอร์ OTP
GET    /api/otp/check            - เช็ค SMS
POST   /api/otp/check            - ยกเลิก OTP
POST   /api/webhook/gbprimepay   - GBPrimePay callback
GET    /api/admin/products       - รายการสินค้า (แอดมิน)
POST   /api/admin/products       - เพิ่มสินค้า
PUT    /api/admin/products       - แก้ไขสินค้า
DELETE /api/admin/products       - ลบสินค้า
GET    /api/admin/deposits       - รายการเติมเงิน
POST   /api/admin/deposits       - อนุมัติ/ปฏิเสธ
GET    /api/admin/inventory      - ดูสต็อก
POST   /api/admin/inventory      - เพิ่มสต็อก
POST   /api/admin/inventory/import - นำเข้า CSV
POST   /api/admin/sms-confirm    - SMS webhook
GET    /api/admin/stats          - สถิติ
GET    /api/admin/settings       - ตั้งค่า
PUT    /api/admin/settings       - บันทึกตั้งค่า
GET/POST/DELETE /api/admin/coupons - คูปอง
```

### Components ที่ต้องคงไว้:
- `src/components/AppContext.tsx` — Global state (lang, theme, user, fetchUser)
- `src/components/Toast.tsx` — Toast notification (useToast hook)
- `src/lib/i18n.ts` — Translations (t() function, Lang type)
- `src/lib/db.ts` — Database connection + schema
- `src/lib/auth.ts` — JWT + password hashing
- `src/lib/qr.ts` — PromptPay QR generation
- `src/lib/rateLimit.ts` — Rate limiter
- `src/lib/validate.ts` — Zod schemas

---

## 🔧 Config ที่ต้องตั้งเอง
```bash
# 1. Environment
export JWT_SECRET="random-string-here"

# 2. รัน setup wizard
npm run setup
# → สร้างแอดมิน + ใส่ PromptPay number

# 3. API keys (ผ่าน admin panel หรือ database)
# sms_webhook_key — สำหรับ SMS listener
# sms_activate_api_key — สำหรับ OTP auto-sell
# gbprimepay_token — สำหรับรับเงิน auto

# 4. Deploy (Linux VPS เท่านั้น)
sudo ./scripts/deploy.sh
```

---

## 📁 โครงสร้างสำคัญ
```
payotp/
├── src/app/           ← หน้าเว็บ (UI ที่ต้องเปลี่ยน)
│   ├── page.tsx       ← หน้าแรก
│   ├── globals.css    ← CSS theme
│   ├── layout.tsx     ← Root layout
│   ├── auth/          ← สมัคร/ล็อกอิน
│   ├── products/      ← สินค้า
│   ├── dashboard/     ← wallet/orders/affiliate
│   └── admin/         ← แอดมิน panel
├── src/components/    ← Components (AppContext, Toast, Navbar, Footer)
├── src/lib/           ← Core logic (db, auth, i18n, qr, validate, rateLimit)
└── src/app/api/       ← 29 API routes (อย่าแก้)
```
