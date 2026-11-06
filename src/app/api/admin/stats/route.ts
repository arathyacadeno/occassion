import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Stats from Neon PostgreSQL
    const totalRevenueResult = await sql`SELECT COALESCE(SUM(final_amount), 0) as total FROM orders WHERE payment_status = 'paid'`;
    const totalOrdersResult = await sql`SELECT count(*) as count FROM orders`;
    const totalUsersResult = await sql`SELECT count(*) as count FROM users WHERE role = 'customer'`;
    const activeProductsResult = await sql`SELECT count(*) as count FROM products WHERE active = 1`;
    const lowStockProductsResult = await sql`SELECT count(*) as count FROM products WHERE stock <= 10`;

    // Recent orders from Neon
    const recentOrders = await sql`
      SELECT id, customer_name, customer_email, customer_phone, final_amount, order_status, payment_status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `;

    // Users list (customers only)
    const users = await sql`
      SELECT id, name, email, phone, role, created_at
      FROM users
      WHERE role = 'customer'
      ORDER BY created_at DESC
      LIMIT 50
    `;

    // Low stock items
    const lowStockItems = await sql`
      SELECT id, name, slug, price, stock, active
      FROM products
      ORDER BY stock ASC
      LIMIT 20
    `;

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue: Number(totalRevenueResult[0]?.total) || 0,
        totalOrders: Number(totalOrdersResult[0]?.count) || 0,
        totalCustomers: Number(totalUsersResult[0]?.count) || 0,
        activeProducts: Number(activeProductsResult[0]?.count) || 0,
        lowStockCount: Number(lowStockProductsResult[0]?.count) || 0,
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
