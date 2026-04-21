import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest, getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { depositId } = await req.json();

    const deposit = db.prepare('SELECT * FROM deposits WHERE id = ? AND user_id = ? AND status = ?')
      .get(depositId, user.id, 'pending') as any;

    if (!deposit) {
      return NextResponse.json({ error: 'ไม่พบรายการ / Deposit not found' }, { status: 404 });
    }

    // Mark as awaiting admin confirmation
    db.prepare("UPDATE deposits SET status = 'awaiting_confirm' WHERE id = ?").run(depositId);

    return NextResponse.json({
      success: true,
      message: 'ส่งหลักฐานแล้ว รอแอดมินยืนยัน / Submitted, awaiting admin confirmation',
    });
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
    const currentUser = db.prepare('SELECT balance FROM users WHERE id = ?').get(user.id) as any;
    const deposits = db.prepare(`
      SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
    `).all(user.id);

    return NextResponse.json({ balance: currentUser.balance, deposits });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
