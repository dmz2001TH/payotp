import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let products;
    if (category && category !== 'all') {
      products = db.prepare(`
        SELECT p.*, c.slug as category_slug, c.icon as category_icon
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.active = 1 AND c.slug = ?
        ORDER BY p.sort_order ASC, p.created_at DESC
      `).all(category);
    } else {
      products = db.prepare(`
        SELECT p.*, c.slug as category_slug, c.icon as category_icon
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.active = 1
        ORDER BY p.sort_order ASC, p.created_at DESC
      `).all();
    }

    const categories = db.prepare('SELECT * FROM categories WHERE active = 1 ORDER BY sort_order ASC').all();

    return NextResponse.json({ products, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
