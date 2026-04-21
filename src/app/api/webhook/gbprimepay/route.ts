import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GBPrimePay Payment Gateway Webhook
// This receives payment notifications from GBPrimePay
// Docs: https://developer.gbprimepay.com

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify GBPrimePay token
    const secretToken = (db.prepare('SELECT value FROM settings WHERE key = ?').get('gbprimepay_token') as any)?.value;
    if (secretToken && body.token !== secretToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    const {
      referenceNo,       // GBPrimePay reference
      transactionId,     // Transaction ID
      amount,            // Amount in THB
      status,            // 00 = success
      responseCode,      // Response code
    } = body;

    if (status !== '00') {
      console.log(`[GBPrimePay] Non-success status: ${status} for ref ${referenceNo}`);
      return NextResponse.json({ success: true, message: 'Noted (non-success)' });
    }

    // Find matching deposit by reference code
    const deposit = db.prepare(`
      SELECT d.*, u.username
      FROM deposits d
      JOIN users u ON d.user_id = u.id
      WHERE d.reference_code = ? AND d.status = 'pending'
    `).get(referenceNo) as any;

    if (!deposit) {
      console.log(`[GBPrimePay] No pending deposit found for ref ${referenceNo}`);
      return NextResponse.json({ success: true, message: 'No matching deposit' });
    }

    // Verify amount matches (with tolerance for rounding)
    const expectedAmount = deposit.amount;
    if (Math.abs(parseFloat(amount) - expectedAmount) > 0.02) {
      console.log(`[GBPrimePay] Amount mismatch: expected ${expectedAmount}, got ${amount}`);
      return NextResponse.json({ success: true, message: 'Amount mismatch' });
    }

    // Auto-confirm
    const confirmDeposit = db.transaction(() => {
      db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(deposit.amount, deposit.user_id);
      db.prepare("UPDATE deposits SET status = 'completed', confirmed_by = 'gbprimepay', confirmed_at = datetime('now') WHERE id = ?")
        .run(deposit.id);
    });

    confirmDeposit();

    console.log(`[GBPrimePay] Auto-confirmed ฿${deposit.amount} for ${deposit.username}`);

    return NextResponse.json({ success: true, message: 'Payment confirmed' });
  } catch (error: any) {
    console.error('[GBPrimePay] Webhook error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
