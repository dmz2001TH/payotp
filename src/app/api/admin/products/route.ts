import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { adminProductSchema, validateRequest, validationErrorResponse } from '@/lib/validate';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const products = db.prepare(`
      SELECT p.*, c.name_th as cat_name_th, c.name_en as cat_name_en, c.slug as cat_slug,
      (SELECT COUNT(*) FROM inventory WHERE product_id = p.id AND status = 'available') as available_stock
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.active = 1
      ORDER BY p.sort_order ASC
    `).all();

    return NextResponse.json({ products });
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
    const body = await req.json();
    const validation = validateRequest(adminProductSchema, body);
    if (!validation.success) return validationErrorResponse(validation.error);

    const data = validation.data;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO products (id, category_id, name_th, name_en, name_zh, description_th, description_en, description_zh, price, original_price, stock, type, sort_order, image_url, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      id, data.category_id, data.name_th, data.name_en, data.name_zh,
      data.description_th, data.description_en, data.description_zh,
      data.price, data.original_price, data.stock, data.type,
      data.sort_order, data.image_url
    );

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const { id, ...fields } = data;

    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    }

    // Whitelist allowed fields
    const allowedFields = ['category_id', 'name_th', 'name_en', 'name_zh', 'description_th', 'description_en', 'description_zh', 'price', 'original_price', 'stock', 'type', 'sort_order', 'image_url', 'active'];
    const filteredFields: Record<string, any> = {};
    for (const key of allowedFields) {
      if (key in fields) filteredFields[key] = fields[key];
    }

    if (Object.keys(filteredFields).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const sets = Object.keys(filteredFields).map(k => `${k} = ?`).join(', ');
    const values = Object.values(filteredFields);

    db.prepare(`UPDATE products SET ${sets} WHERE id = ?`).run(...values, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    }
    db.prepare('UPDATE products SET active = 0 WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
