import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getAuthenticatedUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        {
          status: 403,
          headers: { "Cache-Control": "no-store, max-age=0" },
        }
      );
    }

    // Direct aggregation queries on Neon PostgreSQL (Single Source of Truth)
    const [
      totalRevenueResult,
      totalOrdersResult,
      activeProductsResult,
      totalUsersResult,
      lowStockProductsResult,
      recentOrders,
      users,
      lowStockItems,
    ] = await Promise.all([
      // 1. Total Paid Revenue:
      // Strictly includes confirmed paid orders only (payment_status IN ('paid', 'success'))
      // Excludes pending, failed, cancelled, and refunded orders
      sql`
        SELECT COALESCE(SUM(final_amount), 0) AS total
        FROM orders
        WHERE LOWER(TRIM(payment_status)) IN ('paid', 'success')
          AND LOWER(TRIM(order_status)) NOT IN ('cancelled', 'failed', 'refunded')
      `,

      // 2. Total Orders Placed:
      // Counts all unique customer orders placed in the database
      sql`
        SELECT COUNT(DISTINCT id) AS count
        FROM orders
      `,

      // 3. Active Catalog Products:
      // Counts only active (active = 1) and published products, excluding draft/unpublished/inactive
      sql`
        SELECT COUNT(DISTINCT id) AS count
        FROM products
        WHERE active = 1
          AND LOWER(TRIM(COALESCE(status, 'published'))) = 'published'
      `,

      // 4. Registered Customers:
      // Counts unique customer accounts only, strictly excluding admin and staff accounts
      sql`
        SELECT COUNT(DISTINCT id) AS count
        FROM users
        WHERE LOWER(TRIM(role)) = 'customer'
          AND LOWER(TRIM(role)) NOT IN ('admin', 'staff', 'superadmin')
      `,

      // Low stock count (active published products with stock <= 10)
      sql`
        SELECT COUNT(DISTINCT id) AS count
        FROM products
        WHERE active = 1
          AND LOWER(TRIM(COALESCE(status, 'published'))) = 'published'
          AND stock <= 10
      `,

      // Recent orders list (latest 10)
      sql`
        SELECT id, customer_name, customer_email, customer_phone, final_amount, order_status, payment_status, created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 10
      `,

      // Registered customers list (latest 50, customers only)
      sql`
        SELECT id, name, email, phone, role, created_at
        FROM users
        WHERE LOWER(TRIM(role)) = 'customer'
          AND LOWER(TRIM(role)) NOT IN ('admin', 'staff', 'superadmin')
        ORDER BY created_at DESC
        LIMIT 50
      `,

      // Low stock items list (active products with stock <= 10)
      sql`
        SELECT id, name, slug, price, stock, active
        FROM products
        WHERE active = 1 AND stock <= 10
        ORDER BY stock ASC
        LIMIT 20
      `,
    ]);

    const totalRevenue = Number(totalRevenueResult[0]?.total) || 0;
    const totalOrders = Number(totalOrdersResult[0]?.count) || 0;
    const activeProducts = Number(activeProductsResult[0]?.count) || 0;
    const totalCustomers = Number(totalUsersResult[0]?.count) || 0;
    const lowStockCount = Number(lowStockProductsResult[0]?.count) || 0;

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalRevenue,
          totalOrders,
          activeProducts,
          totalCustomers,
          lowStockCount,
        },
        recentOrders: recentOrders || [],
        users: users || [],
        lowStockItems: lowStockItems || [],
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin stats" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }
}
