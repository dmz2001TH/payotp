# PayOTP — คู่มือติดตั้งและใช้งาน

## 📋 สิ่งที่ต้องเตรียม

| อย่าง | จำเป็นมั้ย | หมายเหตุ |
|-------|-----------|---------|
| Node.js 18+ | ✅ | สำหรับรันเซิร์ฟเวอร์ |
| iQOO 12 5G | ⚡ แนะนำ | สำหรับ SMS Auto-Confirm |
| Termux app | ⚡ แนะนำ | ลงบนมือถือ สำหรับ SMS Listener |
| SMS-Activate account | ⚡ แนะนำ | สำหรับขาย OTP เบอร์จีน (sms-activate.org) |
| PromptPay number | ✅ | เบอร์โทร 10 หลัก หรือเลขบัตร 13 หลัก |

---

## 🚀 Step 1: รัน Setup

เปิด Terminal แล้วรัน:

```bash
cd ~/.openclaw/workspace/payotp
npm run setup
```

ระบบจะถาม:

```
🏪 PayOTP Setup Wizard

Admin username: admin
Admin email: admin@example.com
Admin password (min 6 chars): yourpassword123

✅ Admin created: admin (admin@example.com)
   Referral code: ADMIN8X3K

💳 PromptPay Configuration:
PromptPay number: 0812345678          ← ใส่เบอร์ PromptPay ของคุณ
✅ PromptPay configured

TrueMoney phone number: 0812345678    ← ใส่เบอร์ TrueMoney (หรือกด Enter ข้าม)

📱 SMS-Activate API (for OTP service):
API Key: abc123...                     ← ใส่ API key จาก sms-activate.org (หรือ Enter ข้าม)

🎉 Setup complete!
```

---

## 🖥️ Step 2: รันเซิร์ฟเวอร์

```bash
cd ~/.openclaw/workspace/payotp
npm run dev
```

จะเห็น:
```
▲ Next.js 16.2.4
- Local: http://localhost:3000
```

**เปิด browser ไปที่ http://localhost:3000** ได้เลย!

---

## 🛒 Step 3: เริ่มใช้งาน

### 3.1 ล็อกอินแอดมิน
- ไปที่ http://localhost:3000/auth
- ล็อกอินด้วยบัญชีที่สร้างใน Step 1
- กดเมนู **🔧 แอดมิน** ด้านบน

### 3.2 เพิ่มสินค้า
- ไปที่ **Admin > จัดการสินค้า**
- กด **+ เพิ่ม**
- เลือกหมวดหมู่ → ใส่ชื่อ (ไทย/อังกฤษ/จีน) → ใส่ราคา → บันทึก

### 3.3 เพิ่มสต็อกสินค้า (สำคัญ!)
- ไปที่ **Admin > สต็อกสินค้า**
- เลือกสินค้า
- ใส่ข้อมูล **1 บรรทัด = 1 ชิ้น** เช่น:

```
email:password
user@gmail.com:P@ss1234
Netflix:account123:profile1
```

- กด **เพิ่ม** → สต็อกจะเพิ่มทันที

### 3.4 อนุมัติการเติมเงิน
- ลูกค้าโอนเงิน → กด **ยืนยัน** ในหน้าลูกค้า
- คุณไปที่ **Admin > การเติมเงิน**
- เช็คแอปธนาคารว่าเงินเข้าตรงยอดหรือไม่
- กด **✅ ยืนยัน** → ระบบเติม wallet ให้ลูกค้าอัตโนมัติ

---

## 📱 Step 4: ตั้ง SMS Auto-Confirm (บน iQOO 12 5G)

### ตัวเลือก A: Termux (แนะนำ — ฟรี)

**4.1** ติดตั้ง Termux จาก F-Droid:
https://f-droid.org/packages/com.termux/

**4.2** ติดตั้ง Termux:API:
https://f-droid.org/packages/com.termux.api/

**4.3** เปิด Termux แล้วรัน:
```bash
pkg update && pkg upgrade -y
pkg install termux-api nodejs -y
```

**4.4** สร้างไฟล์ SMS Listener:
```bash
mkdir -p ~/payotp
cat > ~/payotp/sms-listener.js << 'SCRIPT'
const { execSync } = require('child_process');

// ===== ตั้งค่า =====
const SERVER_URL = 'http://YOUR_IP:3000';  // ← เปลี่ยนเป็น IP เซิร์ฟเวอร์
const INTERVAL = 10000;
// ==================

let lastCheck = Date.now();

const BANK_PATTERNS = [
  /เงินเข้า.*?([\d,]+\.?\d*)\s*บ/i,
  /KBank.*?([\d,]+\.?\d*)/i,
  /SCB.*?([\d,]+\.?\d*)/i,
  /KTB.*?([\d,]+\.?\d*)/i,
  /BBL.*?([\d,]+\.?\d*)/i,
  /PromptPay.*?([\d,]+\.?\d*)/i,
  /([\d,]+\.\d{2})\s*บ/i,
  /([\d,]+\.\d{2})\s*บาท/i,
];

function getSms() {
  try {
    return JSON.parse(execSync('termux-sms-list -l 20', { encoding: 'utf8' }));
  } catch { return []; }
}

function parseAmount(msg) {
  for (const p of BANK_PATTERNS) {
    const m = msg.match(p);
    if (m) {
      const amt = parseFloat(m[1].replace(/,/g, ''));
      if (!isNaN(amt) && amt > 0) return amt;
    }
  }
  return null;
}

async function check() {
  const msgs = getSms();
  for (const sms of msgs) {
    const received = new Date(sms.received).getTime();
    if (received <= lastCheck) continue;
    const amount = parseAmount(sms.body);
    if (amount) {
      console.log(`💰 Found: ฿${amount}`);
      try {
        await fetch(`${SERVER_URL}/api/admin/sms-confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, timestamp: Date.now() }),
        });
        console.log('✅ Confirmed');
      } catch (e) { console.error('❌', e.message); }
    }
  }
  lastCheck = Date.now();
}

