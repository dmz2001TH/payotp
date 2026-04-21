import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// POST: Validate coupon code
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { code, orderAmount } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Missing coupon code' }, { status: 400 });
    }

    const coupon = db.prepare(`
      SELECT * FROM coupons WHERE code = ? AND active = 1
    `).get(code.toUpperCase()) as any;

    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
    }

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Coupon has expired' });
    }

    // Check max uses
    if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' });
    }

    // Check min order
    if (orderAmount && orderAmount < coupon.min_order) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order ฿${coupon.min_order} required`,
      });
    }

    // Check if user already used this coupon
    const alreadyUsed = db.prepare(
      'SELECT id FROM coupon_uses WHERE coupon_id = ? AND user_id = ?'
    ).get(coupon.id, user.id);

    if (alreadyUsed) {
      return NextResponse.json({ valid: false, error: 'You have already used this coupon' });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percent') {
      discount = (orderAmount || 0) * (coupon.discount_value / 100);
    } else {
      discount = coupon.discount_value;
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount: parseFloat(discount.toFixed(2)),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
