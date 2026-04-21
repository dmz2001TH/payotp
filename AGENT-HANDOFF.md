# PayOTP — Agent Handoff Document
## สิ่งที่ Agent ทำเสร็จแล้ว + สิ่งที่ต้องทำต่อ

---

## ✅ เสร็จสมบูรณ์ทั้งหมด (Core Features Ready)

### Core Web App (Next.js 16 + TypeScript + Tailwind + SQLite)
- [x] Landing page with hero, categories, features, popular products
- [x] 3-language support: Thai / English / Chinese (i18n system)
- [x] Dark/light theme toggle (persisted in localStorage)
- [x] Auth system: register, login, JWT tokens, httpOnly cookies
- [x] Product catalog with category filtering, search, pagination
- [x] Purchase system with auto-delivery from inventory
- [x] Wallet system with balance management
- [x] PromptPay QR generation (EMVCo standard)
- [x] TrueMoney Wallet link generation
- [x] Manual deposit confirmation flow
- [x] SMS auto-confirm webhook with API key security
- [x] Order history with delivery data viewing
- [x] Referral/affiliate system (activated after first purchase)
- [x] Admin panel: products, deposits, inventory, orders, settings, stats
- [x] Bulk inventory import (1 line = 1 stock item + CSV file upload)
- [x] Setup wizard script (`npm run setup`)
- [x] Database seeded with 9 categories + 10 demo products

### UX/UI (All Complete)
- [x] Design system — CSS tokens, shadows, transitions, radius
- [x] Polished components — Cards, buttons, inputs, badges, modals
- [x] Toast notification system — React component with auto-dismiss
- [x] Skeleton loading styles
- [x] Glass effect / backdrop blur
- [x] Dashboard pages redesign (wallet/orders/affiliate) — stat cards, modern layout
- [x] Product search bar with real-time filtering
- [x] Pagination (9 items/page) for products
- [x] Product image support — admin form, product cards, homepage
- [x] Mobile responsive — touch targets, safe area, small phone support
- [x] Auth page — password toggle, referral from URL, toast

### Security (All Complete)
- [x] Rate limiting — in-memory (auth/api/deposit/sms/purchase)
- [x] Input validation — Zod schemas for all API routes
- [x] JWT_SECRET — from env variable with random fallback
- [x] Secure cookies in production (SameSite=Lax, Secure flag)
- [x] Admin products — whitelisted field updates only
- [x] SMS webhook — API key verification
- [x] Brute force protection on login/register

### Payment Integration
- [x] PromptPay QR (EMVCo dynamic QR)
- [x] TrueMoney Wallet link
- [x] GBPrimePay webhook endpoint (`/api/webhook/gbprimepay`)
- [x] Manual deposit + admin confirm flow
- [x] SMS auto-confirm webhook

### SMS-Activate API (OTP Auto-Sell)
- [x] `/api/otp/buy` — Buy phone numbers
- [x] `/api/otp/check` — Check SMS status, get codes
- [x] Cancel/refund support
- [x] Service list with balance check

### SMS Listener (iQOO 12 5G)
- [x] `scripts/sms-listener.sh` — Termux script
- [x] Thai bank SMS patterns (Kasikorn, SCB, Krungthai, BBL, etc.)
- [x] Amount extraction from various bank formats
- [x] Auto webhook posting with API key

### Coupon System
- [x] Database tables (coupons, coupon_uses)
- [x] Admin CRUD (`/api/admin/coupons`)
- [x] Customer validation (`/api/coupon/validate`)
- [x] Percent + fixed amount discounts
- [x] Usage limits, expiry, min order

### Analytics & Monitoring
- [x] Admin stats API (`/api/admin/stats`)
- [x] Revenue, orders, users, low stock, top products
- [x] Daily trends (last 7 days)

### Deployment
- [x] PM2 config (`ecosystem.config.js`)
- [x] Nginx config (`deploy/nginx.conf`) — SSL, security headers, caching
- [x] Deploy script (`scripts/deploy.sh`) — one-command setup
- [x] Backup script (`scripts/backup.sh`) — daily SQLite backup

### Inventory
- [x] Bulk import (textarea, 1 line = 1 item)
- [x] CSV file upload import (`/api/admin/inventory/import`)
- [x] Low stock detection in admin stats

### Admin Settings
- [x] Settings API (`/api/admin/settings`) — GET/PUT
- [x] Configurable: PromptPay, TrueMoney, webhook keys, API keys
- [x] Sensitive values masked in GET

---

## 🔧 สิ่งที่ต้องทำต่อ (ต้อง config ภายนอก)

### ต้องตั้งค่าเอง (ไม่ใช่ code)
- [ ] ตั้ง `JWT_SECRET` ใน environment variable
- [ ] ใส่ PromptPay number ผ่าน admin settings หรือ setup wizard
- [ ] สมัคร SMS-Activate → ใส่ API key
- [ ] สมัคร GBPrimePay → ใส่ token
- [ ] ตั้ง `sms_webhook_key` สำหรับ SMS listener
- [ ] ติดตั้ง Termux บน iQOO 12 5G แล้วรัน `scripts/sms-listener.sh`
- [ ] Deploy บน VPS ด้วย `scripts/deploy.sh`

