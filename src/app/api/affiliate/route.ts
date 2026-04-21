import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get referral info
    const myReferrals = db.prepare(`
      SELECT r.*, u.username, u.email, u.created_at as user_joined
      FROM referrals r
      JOIN users u ON r.referred_id = u.id
      WHERE r.referrer_id = ?
      ORDER BY r.created_at DESC
    `).all(user.id);

    const totalEarned = myReferrals.reduce((sum: number, r: any) => sum + r.total_earned, 0);

    return NextResponse.json({
      referral_code: user.referral_code,
      can_refer: user.can_refer,
      total_earned: totalEarned,
      referral_count: myReferrals.length,
      referrals: myReferrals,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Create referral relationship when referred user makes first purchase
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { referredId } = await req.json();
    const { v4: uuidv4 } = require('uuid');

    // Check if referred user was actually referred by this user
    const referred = db.prepare('SELECT * FROM users WHERE id = ? AND referred_by = ?').get(referredId, user.id) as any;
    if (!referred) {
      return NextResponse.json({ error: 'Invalid referral' }, { status: 400 });
    }

    // Check if referral already exists
    const existing = db.prepare('SELECT id FROM referrals WHERE referrer_id = ? AND referred_id = ?').get(user.id, referredId);
    if (existing) {
      return NextResponse.json({ error: 'Referral already exists' }, { status: 400 });
    }

    const id = uuidv4();
    db.prepare('INSERT INTO referrals (id, referrer_id, referred_id) VALUES (?, ?, ?)').run(id, user.id, referredId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
