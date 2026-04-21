# PayOTP — Agent Handoff Document
## สิ่งที่ Agent ทำเสร็จแล้ว + สิ่งที่ต้องทำต่อ

---

## ✅ เสร็จสมบูรณ์ทั้งหมด (Production Ready)

### Core Web App (Next.js 16 + TypeScript + Tailwind + SQLite)
- [x] Landing page with hero auto-sliding banner, service grid, product sections, features
- [x] 3-language support: Thai / English / Chinese (i18n system, 120+ keys)
- [x] Dark blue theme (OTP24HR style) — deep navy base, indigo primary, orange accent
- [x] Auth system: register, login, JWT tokens (env), httpOnly secure cookies
- [x] Product catalog with category filtering, real-time search, pagination (9/page)
- [x] Purchase system with auto-delivery from inventory
- [x] Wallet system with balance management
- [x] PromptPay QR generation (EMVCo standard)
- [x] TrueMoney Wallet link generation
- [x] Manual deposit + admin confirm flow
- [x] SMS auto-confirm webhook with API key security
- [x] GBPrimePay payment webhook
- [x] Order history with delivery data viewing
- [x] Referral/affiliate system (activated after first purchase)
- [x] Admin panel: products, deposits, inventory, orders, settings, stats, coupons
- [x] Bulk inventory import (textarea + CSV file upload)
- [x] Setup wizard script (`npm run setup`)
- [x] Database seeded with 9 categories + 10 demo products + coupon tables

### UX/UI Design (OTP24HR Style — Complete)
- [x] **Dark blue theme** — `#0b0d1a` base, `#6366f1` indigo primary, `#ff7843` orange accent
- [x] **Glass-effect navbar** — fixed, transparent + blur, neon login button
- [x] **Hero banner** — auto-sliding 3 slides with dot indicators, animated text
- [x] **Service icon grid** — 6 cards (OTP, Streaming, AI, Games, Cards, Social)
- [x] **Section headers** — title + subtitle + orange gradient divider line
- [x] **Product cards** — discount circle badge, hover zoom, image support
- [x] **Feature items** — left orange border accent, hover lift
- [x] **Payment badges** — 8 banks + TrueMoney grid
- [x] **CTA section** — purple gradient with pattern overlay
- [x] **Neon buttons** — glow shadow, rounded pill shape
- [x] **Footer** — dark theme with brand glow
- [x] **Mobile** — hamburger dropdown, 3-col service grid, 44px touch targets
- [x] **Toast system** — success/error/info/warning with auto-dismiss
- [x] **Dashboard redesign** — stat cards, modern layout (wallet/orders/affiliate)
- [x] **Skeleton loading** — shimmer animation
- [x] **Backward-compatible CSS** — all old class names aliased to new design

### Security (Complete)
- [x] Rate limiting — in-memory (auth: 10/15min, api: 60/min, deposit: 5/min, sms: 30/min)
- [x] Input validation — Zod schemas for ALL 29 API routes
- [x] JWT_SECRET — from env variable with random crypto fallback
- [x] Secure cookies in production (SameSite=Lax, Secure flag)
- [x] Admin products — whitelisted field updates only
- [x] SMS webhook — API key verification
- [x] Brute force protection on login/register

### Payment Integration (Complete)
- [x] PromptPay QR (EMVCo dynamic QR with unique amounts)
- [x] TrueMoney Wallet link generation
- [x] GBPrimePay webhook (`/api/webhook/gbprimepay`) — token verify, amount match, auto-confirm
- [x] Manual deposit + admin confirm flow

### SMS-Activate API (Complete)
- [x] `/api/otp/buy` — Buy phone numbers (supports Google, Facebook, Instagram, Twitter, Telegram, WhatsApp, VK, Discord)
- [x] `/api/otp/check` — Check SMS status, get verification codes
- [x] Cancel/refund support with balance restore

### SMS Listener (Complete)
- [x] `scripts/sms-listener.sh` — Termux script for Android (iQOO 12 5G)
- [x] Thai bank SMS patterns (Kasikorn, SCB, Krungthai, BBL, BAAC, TTB, UOB, CIMB, etc.)
- [x] Amount extraction from various bank SMS formats
- [x] Auto webhook posting with API key security

### Coupon System (Complete)
- [x] Database tables (coupons, coupon_uses) — percent + fixed discounts
- [x] Admin CRUD (`/api/admin/coupons`) — create, list, deactivate
- [x] Customer validation (`/api/coupon/validate`) — expiry, usage limits, min order

### Analytics (Complete)
- [x] Admin stats API (`/api/admin/stats`)
- [x] Revenue, orders, users, low stock alerts, top products, daily trends, referral stats

### Deployment (Complete)
- [x] PM2 config (`ecosystem.config.js`)
- [x] Nginx config (`deploy/nginx.conf`) — SSL, security headers, gzip, caching, proxy
- [x] Deploy script (`scripts/deploy.sh`) — one-command: Node.js + PM2 + Nginx + SSL
- [x] Backup script (`scripts/backup.sh`) — daily SQLite backup, 30-day retention

### Admin Settings (Complete)
- [x] Settings API (`/api/admin/settings`) — GET (masked) / PUT (whitelisted keys)
- [x] Configurable: site name, PromptPay number, TrueMoney, webhook keys, SMS-Activate API key, GBPrimePay

---

## 🔧 สิ่งที่ต้อง config เอง (ไม่ใช่ code)

