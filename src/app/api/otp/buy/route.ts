import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

// SMS-Activate API integration
const SMS_ACTIVATE_BASE = 'https://sms-activate.org/stubs/handler_api.php';

async function smsActivateRequest(action: string, params: Record<string, string> = {}) {
  const apiKey = (db.prepare('SELECT value FROM settings WHERE key = ?').get('sms_activate_api_key') as any)?.value;
  if (!apiKey) throw new Error('SMS-Activate API key not configured');

  const url = new URL(SMS_ACTIVATE_BASE);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('action', action);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  const text = await res.text();
  return text;
}

// GET: List available services and prices
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const configured = !!(db.prepare('SELECT value FROM settings WHERE key = ?').get('sms_activate_api_key') as any)?.value;

    if (!configured) {
      return NextResponse.json({
        available: false,
        message: 'SMS-Activate API not configured',
      });
    }

    // Get balance
    const balanceRes = await smsActivateRequest('getBalance');
    const balance = balanceRes.includes('ACCESS_BALANCE')
      ? parseFloat(balanceRes.split(':')[1])
      : 0;

    // Get prices for common services
    const services = [
      { id: 'go', name: 'Google', name_th: 'Google', name_zh: 'Google', icon: '🔍' },
      { id: 'fb', name: 'Facebook', name_th: 'Facebook', name_zh: 'Facebook', icon: '📘' },
      { id: 'ig', name: 'Instagram', name_th: 'Instagram', name_zh: 'Instagram', icon: '📸' },
      { id: 'tw', name: 'Twitter', name_th: 'Twitter', name_zh: 'Twitter', icon: '🐦' },
      { id: 'tg', name: 'Telegram', name_th: 'Telegram', name_zh: 'Telegram', icon: '✈️' },
      { id: 'wa', name: 'WhatsApp', name_th: 'WhatsApp', name_zh: 'WhatsApp', icon: '💬' },
      { id: 'vk', name: 'VK', name_th: 'VK', name_zh: 'VK', icon: '🌐' },
      { id: 'ds', name: 'Discord', name_th: 'Discord', name_zh: 'Discord', icon: '🎮' },
    ];

    return NextResponse.json({
      available: true,
      balance,
      services,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Buy a phone number
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rl = checkRateLimit(`user:${user.id}`, RATE_LIMITS.purchase);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { service, country = '0', price } = await req.json();

    if (!service) {
      return NextResponse.json({ error: 'Missing service' }, { status: 400 });
    }

    // Check user balance (price should come from admin config)
    const product = db.prepare(`
      SELECT p.* FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE c.slug = 'otp' AND p.active = 1 AND p.stock > 0
      ORDER BY p.price ASC LIMIT 1
    `).get() as any;

    if (!product) {
      return NextResponse.json({ error: 'No OTP products available' }, { status: 400 });
    }

    const currentUser = db.prepare('SELECT balance FROM users WHERE id = ?').get(user.id) as any;
    if (currentUser.balance < product.price) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Buy number from SMS-Activate
    const buyRes = await smsActivateRequest('getNumber', {
      service,
      country,
    });

    if (!buyRes.startsWith('ACCESS_NUMBER')) {
      return NextResponse.json({ error: `SMS-Activate error: ${buyRes}` }, { status: 500 });
    }

    // Parse: ACCESS_NUMBER:orderId:phoneNumber
    const [, orderId, phoneNumber] = buyRes.split(':');

    // Deduct balance
    db.prepare('UPDATE users SET balance = balance - ?, total_spent = total_spent + ? WHERE id = ?')
      .run(product.price, product.price, user.id);

    // Create order
    const localOrderId = uuidv4();
    db.prepare(`
      INSERT INTO orders (id, user_id, product_id, quantity, total_price, status, delivered_data)
      VALUES (?, ?, ?, 1, ?, 'pending', ?)
    `).run(localOrderId, user.id, product.id, product.price,
      JSON.stringify({ sms_activate_id: orderId, phone: phoneNumber, service }));

    return NextResponse.json({
      success: true,
      order_id: localOrderId,
      phone: phoneNumber,
      sms_activate_id: orderId,
      message: `เบอร์ ${phoneNumber} — ส่ง SMS แล้วกด "เช็ค SMS" / Phone ${phoneNumber} — click "Check SMS" after receiving`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
