# PayOTP — Agent Handoff Document
## สิ่งที่ Agent ตัวก่อนทำเสร็จแล้ว + สิ่งที่ต้องทำต่อ

---

## ✅ เสร็จสมบูรณ์ (Ready to Use)

### Core Web App (Next.js + TypeScript + Tailwind + SQLite)
- [x] Landing page with hero, categories, features, popular products
- [x] 3-language support: Thai / English / Chinese (i18n system)
- [x] Dark/light theme toggle (persisted in localStorage)
- [x] Auth system: register, login, JWT tokens, httpOnly cookies
- [x] Product catalog with category filtering
- [x] Purchase system with auto-delivery from inventory
- [x] Wallet system with balance management
- [x] PromptPay QR generation (EMVCo standard)
- [x] TrueMoney Wallet link generation
- [x] Manual deposit confirmation flow (customer confirms → admin confirms)
- [x] SMS auto-confirm webhook endpoint (`/api/admin/sms-confirm`)
- [x] Order history with delivery data viewing
- [x] Referral/affiliate system (activated after first purchase)
- [x] Admin panel: products, deposits, inventory, orders
- [x] Bulk inventory import (1 line = 1 stock item)
- [x] Setup wizard script (`npm run setup`)
- [x] Database seeded with 9 categories + 10 demo products
- [x] Pushed to GitHub: https://github.com/dmz2001TH/payotp

### Admin Account (configured)
- Username: `peach`
- Email: `photsathon.spd1@gmail.com`
- PromptPay: `0641546355`

### Documentation
- [x] `SETUP.md` — Full setup guide (Thai)
- [x] `SMS-LISTENER-SETUP.md` — SMS listener guide for iQOO 12 5G
- [x] `scripts/setup.js` — Interactive setup wizard

---

## 🔧 TODO — สิ่งที่ต้องทำต่อ

### Priority 1: ปรับปรุง UX/UI
- [ ] **Mobile responsive** — บางหน้ายังไม่สวยบนมือถือ
- [ ] **Loading states** — เพิ่ม skeleton loading ระหว่าง fetch
- [ ] **Toast notifications** — แทนที่ alert/error text (ใช้ react-hot-hot หรือ sonner)
- [ ] **Image support** — เพิ่มฟิลด์ image_url ใน products + upload UI
- [ ] **Product search** — เพิ่ม search bar ในหน้า products
- [ ] **Pagination** — สำหรับ orders, deposits, inventory lists

### Priority 2: SMS Auto-Confirm (บน iQOO 12 5G)
- [ ] **ติดตั้ง Termux** บนมือถือ + สร้าง SMS Listener script
- [ ] **ทดสอบ SMS flow**: โอนเงิน → SMS → webhook → auto confirm
- [ ] **SMS patterns tuning**: BANK_PATTERNS อาจต้องปรับให้ตรงกับข้อความธนาคารไทยจริง
- [ ] **Security**: เพิ่ม API key สำหรับ SMS webhook (กันคนอื่นเรียก)

### Priority 3: Payment Integration
- [ ] **GBPrimePay API** — Auto payment detection (แทน manual)
  - สมัคร: https://gbprimepay.com
  - เพิ่ม webhook endpoint สำหรับ callback
- [ ] **PromptPay Dynamic QR** — 生成 QR ด้วย amount ที่ server กำหนด (ตอนนี้สร้าง static QR ได้แล้ว)

### Priority 4: SMS-Activate API Integration (OTP Auto-Sell)
- [ ] สมัคร https://sms-activate.org
- [ ] เติมเงิน + รับ API key
- [ ] เพิ่ม API route `/api/otp/buy` — ซื้อเบอร์จาก SMS-Activate → ส่งให้ลูกค้า
- [ ] เพิ่ม API route `/api/otp/check` — เช็ค SMS ที่ได้รับ
- [ ] UI: หน้าซื้อ OTP เลือกประเทศ + บริการ

### Priority 5: Inventory Automation
- [ ] **Auto inventory from Taobao/1688** — scraper หรือ API sync
- [ ] **Low stock alerts** — แจ้งเตือนเมื่อ stock ต่ำ
- [ ] **Inventory import from CSV** — อัพโหลดไฟล์ .csv

