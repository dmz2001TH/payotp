import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, generateReferralCode, generateToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import { registerSchema, validateRequest, validationErrorResponse } from '@/lib/validate';

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
    const rl = checkRateLimit(ip, RATE_LIMITS.auth);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const validation = validateRequest(registerSchema, body);
    if (!validation.success) return validationErrorResponse(validation.error);

    const { username, email, password, referralCode, language } = validation.data;

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
    `).run(userId, username, email, passwordHash, myReferralCode, referredBy, language);

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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