console.log('🚀 SMS Listener started');
setInterval(check, INTERVAL);
check();
SCRIPT
```

**4.5** แก้ไข `YOUR_IP` ในไฟล์:
```bash
# ถ้าเซิร์ฟเวอร์อยู่บนเครื่องเดียวกัน ใช้ IP ของเครื่อง
# ดู IP: ifconfig หรือ ip addr
sed -i 's/YOUR_IP/192.168.1.100/g' ~/payotp/sms-listener.js
#                                    ↑ เปลี่ยนเป็น IP จริง
```

**4.6** รัน:
```bash
node ~/payotp/sms-listener.js
```

**4.7** รัน background (ปิด Termux แล้วยังทำงาน):
```bash
nohup node ~/payotp/sms-listener.js > ~/payotp/sms.log 2>&1 &
```

**4.8** ให้สิทธิ์ SMS:
- Settings > Apps > Termux:API > Permissions > SMS > Allow

### ตัวเลือก B: Manual (ง่ายสุด)
- ไม่ต้องตั้งค่าอะไร
- ลูกค้าโอนเงิน → คุณเปิดแอปธนาคารเช็ค → ไป Admin > การเติมเงิน > กด ✅
- ทำได้บนมือถือเลย ใช้เวลา ~10 วินาที

---

## 💰 Step 5: หาสินค้ามาขาย

### OTP (เบอร์จีนราคาถูก)
1. สมัครที่ https://sms-activate.org
2. เติมเงิน $1+ (ผ่าน crypto หรือบัตร)
3. คัดลอก API Key จากหน้า Dashboard
4. ใส่ใน Setup (หรือแก้ไขในฐานข้อมูล settings → otp_api_key)

### แอคเคาท์พรีเมียม (จีนราคาถูก)
1. ไป https://taobao.com หรือ https://pinduoduo.com
2. ค้นหา: `Netflix合租` `YouTube Premium共享` `ChatGPT账号`
3. ซื้อมา → ใส่สต็อกใน Admin > สต็อกสินค้า

### เติมเกม
- ใช้ wePAY API ที่มีอยู่แล้ว
- หรือซื้อราคาส่งจากจีน

---

## 🌐 Step 6: เอาออนไลน์ (เมื่อพร้อม)

### 6.1 ติดตั้งบน VPS
```bash
# SSH เข้า VPS
ssh root@your-vps-ip

# ติดตั้ง Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git

# Clone โปรเจค
cd /var/www
git clone your-repo-url payotp
cd payotp
npm install
npm run setup
npm run build

# รันด้วย PM2 (ให้รันตลอด)
npm install -g pm2
pm2 start npm --name "payotp" -- start
pm2 save
pm2 startup
```

### 6.2 ตั้งค่า Domain + SSL
```bash
# ติดตั้ง Nginx
apt install -y nginx

# สร้าง config
cat > /etc/nginx/sites-available/payotp << 'EOF'
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/payotp /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# ติดตั้ง SSL (ฟรี)
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

### 6.3 อัพเดท SERVER_URL ใน SMS Listener
```bash
# บนมือถือ Termux
sed -i 's|http://YOUR_IP:3000|https://yourdomain.com|g' ~/payotp/sms-listener.js
```

---

## ❓ ปัญหาที่พบบ่อย

### Q: รัน `npm run dev` แล้วเจอ Error
**A:** ลอง:
```bash
cd ~/.openclaw/workspace/payotp
rm -rf data/payotp.db  # ลบฐานข้อมูลเก่า
npm run setup           # สร้างใหม่
npm run dev
```

### Q: หน้าเว็บโหลดไม่ขึ้น
**A:** ตรวจสอบ:
- Terminal แสดง `Ready` หรือยัง
- ใช้ http://localhost:3000 (ไม่ใช่ https)
- Port 3000 ถูกใช้โดยโปรแกรมอื่นหรือไม่

### Q: SMS Listener ไม่จับ SMS
**A:** ตรวจสอบ:
- Termux:API มีสิทธิ์ SMS หรือไม่
- รัน `termux-sms-list` ดูว่าได้ SMS หรือไม่
- BANK_PATTERNS ตรงกับข้อความธนาคารหรือไม่

### Q: อยากเปลี่ยนรหัสแอดมิน
**A:** รัน setup ใหม่ สร้างแอดมินคนใหม่ หรือลบไฟล์ `data/payotp.db` แล้ว setup ใหม่

---

## 📁 โครงสร้างไฟล์

```
payotp/
├── data/              ← ฐานข้อมูล SQLite
├── src/
│   ├── app/           ← หน้าเว็บ + API
│   ├── components/    ← UI Components
│   └── lib/           ← Utilities (db, auth, i18n, qr)
├── scripts/
│   └── setup.js       ← สคริปต์ติดตั้ง
├── SMS-LISTENER-SETUP.md  ← คู่มือ SMS
└── SETUP.md           ← ไฟล์นี้
```
