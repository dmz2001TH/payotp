import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET: Get all settings
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsObj: Record<string, string> = {};
    for (const s of settings as any[]) {
      // Mask sensitive values
      if (s.key.includes('key') || s.key.includes('token') || s.key.includes('secret')) {
        settingsObj[s.key] = s.value ? '••••••••' : '';
      } else {
        settingsObj[s.key] = s.value;
      }
    }

    return NextResponse.json({ settings: settingsObj });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update settings
export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();

    // Whitelist allowed keys
    const allowedKeys = [
      'site_name', 'site_slogan_th', 'site_slogan_en', 'site_slogan_zh',
      'promptpay_number', 'promptpay_name', 'truewallet_number',
      'min_deposit', 'referral_commission',
      'sms_webhook_key', 'gbprimepay_token', 'gbprimepay_api_key',
      'sms_activate_api_key',
    ];

    const update = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const updateAll = db.transaction(() => {
      for (const [key, value] of Object.entries(body)) {
        if (allowedKeys.includes(key) && typeof value === 'string') {
          // Skip masked values (don't overwrite with dots)
          if (value === '••••••••') continue;
          update.run(key, value);
        }
      }
    });

    updateAll();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
