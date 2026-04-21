import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET: List all users with search & pagination
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    let where = '';
    const params: any[] = [];

    if (search) {
      where = 'WHERE username LIKE ? OR email LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    const total = (db.prepare(`SELECT COUNT(*) as c FROM users ${where}`).get(...params) as any).c;

    const users = db.prepare(`
      SELECT id, username, email, balance, role, referral_code, referred_by,
             total_spent, can_refer, language, created_at
      FROM users ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return NextResponse.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update user (balance, role)
export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, action, amount, role } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'add_balance') {
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      }
      db.prepare('UPDATE users SET balance = balance + ?, updated_at = datetime(\'now\') WHERE id = ?').run(amount, userId);

      // Record deposit
      const depositId = 'manual-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
      db.prepare(`
        INSERT INTO deposits (id, user_id, amount, method, reference_code, status, confirmed_by, confirmed_at)
        VALUES (?, ?, ?, 'manual', ?, 'confirmed', ?, datetime('now'))
      `).run(depositId, userId, amount, 'MANUAL-' + depositId, user.id);

      return NextResponse.json({ success: true, message: `เพิ่ม ${amount} บาท สำเร็จ` });
    }

    if (action === 'subtract_balance') {
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      }
      if (targetUser.balance < amount) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }
      db.prepare("UPDATE users SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?").run(amount, userId);
      return NextResponse.json({ success: true, message: `หัก ${amount} บาท สำเร็จ` });
    }

    if (action === 'set_balance') {
      if (amount === undefined || amount < 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      }
      db.prepare("UPDATE users SET balance = ?, updated_at = datetime('now') WHERE id = ?").run(amount, userId);
      return NextResponse.json({ success: true, message: `ตั้งยอดเป็น ${amount} บาท สำเร็จ` });
    }

    if (action === 'set_role') {
      if (!['user', 'admin'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      db.prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?").run(role, userId);
      return NextResponse.json({ success: true, message: `เปลี่ยนยศเป็น ${role} สำเร็จ` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