```bash
# 1. ตั้ง JWT_SECRET
export JWT_SECRET="your-random-secret-here"

# 2. Deploy บน VPS
sudo ./scripts/deploy.sh

# 3. รัน setup wizard
npm run setup
# → สร้างแอดมิน + ใส่ PromptPay number

# 4. ใส่ API keys ผ่าน admin panel
# → /admin → Settings
# → sms_webhook_key (สำหรับ SMS listener)
# → sms_activate_api_key (สำหรับ OTP auto-sell)
# → gbprimepay_token (สำหรับรับเงิน auto)

# 5. ติดตั้ง Termux บน iQOO 12 5G
# → รัน scripts/sms-listener.sh
```

### Optional Enhancements (ยังไม่ได้ทำ)
- [ ] Admin settings page UI — API ready, ยังไม่มีหน้า UI
- [ ] Admin coupons page UI — API ready, ยังไม่มีหน้า UI
- [ ] OTP buy page UI — API ready, ยังไม่มีหน้า UI
- [ ] Admin analytics dashboard with Chart.js graphs
- [ ] LINE Notify / Telegram bot for order alerts
- [ ] Email verification on register
- [ ] Bulk pricing tiers
- [ ] API keys for customer integrations
- [ ] PostgreSQL migration (for scale)

---

## 🏗️ โครงสร้างโปรเจค

```
payotp/
├── data/payotp.db              ← SQLite (auto-created)
├── deploy/nginx.conf           ← Nginx SSL + proxy config
├── ecosystem.config.js         ← PM2 process manager
├── scripts/
│   ├── setup.js                ← Interactive setup wizard
│   ├── deploy.sh               ← One-command VPS deploy
│   ├── backup.sh               ← Daily DB backup
│   └── sms-listener.sh         ← Termux SMS listener
├── src/
│   ├── app/
│   │   ├── page.tsx            ← Homepage (OTP24HR style)
│   │   ├── globals.css         ← Design system + backward aliases
│   │   ├── layout.tsx          ← Root layout
│   │   ├── auth/page.tsx       ← Login/Register
│   │   ├── products/page.tsx   ← Product catalog (search + pagination + images)
│   │   ├── dashboard/          ← wallet / orders / affiliate
│   │   ├── admin/              ← products / deposits / inventory / orders
│   │   └── api/ (29 routes)    ← See table below
│   ├── components/
│   │   ├── AppContext.tsx       ← Global state (lang, theme, user)
│   │   ├── Toast.tsx           ← Toast notification system
│   │   ├── Navbar.tsx          ← Glass-effect fixed navbar
│   │   └── Footer.tsx          ← Dark theme footer
│   └── lib/
│       ├── db.ts               ← SQLite + seed data + coupon tables
│       ├── auth.ts             ← JWT (env), bcrypt, token generation
│       ├── i18n.ts             ← TH/EN/ZH translations (120+ keys)
│       ├── qr.ts               ← PromptPay EMVCo QR + TrueMoney
│       ├── rateLimit.ts        ← In-memory rate limiter
│       └── validate.ts         ← Zod validation schemas
```

## 📊 API Routes (29 total)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | Public (rate limited) | Register |
| POST | /api/auth/login | Public (rate limited) | Login |
| GET | /api/auth/me | Cookie | Current user |
| GET | /api/products | Public | Products + categories |
| POST | /api/orders | Cookie (rate limited) | Buy product |
| GET | /api/orders | Cookie | Orders (admin: all) |
| POST | /api/wallet/deposit | Cookie (rate limited) | Create deposit |
| POST | /api/wallet/confirm | Cookie | Confirm deposit |
| GET | /api/wallet/confirm | Cookie | Balance + deposits |
| GET | /api/affiliate | Cookie | Referral stats |
| POST | /api/coupon/validate | Cookie | Validate coupon |
| POST | /api/otp/buy | Cookie (rate limited) | Buy phone number |
| GET | /api/otp/check | Cookie | Check SMS |
| POST | /api/otp/check | Cookie | Cancel OTP |
| POST | /api/webhook/gbprimepay | Token | GBPrimePay callback |
| GET | /api/admin/products | Admin | List products |
| POST | /api/admin/products | Admin | Create product |
| PUT | /api/admin/products | Admin | Update product |
| DELETE | /api/admin/products | Admin | Soft delete |
| GET | /api/admin/deposits | Admin | List deposits |
| POST | /api/admin/deposits | Admin | Confirm/reject |
| GET | /api/admin/inventory | Admin | List inventory |
| POST | /api/admin/inventory | Admin | Add stock |
| POST | /api/admin/inventory/import | Admin | CSV import |
| POST | /api/admin/sms-confirm | API Key | SMS webhook |
| GET | /api/admin/stats | Admin | Analytics |
| GET | /api/admin/settings | Admin | Get settings |
| PUT | /api/admin/settings | Admin | Update settings |
| GET/POST/DELETE | /api/admin/coupons | Admin | Coupon CRUD |

## 🚀 Quick Start

```bash
cd payotp
npm install
npm run setup       # สร้างแอดมิน + ตั้งค่า
npm run dev         # http://localhost:3000
```

## 🚀 Deploy / Update

```bash
# ครั้งแรก
sudo ./scripts/deploy.sh

# อัพเดท (หลัง git push)
cd /var/www/payotp && git pull && npm install && npm run build && pm2 restart payotp
```
