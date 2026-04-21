import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// CSV inventory import
// Accepts CSV file upload with format: account_data (one per line)
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;

    if (!file || !productId) {
      return NextResponse.json({ error: 'Missing file or productId' }, { status: 400 });
    }

    // Verify product exists
    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const text = await file.text();
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    // Skip header row if it looks like a header
    let dataLines = lines;
    const firstLine = lines[0].toLowerCase();
    if (firstLine.includes('account') || firstLine.includes('data') || firstLine.includes('email') || firstLine === 'username:password') {
      dataLines = lines.slice(1);
    }

    const insertItem = db.prepare(`
      INSERT INTO inventory (id, product_id, account_data, status) VALUES (?, ?, ?, 'available')
    `);

    const importAll = db.transaction(() => {
      let count = 0;
      for (const line of dataLines) {
        insertItem.run(uuidv4(), productId, line);
        count++;
      }
      // Update product stock
      db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(count, productId);
      return count;
    });

    const imported = importAll();

    return NextResponse.json({
      success: true,
      imported,
      message: `นำเข้า ${imported} รายการสำเร็จ / Imported ${imported} items`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