### Priority 6: Security Hardening
- [ ] **Rate limiting** — ป้องกัน brute force (ใช้ @upstash/ratelimit หรือ middleware)
- [ ] **CSRF protection** — เพิ่ม SameSite=Strict + CSRF tokens
- [ ] **Input validation** — ใช้ zod สำหรับ request validation
- [ ] **JWT_SECRET** — เปลี่ยนจาก default เป็น random string
- [ ] **Admin 2FA** — เพิ่ม TOTP สำหรับแอดมิน

### Priority 7: Deployment
- [ ] **VPS setup** — Deploy บน VPS ไทย (Vultr Singapore หรือ AWS)
- [ ] **PM2** — รัน Node.js เป็น daemon
- [ ] **Nginx reverse proxy** — SSL + domain
- [ ] **Database backup** — cron job สำรอง SQLite
- [ ] **Domain + SSL** — ตั้งค่า Let's Encrypt

### Priority 8: Analytics & Monitoring
- [ ] **Dashboard stats** — กราฟรายได้, คำสั่งซื้อ, ผู้ใช้ใหม่ (Chart.js)
- [ ] **Order notifications** — LINE Notify / Telegram bot แจ้งเตือนออร์เดอร์ใหม่
- [ ] **Error logging** — Sentry หรือ Logtail

### Priority 9: Advanced Features
- [ ] **Webhook support** — ให้ลูกค้ารับ notification ผ่าน webhook
- [ ] **API keys** — ให้ลูกค้า integrate กับ bot ของตัวเอง
- [ ] **Bulk pricing** — ราคาลดตามจำนวนซื้อ
- [ ] **Coupons** — ระบบคูปองส่วนลด
- [ ] **Email verification** — ยืนยันอีเมลตอนสมัคร

---

## 🏗️ โครงสร้างโปรเจค

```
payotp/
├── data/payotp.db          ← SQLite database (auto-created)
├── scripts/setup.js        ← Setup wizard
├── src/
│   ├── app/
│   │   ├── page.tsx        ← Landing page
│   │   ├── auth/page.tsx   ← Login/Register
│   │   ├── products/page.tsx ← Product catalog
│   │   ├── dashboard/      ← User dashboard (wallet/orders/affiliate)
│   │   ├── admin/          ← Admin panel
│   │   └── api/            ← API routes
│   │       ├── auth/       ← register, login, me
│   │       ├── products/   ← product listing
│   │       ├── orders/     ← purchase + history
│   │       ├── wallet/     ← deposit + confirm
│   │       ├── affiliate/  ← referral system
│   │       └── admin/      ← products, deposits, inventory, sms-confirm
│   ├── components/
│   │   ├── AppContext.tsx   ← Global state (lang, theme, user)
│   │   ├── Navbar.tsx       ← Navigation bar
│   │   └── Footer.tsx       ← Footer
│   └── lib/
│       ├── db.ts           ← Database + seed data
│       ├── auth.ts         ← JWT, password hashing
│       ├── i18n.ts         ← Translations (TH/EN/ZH)
│       └── qr.ts           ← PromptPay QR generation
├── SETUP.md                ← Full setup guide
└── SMS-LISTENER-SETUP.md   ← SMS listener guide
```

---

## 🚀 Quick Start (สำหรับ Agent ตัวต่อไป)

```bash
git clone https://github.com/dmz2001TH/payotp.git
cd payotp
npm install
npm run setup       # สร้างแอดมิน + ตั้งค่า
npm run dev         # รันที่ localhost:3000
```

---

## ⚠️ สิ่งที่ต้องระวัง

1. **JWT_SECRET** — ตอนนี้ hardcode ใน auth.ts ควรเปลี่ยนเป็น env variable
2. **No input validation** — API routes ยังไม่ validate ด้วย zod
3. **No rate limiting** — อาจถูก brute force ได้
4. **SQLite** — ดีสำหรับเริ่มต้น แต่ควรมี backup plan (PostgreSQL สำหรับ scale)
5. **SMS-Activate API** — ยังไม่ได้เชื่อม ต้องเพิ่ม integration