### Optional Enhancements
- [ ] Admin dashboard UI with charts (Chart.js) — API ready, UI ยังไม่ได้ทำ
- [ ] Coupon management admin page — API ready, UI ยังไม่ได้ทำ
- [ ] Admin settings page — API ready, UI ยังไม่ได้ทำ
- [ ] OTP buy page UI — API ready, UI ยังไม่ได้ทำ
- [ ] LINE Notify / Telegram bot for order alerts
- [ ] Email verification
- [ ] Bulk pricing tiers
- [ ] API keys for customer integrations
- [ ] PostgreSQL migration (for scale)

---

## 🏗️ โครงสร้างโปรเจค

```
payotp/
├── data/payotp.db          ← SQLite database (auto-created)
├── deploy/
│   └── nginx.conf          ← Nginx config template
├── ecosystem.config.js     ← PM2 config
├── scripts/
│   ├── setup.js            ← Setup wizard
│   ├── deploy.sh           ← One-command VPS deploy
│   ├── backup.sh           ← Daily DB backup
│   └── sms-listener.sh     ← Termux SMS listener
├── src/
│   ├── app/
│   │   ├── page.tsx        ← Landing page
│   │   ├── auth/page.tsx   ← Login/Register
│   │   ├── products/page.tsx ← Product catalog (search + pagination + images)
│   │   ├── dashboard/      ← User dashboard (wallet/orders/affiliate)
│   │   ├── admin/          ← Admin panel
│   │   └── api/
│   │       ├── auth/       ← register, login, me
│   │       ├── products/   ← product listing
│   │       ├── orders/     ← purchase + history
│   │       ├── wallet/     ← deposit + confirm
│   │       ├── affiliate/  ← referral system
│   │       ├── coupon/     ← validate
│   │       ├── otp/        ← buy + check (SMS-Activate)
│   │       ├── webhook/    ← gbprimepay
│   │       └── admin/      ← products, deposits, inventory, inventory/import,
│   │                        sms-confirm, stats, settings, coupons
│   ├── components/
│   │   ├── AppContext.tsx   ← Global state (lang, theme, user)
│   │   ├── Toast.tsx       ← Toast notification system
│   │   ├── Navbar.tsx      ← Navigation bar
│   │   └── Footer.tsx      ← Footer
│   └── lib/
│       ├── db.ts           ← Database + seed data + coupon tables
│       ├── auth.ts         ← JWT (env), password hashing
│       ├── i18n.ts         ← Translations (TH/EN/ZH, 120+ keys)
│       ├── qr.ts           ← PromptPay QR generation
│       ├── rateLimit.ts    ← In-memory rate limiter
│       └── validate.ts     ← Zod schemas for all APIs
```

## 📊 API Routes (29 total)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | Public | Register (rate limited) |
| POST | /api/auth/login | Public | Login (rate limited) |
| GET | /api/auth/me | Cookie | Current user |
| GET | /api/products | Public | List products + categories |
| POST | /api/orders | Cookie | Buy product |
| GET | /api/orders | Cookie | Order history (admin: all) |
| POST | /api/wallet/deposit | Cookie | Create deposit (rate limited) |
| POST | /api/wallet/confirm | Cookie | Confirm deposit |
| GET | /api/wallet/confirm | Cookie | Balance + deposit history |
| GET | /api/affiliate | Cookie | Referral stats |
| POST | /api/coupon/validate | Cookie | Validate coupon code |
| POST | /api/otp/buy | Cookie | Buy phone number (SMS-Activate) |
| GET | /api/otp/check | Cookie | Check SMS status |
| POST | /api/otp/check | Cookie | Cancel OTP order |
| POST | /api/webhook/gbprimepay | Token | GBPrimePay callback |
| GET | /api/admin/products | Admin | List all products |
| POST | /api/admin/products | Admin | Create product |
| PUT | /api/admin/products | Admin | Update product |
| DELETE | /api/admin/products | Admin | Soft delete product |
| GET | /api/admin/deposits | Admin | List deposits |
| POST | /api/admin/deposits | Admin | Confirm/reject deposit |
| GET | /api/admin/inventory | Admin | List inventory |
| POST | /api/admin/inventory | Admin | Add stock |
| POST | /api/admin/inventory/import | Admin | CSV import |
| POST | /api/admin/sms-confirm | API Key | SMS webhook |
| GET | /api/admin/stats | Admin | Analytics dashboard |
| GET | /api/admin/settings | Admin | Get settings |
| PUT | /api/admin/settings | Admin | Update settings |
| GET | /api/admin/coupons | Admin | List coupons |
| POST | /api/admin/coupons | Admin | Create coupon |
| DELETE | /api/admin/coupons | Admin | Deactivate coupon |

---

## 🚀 Quick Start

```bash
cd payotp
npm install
npm run setup       # สร้างแอดมิน + ตั้งค่า
npm run dev         # รันที่ localhost:3000
```

## 🚀 Deploy to VPS

```bash
# On fresh VPS (Ubuntu/Debian):
git clone https://github.com/dmz2001TH/payotp.git /var/www/payotp
cd /var/www/payotp
chmod +x scripts/*.sh
sudo ./scripts/deploy.sh
```
