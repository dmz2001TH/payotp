import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import db from './db';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn('[SECURITY] JWT_SECRET not set in environment! Using stable fallback (not recommended for production)');
}

// Use a STABLE fallback so tokens survive server restarts in dev.
// For production, always set JWT_SECRET env var.
const secret = JWT_SECRET || 'payotp-dev-fallback-secret-do-not-use-in-prod';

export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  role: string;
  referral_code: string;
  referred_by: string | null;
  total_spent: number;
  can_refer: number;
  language: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    secret,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { id: string; username: string; role: string } | null {
  try {
    return jwt.verify(token, secret) as { id: string; username: string; role: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id) as User | undefined;
  return user || null;
}

export async function getUserFromRequest(req: NextRequest): Promise<User | null> {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id) as User | undefined;
  return user || null;
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateReferenceCode(): string {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
