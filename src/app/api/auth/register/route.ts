import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, generateReferralCode, generateToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, referralCode, language } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ / Please fill all fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร / Password must be at least 6 characters' }, { status: 400 });
    }

    // Check existing
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing) {
      return NextResponse.json({ error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว / Username or email already exists' }, { status: 409 });
    }

    const userId = uuidv4();
    const myReferralCode = generateReferralCode();
    const passwordHash = await hashPassword(password);

    let referredBy = null;
    if (referralCode) {
      const referrer = db.prepare('SELECT id FROM users WHERE referral_code = ?').get(referralCode) as { id: string } | undefined;
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, referral_code, referred_by, language)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, username, email, passwordHash, myReferralCode, referredBy, language || 'th');

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    const token = generateToken(user);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role,
        referral_code: user.referral_code,
        language: user.language,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
