# PayOTP SMS Listener — สำหรับ iQOO 12 5G

## วิธีตั้งค่า (เลือก 1 วิธี)

---

## วิธีที่ 1: Termux (แนะนำ — ฟรี)

### 1. ติดตั้ง Termux
- ดาวน์โหลดจาก F-Droid: https://f-droid.org/packages/com.termux/
- อย่าลงจาก Play Store (เวอร์ชั่นเก่า)

### 2. ตั้งค่า Termux
```bash
# เปิด Termux แล้วรัน:
pkg update && pkg upgrade -y
pkg install termux-api nodejs -y
```

### 3. ติดตั้ง Termux:API app
- ดาวน์โหลด: https://f-droid.org/packages/com.termux.api/
- ให้สิทธิ์ SMS ใน Settings > Apps > Termux:API > Permissions

### 4. Copy สคริปต์ SMS Listener
```bash
# สร้างไฟล์
mkdir -p ~/payotp
cat > ~/payotp/sms-listener.js << 'EOF'
const { execSync } = require('child_process');

// ===== ตั้งค่าตรงนี้ =====
const SERVER_URL = 'http://YOUR_SERVER_IP:3000'; // เปลี่ยนเป็น IP เซิร์ฟเวอร์
const CHECK_INTERVAL = 10000; // เช็คทุก 10 วินาที
// =========================

const BANK_PATTERNS = [
  // กสิกรไทย
  /เงินเข้า.*?([\d,]+\.?\d*)\s*บ/i,
  /KBank.*?([\d,]+\.?\d*)\s*THB/i,
  // ไทยพาณิชย์
  /SCB.*?([\d,]+\.?\d*)\s*บ/i,
  /เงินโอนเข้า.*?([\d,]+\.?\d*)/i,
  // กรุงไทย
  /KTB.*?([\d,]+\.?\d*)/i,
  // กรุงเทพ
  /BBL.*?([\d,]+\.?\d*)/i,
  // PromptPay
  /PromptPay.*?([\d,]+\.?\d*)/i,
  // ทั่วไป
  /([\d,]+\.\d{2})\s*บ/i,
  /([\d,]+\.\d{2})\s*บาท/i,
];

let lastCheck = Date.now();

function getSms() {
  try {
    // ดึง SMS ล่าสุด 20 ข้อความ
    const result = execSync('termux-sms-list -l 20', { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (e) {
    console.error('Error reading SMS:', e.message);
    return [];
  }
}

function parseAmount(message) {
  for (const pattern of BANK_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }
  return null;
}

async function notifyServer(amount) {
  try {
    const response = await fetch(`${SERVER_URL}/api/admin/sms-confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, timestamp: Date.now() }),
    });
    const data = await response.json();
    console.log(`✅ Server notified: ฿${amount}`, data);
    return true;
  } catch (e) {
    console.error('❌ Error notifying server:', e.message);
    return false;
  }
}

async function check() {
  const messages = getSms();
  for (const sms of messages) {
    const received = new Date(sms.received).getTime();
    if (received <= lastCheck) continue;
    
    const amount = parseAmount(sms.body);
    if (amount) {
      console.log(`💰 Found deposit: ฿${amount} from "${sms.body.substring(0, 50)}..."`);
      await notifyServer(amount);
    }
  }
  lastCheck = Date.now();
}

console.log('🚀 PayOTP SMS Listener started');
console.log(`📡 Server: ${SERVER_URL}`);
console.log(`⏱️  Check interval: ${CHECK_INTERVAL / 1000}s`);
console.log('');

setInterval(check, CHECK_INTERVAL);
check(); // initial check
EOF

# รัน SMS Listener
node ~/payotp/sms-listener.js
```

### 5. รันตลอดเวลา (Background)
```bash
# รัน background
nohup node ~/payotp/sms-listener.js > ~/payotp/sms.log 2>&1 &

# ดู log
tail -f ~/payotp/sms.log

# หยุด
kill $(cat ~/payotp/sms.pid)
```

---

## วิธีที่ 2: สร้าง SMS Auto-Forward (ง่ายกว่า)

ถ้า Termux ยุ่งยาก ใช้วิธี **ตั้งค่า Auto-Forward SMS** ไปยัง LINE/Telegram:

1. ติดตั้ง **SMS Forwarder** app จาก Play Store
2. ตั้งค่า Forward ไป Telegram Bot
3. Bot ส่งไปยังเซิร์ฟเวอร์

---

## วิธีที่ 3: Manual (ง่ายสุด)

1. เปิดแอปธนาคารบน iQOO 12 5G
2. เช็คเงินเข้า
3. ไปที่ Admin > Deposits
4. กด ✅ Confirm

ใช้เวลา ~10 วินาที ต่อ 1 รายการ — ทำได้บนมือถือเลย
