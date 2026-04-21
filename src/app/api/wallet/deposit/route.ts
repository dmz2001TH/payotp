import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest, generateReferenceCode } from '@/lib/auth';
import { generatePromptPayQR, generateUniqueAmount, generateTrueMoneyLink } from '@/lib/qr';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { amount, method } = await req.json();

    const minDeposit = parseFloat(
      (db.prepare('SELECT value FROM settings WHERE key = ?').get('min_deposit') as any)?.value || '50'
    );

    if (!amount || amount < minDeposit) {
      return NextResponse.json({ error: `เติมขั้นต่ำ ${minDeposit} บาท / Minimum deposit ${minDeposit} THB` }, { status: 400 });
    }

    const depositId = uuidv4();
    const refCode = generateReferenceCode();
    const { amount: uniqueAmount, code } = generateUniqueAmount(amount);

    let qrData = '';
    let qrImage = '';

    if (method === 'promptpay') {
      const ppNumber = (db.prepare('SELECT value FROM settings WHERE key = ?').get('promptpay_number') as any)?.value || '';
      if (!ppNumber) {
        return NextResponse.json({ error: 'ระบบพร้อมเพย์ยังไม่เปิดใช้งาน / PromptPay not configured' }, { status: 500 });
      }
      qrData = generatePromptPayQR(ppNumber, uniqueAmount);
      qrImage = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });
    } else if (method === 'truewallet') {
      const twNumber = (db.prepare('SELECT value FROM settings WHERE key = ?').get('truewallet_number') as any)?.value || '';
      if (!twNumber) {
        return NextResponse.json({ error: 'ระบบ TrueMoney ยังไม่เปิดใช้งาน / TrueMoney not configured' }, { status: 500 });
      }
      qrData = generateTrueMoneyLink(twNumber, uniqueAmount, `PayOTP-${refCode}`);
      qrImage = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });
    }

    db.prepare(`
      INSERT INTO deposits (id, user_id, amount, method, reference_code, qr_data, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).run(depositId, user.id, uniqueAmount, method, refCode, qrData);

    return NextResponse.json({
      success: true,
      deposit: {
        id: depositId,
        amount: uniqueAmount,
        originalAmount: amount,
        method,
        reference_code: refCode,
        qr_image: qrImage,
        status: 'pending',
      },
      message: `โอนจำนวน ${uniqueAmount} บาท (รหัส: ${refCode}) แล้วกดยืนยัน / Transfer ${uniqueAmount} THB (code: ${refCode}) then confirm`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
