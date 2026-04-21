import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { createOrderSchema, validateRequest, validationErrorResponse } from '@/lib/validate';

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Rate limit per user
    const rl = checkRateLimit(`user:${user.id}`, RATE_LIMITS.purchase);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
    }

    const body = await req.json();
    const validation = validateRequest(createOrderSchema, body);
    if (!validation.success) return validationErrorResponse(validation.error);

    const { productId } = validation.data;

    const product = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(productId) as any;
    if (!product) {
      return NextResponse.json({ error: 'ไม่พบสินค้า / Product not found' }, { status: 404 });
    }

    if (product.stock <= 0) {
      return NextResponse.json({ error: 'สินค้าหมด / Out of stock' }, { status: 400 });
    }

    // Check user balance
    const currentUser = db.prepare('SELECT balance FROM users WHERE id = ?').get(user.id) as any;
    if (currentUser.balance < product.price) {
      return NextResponse.json({ error: 'ยอดเงินไม่เพียงพอ / Insufficient balance' }, { status: 400 });
    }

    // Get inventory item
    const inventoryItem = db.prepare(`
      SELECT * FROM inventory WHERE product_id = ? AND status = 'available' ORDER BY created_at ASC LIMIT 1
    `).get(productId) as any;

    if (!inventoryItem) {
      return NextResponse.json({ error: 'สินค้าหมด / Out of stock' }, { status: 400 });
    }

    const orderId = uuidv4();

    // Transaction
    const doOrder = db.transaction(() => {
      // Deduct balance
      db.prepare('UPDATE users SET balance = balance - ?, total_spent = total_spent + ? WHERE id = ?')
        .run(product.price, product.price, user.id);

      // Mark inventory as sold
      db.prepare("UPDATE inventory SET status = 'sold', sold_to = ?, sold_at = datetime('now') WHERE id = ?")
        .run(user.id, inventoryItem.id);

      // Decrease stock
      db.prepare('UPDATE products SET stock = stock - 1 WHERE id = ?').run(productId);

      // Create order
      db.prepare(`
        INSERT INTO orders (id, user_id, product_id, quantity, total_price, status, delivered_data)
        VALUES (?, ?, ?, 1, ?, 'completed', ?)
      `).run(orderId, user.id, productId, product.price, inventoryItem.account_data);

      // Handle referral commission
      const referrer = db.prepare('SELECT referred_by FROM users WHERE id = ?').get(user.id) as any;
      if (referrer?.referred_by) {
        const referral = db.prepare('SELECT * FROM referrals WHERE referrer_id = ? AND referred_id = ?')
          .get(referrer.referred_by, user.id) as any;
        if (referral) {
          const commission = product.price * referral.commission_rate;
          db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(commission, referrer.referred_by);
          db.prepare('UPDATE referrals SET total_earned = total_earned + ? WHERE id = ?').run(commission, referral.id);

          const txId = uuidv4();
          db.prepare('INSERT INTO referral_transactions (id, referral_id, order_id, commission) VALUES (?, ?, ?, ?)')
            .run(txId, referral.id, orderId, commission);
        }
      }

      // Enable referral for this user if this is their first purchase
      db.prepare('UPDATE users SET can_refer = 1 WHERE id = ? AND total_spent > 0').run(user.id);
    });

    doOrder();

    // Get full order
    const order = db.prepare(`
      SELECT o.*, p.name_th, p.name_en, p.name_zh
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.id = ?
    `).get(orderId);

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Admin sees all orders, users see only their own
    let orders;
    if (user.role === 'admin') {
      orders = db.prepare(`
        SELECT o.*, p.name_th, p.name_en, p.name_zh, p.type, u.username
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 200
      `).all();
    } else {
      orders = db.prepare(`
        SELECT o.*, p.name_th, p.name_en, p.name_zh, p.type
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
        LIMIT 100
      `).all(user.id);
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
