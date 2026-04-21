import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      role: user.role,
      referral_code: user.referral_code,
      total_spent: user.total_spent,
      can_refer: user.can_refer,
      language: user.language,
    },
  });
}
