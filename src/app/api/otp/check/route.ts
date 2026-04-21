import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

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

// GET: Check SMS status
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rl = checkRateLimit(`user:${user.id}`, RATE_LIMITS.api);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // Verify order belongs to user
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, user.id) as any;
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const deliveredData = JSON.parse(order.delivered_data || '{}');
    const smsId = deliveredData.sms_activate_id;

    if (!smsId) {
      return NextResponse.json({ error: 'Not an SMS-Activate order' }, { status: 400 });
    }

    // Check SMS status
    const statusRes = await smsActivateRequest('getStatus', { id: smsId });

    if (statusRes.startsWith('STATUS_OK')) {
      // Got SMS code
      const code = statusRes.split(':')[1];

      // Update order
      db.prepare("UPDATE orders SET status = 'completed', delivered_data = ? WHERE id = ?")
        .run(JSON.stringify({
          ...deliveredData,
          sms_code: code,
          completed_at: new Date().toISOString(),
        }), orderId);

      // Set as complete on SMS-Activate
      await smsActivateRequest('setStatus', { id: smsId, status: '1' });

      return NextResponse.json({
        status: 'received',
        code,
        message: `SMS code: ${code}`,
      });
    } else if (statusRes === 'STATUS_WAIT_CODE') {
      return NextResponse.json({
        status: 'waiting',
        message: 'Waiting for SMS...',
      });
    } else if (statusRes === 'STATUS_CANCEL') {
      return NextResponse.json({
        status: 'cancelled',
        message: 'Order was cancelled',
      });
    } else {
      return NextResponse.json({
        status: 'unknown',
        raw: statusRes,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Cancel OTP order
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();

    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, user.id) as any;
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const deliveredData = JSON.parse(order.delivered_data || '{}');
    const smsId = deliveredData.sms_activate_id;

    if (smsId) {
      // Set status 8 = cancel on SMS-Activate
      await smsActivateRequest('setStatus', { id: smsId, status: '8' });
    }

    // Refund
    db.prepare("UPDATE orders SET status = 'cancelled' WHERE id = ?").run(orderId);
    db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(order.total_price, user.id);

    return NextResponse.json({
      success: true,
      message: 'Order cancelled, balance refunded',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
