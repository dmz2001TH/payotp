import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ / Please fill all fields' }, { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username) as any;
    if (!user) {
      return NextResponse.json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง / Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง / Invalid credentials' }, { status: 401 });
    }

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
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
