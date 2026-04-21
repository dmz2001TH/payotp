import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Total users
    const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;

    // Total orders & revenue
    const orderStats = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue
      FROM orders WHERE status = 'completed'
    `).get() as any;

    // Pending deposits
    const pendingDeposits = (db.prepare("SELECT COUNT(*) as c FROM deposits WHERE status IN ('pending', 'awaiting_confirm')").get() as any).c;

    // Recent orders (last 7 days)
    const recentOrders = db.prepare(`
      SELECT date(created_at) as date, COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue
      FROM orders
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date ASC
    `).all();

    // Low stock products (stock < 5)
    const lowStock = db.prepare(`
      SELECT p.id, p.name_th, p.stock, c.icon, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.active = 1 AND p.stock < 5
      ORDER BY p.stock ASC
    `).all();

    // Out of stock products
    const outOfStock = db.prepare(`
      SELECT COUNT(*) as c FROM products WHERE active = 1 AND stock = 0
    `).get() as any;

    // Top selling products
    const topProducts = db.prepare(`
      SELECT p.name_th, p.name_en, COUNT(o.id) as order_count, SUM(o.total_price) as total_revenue
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.status = 'completed'
      GROUP BY o.product_id
      ORDER BY order_count DESC
      LIMIT 10
    `).all();

    // New users (last 7 days)
    const newUsers = db.prepare(`
      SELECT date(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date ASC
    `).all();

    // Referral stats
    const referralStats = db.prepare(`
      SELECT COUNT(*) as total_referrals, COALESCE(SUM(total_earned), 0) as total_commission
      FROM referrals
    `).get() as any;

    return NextResponse.json({
      overview: {
        totalUsers,
        totalOrders: orderStats.count,
        totalRevenue: orderStats.revenue,
        pendingDeposits,
        outOfStock: outOfStock.c,
      },
      recentOrders,
      lowStock,
      topProducts,
      newUsers,
      referralStats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
