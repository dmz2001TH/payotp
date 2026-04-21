import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { smsConfirmSchema, validateRequest, validationErrorResponse } from '@/lib/validate';

// SMS Listener webhook - called by phone when it detects a bank deposit
// Requires API key for security
export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rl = checkRateLimit(ip, RATE_LIMITS.sms);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    }

    const body = await req.json();
    const validation = validateRequest(smsConfirmSchema, body);
    if (!validation.success) return validationErrorResponse(validation.error);

    const { amount, api_key } = validation.data;

    // Verify API key
    const configuredKey = (db.prepare('SELECT value FROM settings WHERE key = ?').get('sms_webhook_key') as any)?.value;
    if (configuredKey && api_key !== configuredKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
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
