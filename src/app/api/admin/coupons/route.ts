import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET: List all coupons
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const coupons = db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM coupon_uses WHERE coupon_id = c.id) as times_used
      FROM coupons c
      ORDER BY c.created_at DESC
    `).all();

    return NextResponse.json({ coupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create coupon
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { code, discount_type, discount_value, min_order, max_uses, expires_at } = await req.json();

    if (!code || !discount_value) {
      return NextResponse.json({ error: 'Missing code or discount_value' }, { status: 400 });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO coupons (id, code, discount_type, discount_value, min_order, max_uses, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      code.toUpperCase(),
      discount_type || 'percent',
      parseFloat(discount_value),
      parseFloat(min_order) || 0,
      parseInt(max_uses) || 0,
      expires_at || null
    );

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete coupon
export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    db.prepare('UPDATE coupons SET active = 0 WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
