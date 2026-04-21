import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    let deposits;
    if (status === 'all') {
      deposits = db.prepare(`
        SELECT d.*, u.username, u.email
        FROM deposits d
        JOIN users u ON d.user_id = u.id
        ORDER BY d.created_at DESC
        LIMIT 200
      `).all();
    } else {
      deposits = db.prepare(`
        SELECT d.*, u.username, u.email
        FROM deposits d
        JOIN users u ON d.user_id = u.id
        WHERE d.status = ?
        ORDER BY d.created_at DESC
      `).all(status);
    }

    return NextResponse.json({ deposits });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { depositId, action } = await req.json();

    const deposit = db.prepare('SELECT * FROM deposits WHERE id = ?').get(depositId) as any;
    if (!deposit) {
      return NextResponse.json({ error: 'ไม่พบรายการ / Not found' }, { status: 404 });
    }

    if (deposit.status !== 'pending' && deposit.status !== 'awaiting_confirm') {
      return NextResponse.json({ error: 'รายการนี้ดำเนินการแล้ว / Already processed' }, { status: 400 });
    }

    if (action === 'confirm') {
      const confirmDeposit = db.transaction(() => {
        // Add balance to user
        db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(deposit.amount, deposit.user_id);
        // Update deposit status
        db.prepare("UPDATE deposits SET status = 'completed', confirmed_by = ?, confirmed_at = datetime('now') WHERE id = ?")
          .run(user.id, depositId);
      });
      confirmDeposit();

      return NextResponse.json({ success: true, message: 'เติมเงินสำเร็จ / Deposit confirmed' });
    } else if (action === 'reject') {
      db.prepare("UPDATE deposits SET status = 'rejected', confirmed_by = ?, confirmed_at = datetime('now') WHERE id = ?")
        .run(user.id, depositId);

      return NextResponse.json({ success: true, message: 'ปฏิเสธสำเร็จ / Deposit rejected' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
