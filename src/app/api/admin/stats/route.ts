import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const db = getDb();

    // Stats
    const totalRevenueResult = db.prepare("SELECT SUM(final_amount) as total FROM orders WHERE payment_status = 'paid'").get();
    const totalOrdersResult = db.prepare("SELECT count(*) as count FROM orders").get();
    const totalUsersResult = db.prepare("SELECT count(*) as count FROM users WHERE role = 'customer'").get();
    const activeProductsResult = db.prepare("SELECT count(*) as count FROM products WHERE active = 1").get();
    const lowStockProductsResult = db.prepare("SELECT count(*) as count FROM products WHERE stock <= 10").get();

    // Recent orders
    const recentOrders = db.prepare(`
      SELECT id, customer_name, customer_email, customer_phone, final_amount, order_status, payment_status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    // Users list
    const users = db.prepare(`
      SELECT id, name, email, phone, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    // Low stock items
    const lowStockItems = db.prepare(`
      SELECT id, name, slug, price, stock, active
      FROM products
      ORDER BY stock ASC
      LIMIT 20
    `).all();

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue: totalRevenueResult?.total || 0,
        totalOrders: totalOrdersResult?.count || 0,
        totalCustomers: totalUsersResult?.count || 0,
        activeProducts: activeProductsResult?.count || 0,
        lowStockCount: lowStockProductsResult?.count || 0,
      },
      recentOrders,
      users,
      lowStockItems,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
