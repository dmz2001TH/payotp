import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// SMS Listener webhook - called by phone when it detects a bank deposit
export async function POST(req: NextRequest) {
  try {
    const { amount, timestamp } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: 'Missing amount' }, { status: 400 });
    }

    // Find pending deposit with matching amount
    const deposit = db.prepare(`
      SELECT d.*, u.username
      FROM deposits d
      JOIN users u ON d.user_id = u.id
      WHERE d.amount = ? AND (d.status = 'pending' OR d.status = 'awaiting_confirm')
      ORDER BY d.created_at ASC
      LIMIT 1
    `).get(amount) as any;

    if (!deposit) {
      return NextResponse.json({
        success: false,
        message: `No pending deposit found for ฿${amount}`,
      });
    }

    // Auto-confirm the deposit
    const confirmDeposit = db.transaction(() => {
      db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(deposit.amount, deposit.user_id);
      db.prepare("UPDATE deposits SET status = 'completed', confirmed_by = 'sms-bot', confirmed_at = datetime('now') WHERE id = ?")
        .run(deposit.id);
    });

    confirmDeposit();

    return NextResponse.json({
      success: true,
      message: `Auto-confirmed ฿${amount} for ${deposit.username}`,
      deposit_id: deposit.id,
      username: deposit.username,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
