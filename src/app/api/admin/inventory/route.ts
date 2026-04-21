import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status') || 'available';

    let items;
    if (productId) {
      items = db.prepare(`
        SELECT i.*, p.name_th, p.name_en
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        WHERE i.product_id = ? AND i.status = ?
        ORDER BY i.created_at DESC
      `).all(productId, status);
    } else {
      items = db.prepare(`
        SELECT i.*, p.name_th, p.name_en
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        WHERE i.status = ?
        ORDER BY i.created_at DESC
        LIMIT 500
      `).all(status);
    }

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { productId, accountData } = await req.json();

    if (!productId || !accountData) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ / Missing fields' }, { status: 400 });
    }

    // Support bulk add: one item per line
    const lines = accountData.split('\n').filter((l: string) => l.trim());
    const insertMany = db.transaction(() => {
      for (const line of lines) {
        const id = uuidv4();
        db.prepare("INSERT INTO inventory (id, product_id, account_data, status) VALUES (?, ?, ?, 'available')")
          .run(id, productId, line.trim());
      }
      // Update product stock
      db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(lines.length, productId);
    });

    insertMany();

    return NextResponse.json({ success: true, added: lines.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
